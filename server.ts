import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import serverless from "serverless-http";

dotenv.config();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

const app = express();
app.use(express.json());

// --- AI ORCHESTRATOR API ---
app.post("/api/chat", async (req, res) => {
  try {
    const { history, newMessage } = req.body;
    
    // In AI Studio, GEMINI_API_KEY might be provided automatically.
    // In Netlify, it must be set in the environment.
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: "GEMINI_API_KEY is not configured on the server. Please add it to your environment variables." 
      });
    }

const ai = new GoogleGenAI({ apiKey });

    // Define tools for the Lead Orchestrator
    const tools = [
      {
        functionDeclarations: [
          {
            name: "plan_project",
            description: "Analyzes project requirements and creates a technical plan including database needs and architecture.",
            parameters: {
              type: "OBJECT",
              properties: {
                projectName: { type: "STRING" },
                requirements: { type: "STRING" },
                techStack: { type: "STRING", enum: ["React + Vite", "Next.js", "Express + React"] }
              },
              required: ["projectName", "requirements"]
            }
          },
          {
            name: "provision_resources",
            description: "Autonomous provisioning of GitHub repository, Supabase database, and Netlify site.",
            parameters: {
              type: "OBJECT",
              properties: {
                projectId: { type: "STRING" },
                githubRepoName: { type: "STRING" },
                databaseRequired: { type: "BOOLEAN" },
                netlifySiteName: { type: "STRING" }
              },
              required: ["projectId", "githubRepoName"]
            }
          },
          {
            name: "commit_and_deploy",
            description: "Commits code to GitHub and triggers a Netlify deployment.",
            parameters: {
              type: "OBJECT",
              properties: {
                projectId: { type: "STRING" },
                commitMessage: { type: "STRING" },
                branch: { type: "STRING" }
              },
              required: ["projectId", "commitMessage"]
            }
          },
          {
            name: "audit_action",
            description: "Records a high-impact action in the platform audit log.",
            parameters: {
              type: "OBJECT",
              properties: {
                action: { type: "STRING" },
                details: { type: "STRING" },
                target: { type: "STRING" }
              },
              required: ["action", "details"]
            }
          }
        ]
      }
    ];
    
    // We use the Interactions API for agentic behavior
    const interaction = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: newMessage,
      tools: tools as any,
      system_instruction: `You are the Lead Orchestrator Agent for a personal SaaS development suite.
      Your mission is to assist in the design, development, and deployment of web applications targeting Netlify.
      
      PLATFORM CAPABILITIES:
      1. Database: You have access to a real Supabase (PostgreSQL) database.
      2. Deployment: You can trigger Netlify builds and manage site configurations.
      3. Orchestration: You act as a lead architect, breaking down complex requirements for specialized sub-agents.
      
      GOALS:
      - Avoid placeholders. Use real data from the database.
      - All code must be production-ready and scalable.
      - Maintain audit logs for all high-impact actions.
      - When a project is planned, use 'plan_project'.
      - When provisioning resources, use 'provision_resources'.
      - When deploying code, use 'commit_and_deploy'.`
    });

    // Handle tool calls in steps
    // Note: interactions API handles some tool execution logic internally if tools are provided
    // but we might need to process the output or handle custom tool logic here.
    
    let fullOutput = "";
    for (const step of interaction.steps) {
      if (step.type === 'model_output') {
        const textContent = (step as any).content?.find((c: any) => c.type === 'text');
        if (textContent && textContent.text) {
          fullOutput += textContent.text;
        }
      } else if (step.type === 'function_call') {
        // Implement real tool logic here
        const toolCalls = (step as any).function_calls;
        for (const call of toolCalls) {
          console.log(`Executing tool: ${call.name}`, call.args);
          
          if (call.name === "plan_project") {
            // Real logic from dbIntelligence.ts can be moved here or called
            // For now we'll simulate the execution result but return it to the model
          }
          // The interactions API will wait for tool results if we were using a session
          // but here we are returning the final output.
        }
      }
    }

    
    res.json({ 
      role: "model",
      parts: [{ text: fullOutput }],
      timestamp: new Date()
    });
  } catch (error: any) {
    console.error("Server AI Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// --- PLATFORM DATABASE API ---
app.get("/api/projects", async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/projects", async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const project = req.body;
  const { data, error } = await supabase.from("projects").insert([project]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/audit-logs", async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/audit-logs", async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const log = req.body;
  const { data, error } = await supabase.from("audit_logs").insert([log]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Local Development Fallback
if (process.env.NODE_ENV !== "production") {
  async function startDevServer() {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    const PORT = 3000;
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development server running on http://localhost:${PORT}`);
    });
  }
  startDevServer();
}

// Export as Netlify function
export const handler = serverless(app);
