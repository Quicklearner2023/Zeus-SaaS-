import { GoogleGenAI } from "@google/genai";
export type AIProvider = "gemini" | "openai" | "anthropic";

export interface ProviderTool {
  type: "function";
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface AgentResult {
  text: string;
  rounds: number;
  provider: AIProvider;
  model: string;
}

function jsonArgs(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object") return value as Record<string, unknown>;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  }
  return {};
}

function textFromOpenAI(output: any[]): string {
  return output
    .filter((item) => item?.type === "message")
    .flatMap((item) => item?.content || [])
    .filter((part: any) => part?.type === "output_text")
    .map((part: any) => part.text || "")
    .join("");
}

function textFromAnthropic(content: any[]): string {
  return content
    .filter((part) => part?.type === "text")
    .map((part) => part.text || "")
    .join("");
}

async function requestJson(url: string, init: RequestInit, provider: string) {
  const response = await fetch(url, init);
  const raw = await response.text();
  let body: any = null;
  try { body = raw ? JSON.parse(raw) : null; } catch { body = raw; }
  if (!response.ok) {
    const message = body?.error?.message || body?.message || `${provider} API returned ${response.status}`;
    throw new Error(`${provider}: ${message}`);
  }
  return body;
}

export function configuredProviders(env: NodeJS.ProcessEnv = process.env) {
  return {
    gemini: Boolean(env.GEMINI_API_KEY),
    openai: Boolean(env.OPENAI_API_KEY),
    anthropic: Boolean(env.ANTHROPIC_API_KEY)
  };
}

export function resolveProvider(env: NodeJS.ProcessEnv = process.env): AIProvider {
  const requested = String(env.AI_PROVIDER || "").toLowerCase();
  if (requested === "openai" && env.OPENAI_API_KEY) return "openai";
  if (requested === "anthropic" && env.ANTHROPIC_API_KEY) return "anthropic";
  if (requested === "gemini" && env.GEMINI_API_KEY) return "gemini";
  if (env.GEMINI_API_KEY) return "gemini";
  if (env.OPENAI_API_KEY) return "openai";
  if (env.ANTHROPIC_API_KEY) return "anthropic";
  throw new Error("No AI provider is configured. Set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY.");
}

function openAITools(tools: ProviderTool[]) {
  return tools.map((tool) => ({
    type: "function",
    name: tool.name,
    description: tool.description || "",
    parameters: tool.parameters || { type: "object", properties: {} }
  }));
}

function anthropicTools(tools: ProviderTool[]) {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description || "",
    input_schema: tool.parameters || { type: "object", properties: {} }
  }));
}

export async function runProviderAgent(options: {
  provider: AIProvider;
  model: string;
  apiKey: string;
  input: string;
  systemInstruction: string;
  tools: ProviderTool[];
  executeTool: (name: string, args: Record<string, any>) => Promise<any>;
  maxToolRounds?: number;
}): Promise<AgentResult> {
  const maxRounds = options.maxToolRounds ?? 8;

  if (options.provider === "openai") {
    let previousResponseId: string | undefined;
    let input: any[] | string = [{ role: "user", content: options.input }];

    for (let round = 1; round <= maxRounds; round++) {
      const body: any = {
        model: options.model,
        instructions: options.systemInstruction,
        input,
        tools: openAITools(options.tools)
      };
      if (previousResponseId) {
        delete body.instructions;
        body.previous_response_id = previousResponseId;
      }

      const response = await requestJson("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      }, "OpenAI");

      const calls: ToolCall[] = (response.output || [])
        .filter((item: any) => item?.type === "function_call")
        .map((item: any) => ({
          id: String(item.call_id || item.id),
          name: String(item.name),
          args: jsonArgs(item.arguments)
        }));

      if (!calls.length) {
        return {
          text: textFromOpenAI(response.output || []) || "The orchestrator completed the request without a text response.",
          rounds: round,
          provider: options.provider,
          model: options.model
        };
      }

      const results: any[] = [];
      for (const call of calls) {
        try {
          const result = await options.executeTool(call.name, call.args);
          results.push({
            type: "function_call_output",
            call_id: call.id,
            output: JSON.stringify(result)
          });
        } catch (error: any) {
          results.push({
            type: "function_call_output",
            call_id: call.id,
            output: JSON.stringify({ success: false, code: "TOOL_EXECUTION_ERROR", message: error?.message || "Tool execution failed." })
          });
        }
      }

      previousResponseId = response.id;
      input = results;
    }

    throw new Error("AI tool loop exceeded the configured maximum rounds.");
  }

  if (options.provider === "anthropic") {
    const messages: any[] = [{ role: "user", content: options.input }];

    for (let round = 1; round <= maxRounds; round++) {
      const response = await requestJson("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": options.apiKey,
          "anthropic-version": "2023-06-01",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: 8192,
          system: options.systemInstruction,
          messages,
          tools: anthropicTools(options.tools)
        })
      }, "Anthropic");

      const calls: ToolCall[] = (response.content || [])
        .filter((part: any) => part?.type === "tool_use")
        .map((part: any) => ({
          id: String(part.id),
          name: String(part.name),
          args: jsonArgs(part.input)
        }));

      if (!calls.length || response.stop_reason !== "tool_use") {
        return {
          text: textFromAnthropic(response.content || []) || "The orchestrator completed the request without a text response.",
          rounds: round,
          provider: options.provider,
          model: options.model
        };
      }

      messages.push({ role: "assistant", content: response.content || [] });
      const results = [];
      for (const call of calls) {
        try {
          const result = await options.executeTool(call.name, call.args);
          results.push({ type: "tool_result", tool_use_id: call.id, content: JSON.stringify(result) });
        } catch (error: any) {
          results.push({
            type: "tool_result",
            tool_use_id: call.id,
            is_error: true,
            content: JSON.stringify({ success: false, code: "TOOL_EXECUTION_ERROR", message: error?.message || "Tool execution failed." })
          });
        }
      }
      messages.push({ role: "user", content: results });
    }

    throw new Error("AI tool loop exceeded the configured maximum rounds.");
  }

  const ai = new GoogleGenAI({ apiKey: options.apiKey });
  let interaction = await ai.interactions.create({
    model: options.model,
    input: options.input,
    tools: options.tools,
    system_instruction: options.systemInstruction
  });

  for (let round = 1; round <= maxRounds; round++) {
    const calls: ToolCall[] = (interaction.steps || [])
      .filter((step: any) => step?.type === "function_call")
      .map((step: any) => ({
        id: String(step.id),
        name: String(step.name),
        args: jsonArgs(step.arguments ?? step.args)
      }));

    if (!calls.length) {
      const text = typeof (interaction as any).output_text === "string"
        ? (interaction as any).output_text
        : (interaction.steps || [])
            .filter((step: any) => step?.type === "model_output")
            .flatMap((step: any) => step?.content || [])
            .filter((part: any) => part?.type === "text")
            .map((part: any) => part.text || "")
            .join("");
      return {
        text: text || "The orchestrator completed the request without a text response.",
        rounds: round,
        provider: options.provider,
        model: options.model
      };
    }

    const results = [];
    for (const call of calls) {
      try {
        const result = await options.executeTool(call.name, call.args);
        results.push({
          type: "function_result",
          name: call.name,
          call_id: call.id,
          result: [{ type: "text", text: JSON.stringify(result) }]
        });
      } catch (error: any) {
        results.push({
          type: "function_result",
          name: call.name,
          call_id: call.id,
          result: [{
            type: "text",
            text: JSON.stringify({
              success: false,
              code: "TOOL_EXECUTION_ERROR",
              message: error?.message || "Tool execution failed."
            })
          }]
        });
      }
    }

    interaction = await ai.interactions.create({
      model: options.model,
      previous_interaction_id: interaction.id,
      input: results,
      tools: options.tools,
      system_instruction: options.systemInstruction
    });
  }

  throw new Error("AI tool loop exceeded the configured maximum rounds.");
}
