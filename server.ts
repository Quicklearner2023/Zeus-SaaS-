import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import serverless from "serverless-http";
import { evaluateDatabaseRequirements } from "./src/services/dbIntelligence";
import { configuredProviders, resolveProvider, runProviderAgent } from "./src/services/aiProviders";

dotenv.config();

// Initialize Supabase Admin Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey) 
  : null;

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

app.get("/api/integrations/status", async (req, res) => {
  const status: any = {
    timestamp: new Date().toISOString(),
    ai: configuredProviders(),
    gemini: !!process.env.GEMINI_API_KEY,
    github: { configured: !!process.env.GITHUB_TOKEN },
    netlify: { configured: !!process.env.NETLIFY_AUTH_TOKEN, siteConfigured: !!process.env.NETLIFY_SITE_ID },
    supabase: { configured: !!supabaseUrl && !!supabaseServiceKey }
  };

  try {
    if (process.env.GITHUB_TOKEN) {
      const user = await githubRequest("/user");
      status.github = { configured: true, connected: true, login: user.login, name: user.name || user.login };
    }
  } catch (e: any) {
    status.github = { configured: true, connected: false, error: e?.message || "GitHub connection failed" };
  }

  try {
    if (process.env.NETLIFY_AUTH_TOKEN && process.env.NETLIFY_SITE_ID) {
      const site = await getNetlifySite();
      const deploy = await getNetlifyDeploy(String(site.id));
      status.netlify = {
        configured: true, connected: true,
        siteId: site.id, name: site.name, url: site.ssl_url || site.url || null,
        state: site.state || null, adminUrl: site.admin_url || null,
        latestDeploy: deploy ? { id: deploy.id, state: deploy.state, url: deploy.ssl_url || deploy.url || null, error: deploy.error_message || null, createdAt: deploy.created_at || null } : null
      };
    }
  } catch (e: any) {
    status.netlify = { configured: true, connected: false, error: e?.message || "Netlify connection failed" };
  }

  try {
    if (supabase) {
      const [projects, audits] = await Promise.all([
        supabase.from("projects").select("id", { count: "exact", head: true }),
        supabase.from("audit_logs").select("id", { count: "exact", head: true })
      ]);
      if (projects.error && projects.error.code !== "42P01") throw new Error(projects.error.message);
      if (audits.error && audits.error.code !== "42P01") throw new Error(audits.error.message);
      status.supabase = { configured: true, connected: true, projectCount: projects.count || 0, auditCount: audits.count || 0 };
    }
  } catch (e: any) {
    status.supabase = { configured: true, connected: false, error: e?.message || "Supabase connection failed" };
  }

  res.json(status);
});

app.get("/api/config-status", (req, res) => {
  const status = {
    ai: configuredProviders(),
    selectedProvider: (() => {
      try { return resolveProvider(); } catch { return null; }
    })(),
    github: !!process.env.GITHUB_TOKEN,
    netlify: !!process.env.NETLIFY_AUTH_TOKEN,
    netlify_site: !!process.env.NETLIFY_SITE_ID,
    supabase: !!process.env.SUPABASE_SERVICE_ROLE_KEY && !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
    timestamp: new Date()
  };
  res.json(status);
});

// --- AI ORCHESTRATOR API ---
const TOOL_DEFINITIONS = [
  {
    type: "function",
    name: "plan_project",
    description: "Analyzes project requirements and creates a technical plan including whether a database is required, recommended services, schema, migrations, and RBAC roles.",
    parameters: {
      type: "object",
      properties: {
        projectName: { type: "string", description: "Name of the project." },
        requirements: { type: "string", description: "The user's project requirements." },
        techStack: { type: "string", enum: ["React + Vite", "Next.js", "Express + React", "Static HTML"] }
      },
      required: ["projectName", "requirements"]
    }
  },
  {
    type: "function",
    name: "provision_resources",
    description: "Provisions project infrastructure. This tool is reserved for the GitHub, Supabase and Netlify execution layer.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        githubRepoName: { type: "string" },
        repositoryDescription: { type: "string" },
        privateRepository: { type: "boolean" },
        databaseRequired: { type: "boolean" },
        netlifySiteName: { type: "string" }
      },
      required: ["projectId", "githubRepoName"]
    }
  },
  {
    type: "function",
    name: "commit_and_deploy",
    description: "Commits project changes to GitHub and triggers a Netlify deployment. Reserved for the deployment execution layer.",
    parameters: {
      type: "object",
      properties: {
        projectId: { type: "string" },
        commitMessage: { type: "string" },
        branch: { type: "string" }
      },
      required: ["projectId", "commitMessage"]
    }
  },
  {
    type: "function",
    name: "github_write_file",
    description: "Creates or updates a file in an existing GitHub repository and commits the change. Use this to generate or edit project files.",
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        path: { type: "string" },
        content: { type: "string" },
        message: { type: "string" },
        branch: { type: "string" }
      },
      required: ["owner", "repo", "path", "content", "message"]
    }
  },
  {
    type: "function",
    name: "github_create_branch",
    description: "Creates a branch in an existing GitHub repository from the current default branch.",
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        branch: { type: "string" }
      },
      required: ["owner", "repo", "branch"]
    }
  },
  {
    type: "function",
    name: "github_create_pull_request",
    description: "Creates a pull request between two branches in a GitHub repository.",
    parameters: {
      type: "object",
      properties: {
        owner: { type: "string" },
        repo: { type: "string" },
        title: { type: "string" },
        body: { type: "string" },
        head: { type: "string" },
        base: { type: "string" }
      },
      required: ["owner", "repo", "title", "head", "base"]
    }
  },
  {
    type: "function",
    name: "netlify_get_deploy",
    description: "Returns the current deployment status and URL for a Netlify site. Use after project files are committed to verify the real deployment.",
    parameters: {
      type: "object",
      properties: {
        siteId: { type: "string" },
        deployId: { type: "string" }
      },
      required: ["siteId"]
    }
  },
  {
    type: "function",
    name: "netlify_get_site",
    description: "Returns live information about the configured Netlify site.",
    parameters: {
      type: "object",
      properties: { siteId: { type: "string" } }
    }
  },
  {
    type: "function",
    name: "audit_action",
    description: "Records a high-impact action in the platform audit log.",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string" },
        details: { type: "string" },
        target: { type: "string" }
      },
      required: ["action", "details"]
    }
  }
] as any[];


async function githubRequest(pathname: string, init: RequestInit = {}) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is not configured on the server.");
  const response = await fetch(`https://api.github.com${pathname}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  const body = await response.text();
  let data: any = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) {
    const detail = data?.message || `GitHub API returned ${response.status}`;
    throw new Error(`GitHub: ${detail}`);
  }
  return data;
}

async function netlifyRequest(pathname: string, init: RequestInit = {}) {
  const token = process.env.NETLIFY_AUTH_TOKEN;
  if (!token) throw new Error("NETLIFY_AUTH_TOKEN is not configured on the server.");
  const response = await fetch(`https://api.netlify.com${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });
  const body = await response.text();
  let data: any = null;
  try { data = body ? JSON.parse(body) : null; } catch { data = body; }
  if (!response.ok) {
    const detail = data?.message || data?.error || `Netlify API returned ${response.status}`;
    throw new Error(`Netlify: ${detail}`);
  }
  return data;
}

async function getProjectRecord(projectId: string) {
  if (!supabase || !projectId) return null;
  const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).maybeSingle();
  if (error) throw new Error(`Project lookup failed: ${error.message}`);
  return data;
}

async function getGitHubRepository(owner: string, repo: string) {
  try {
    return await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  } catch (error: any) {
    if (String(error?.message || "").includes("Not Found")) return null;
    throw error;
  }
}

async function createGitHubRepository(name: string, description = "Created by Zeus Orchestrator", isPrivate = true) {
  return githubRequest("/user/repos", {
    method: "POST",
    body: JSON.stringify({ name, description, private: isPrivate, auto_init: true })
  });
}

async function createNetlifyDeployKey() {
  return netlifyRequest("/api/v1/deploy_keys", { method: "POST" });
}

async function createNetlifySite(name: string | undefined, repo?: {
  provider: "github";
  id: number;
  repo: string;
  private: boolean;
  branch: string;
  cmd: string;
  dir: string;
  deploy_key_id: string;
}) {
  const payload: any = {};
  if (name) payload.name = name;
  if (repo) payload.repo = repo;
  return netlifyRequest("/api/v1/sites", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

async function githubAddDeployKey(owner: string, repo: string, title: string, key: string) {
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/keys`, {
    method: "POST",
    body: JSON.stringify({ title, key, read_only: true })
  });
}

async function githubCreateNetlifyWebhook(owner: string, repo: string) {
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/hooks`, {
    method: "POST",
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["push", "pull_request"],
      config: {
        url: "https://api.netlify.com/hooks/github",
        content_type: "json",
        insecure_ssl: "0"
      }
    })
  });
}

async function getNetlifyDeploy(siteId: string, deployId?: string) {
  const path = deployId
    ? `/api/v1/sites/${encodeURIComponent(siteId)}/deploys/${encodeURIComponent(deployId)}`
    : `/api/v1/sites/${encodeURIComponent(siteId)}/deploys?per_page=1`;
  const data = await netlifyRequest(path);
  return deployId ? data : Array.isArray(data) ? data[0] : data;
}

async function githubGetFile(owner: string, repo: string, path: string, branch?: string) {
  const query = branch ? `?ref=${encodeURIComponent(branch)}` : "";
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${path.split("/").map(encodeURIComponent).join("/")}${query}`);
}

async function githubWriteFile(owner: string, repo: string, filePath: string, content: string, message: string, branch?: string) {
  let sha: string | undefined;
  try {
    const existing = await githubGetFile(owner, repo, filePath, branch);
    if (existing?.sha) sha = existing.sha;
  } catch (error: any) {
    if (!String(error?.message || "").includes("Not Found")) throw error;
  }

  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`, {
    method: "PUT",
    body: JSON.stringify({
      message,
      content: Buffer.from(content, "utf8").toString("base64"),
      ...(sha ? { sha } : {}),
      ...(branch ? { branch } : {})
    })
  });
}

async function githubCreateBranch(owner: string, repo: string, branch: string) {
  const repository = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
  const base = await githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/ref/heads/${encodeURIComponent(repository.default_branch)}`);
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/git/refs`, {
    method: "POST",
    body: JSON.stringify({ ref: `refs/heads/${branch}`, sha: base.object.sha })
  });
}

async function githubCreatePullRequest(owner: string, repo: string, title: string, body: string, head: string, base: string) {
  return githubRequest(`/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/pulls`, {
    method: "POST",
    body: JSON.stringify({ title, body, head, base })
  });
}

async function getNetlifySite(siteId?: string) {
  const id = siteId || process.env.NETLIFY_SITE_ID;
  if (!id) throw new Error("NETLIFY_SITE_ID is not configured on the server.");
  return netlifyRequest(`/api/v1/sites/${encodeURIComponent(id)}`);
}

const HIGH_RISK_TOOLS = new Set(["provision_resources", "commit_and_deploy", "github_create_pull_request"]);

function isHighRiskArgs(name: string, args: Record<string, any>) {
  if (name === "github_write_file") {
    const path = String(args.path || "").toLowerCase();
    return path.includes(".github/workflows/") || path.includes("package.json") || path.includes("netlify.toml");
  }
  return HIGH_RISK_TOOLS.has(name);
}

async function executeTool(name: string, args: Record<string, any>) {
  if (isHighRiskArgs(name, args) && process.env.ZEUS_REQUIRE_APPROVAL === "true" && !args.approvalToken) {
    return { success: false, code: "APPROVAL_REQUIRED", message: "This high-impact action requires approval before execution.", action: name };
  }
  switch (name) {
    case "plan_project": {
      const projectName = String(args.projectName || "Untitled Project");
      const requirements = String(args.requirements || "");
      const decision = evaluateDatabaseRequirements(projectName, requirements);

      // Persist the plan when the platform database is configured. Failure to persist
      // should not turn a valid planning operation into a fake success.
      let persistedProject: any = null;
      if (supabase) {
        const projectPayload = {
          id: decision.projectId,
          name: decision.projectName,
          description: requirements,
          framework: args.techStack || "React + Vite",
          database_required: decision.databaseRequired,
          database_provider: decision.recommendedProvider,
          database_status: decision.databaseRequired ? "Pending Approval" : "Not Required"
        };
        const { data, error } = await supabase
          .from("projects")
          .upsert(projectPayload, { onConflict: "id" })
          .select()
          .single();
        if (error) throw new Error(`Project persistence failed: ${error.message}`);
        persistedProject = data;
      }

      return {
        success: true,
        project: persistedProject || {
          id: decision.projectId,
          name: decision.projectName,
          description: requirements
        },
        databaseDecision: decision,
        message: decision.databaseRequired
          ? `Project planned. Supabase is required; recommended roles: ${decision.projectRbacRoles.join(", ")}.`
          : "Project planned as a static/client-side project; no database is required."
      };
    }

    case "audit_action": {
      if (!supabase) {
        throw new Error("Supabase is not configured; cannot persist the audit action.");
      }
      const { data, error } = await supabase.from("audit_logs").insert([{
        user_id: null,
        user_name: "Lead Architect",
        action: String(args.action),
        target_type: "system",
        target_name: String(args.target || "Orchestrator"),
        details: String(args.details),
        timestamp: new Date().toISOString()
      }]).select().single();
      if (error) throw new Error(`Audit log failed: ${error.message}`);
      return { success: true, auditLog: data };
    }

    case "github_write_file": {
      const result = await githubWriteFile(
        String(args.owner), String(args.repo), String(args.path), String(args.content),
        String(args.message), args.branch ? String(args.branch) : undefined
      );
      return { success: true, repository: `${args.owner}/${args.repo}`, path: args.path, commit: result.commit?.html_url || result.commit?.sha, message: "File committed successfully." };
    }

    case "github_create_branch": {
      const result = await githubCreateBranch(String(args.owner), String(args.repo), String(args.branch));
      return { success: true, branch: args.branch, ref: result.ref, message: "Branch created successfully." };
    }

    case "github_create_pull_request": {
      const result = await githubCreatePullRequest(String(args.owner), String(args.repo), String(args.title), String(args.body || ""), String(args.head), String(args.base));
      return { success: true, pullRequest: { number: result.number, url: result.html_url, state: result.state }, message: "Pull request created successfully." };
    }

    case "netlify_get_deploy": {
      const siteId = String(args.siteId || process.env.NETLIFY_SITE_ID || "");
      if (!siteId) throw new Error("siteId is required or NETLIFY_SITE_ID must be configured.");
      const deploy = await getNetlifyDeploy(siteId, args.deployId ? String(args.deployId) : undefined);
      if (!deploy) return { success: true, deploy: null, message: "No deployments found for this site yet." };
      return {
        success: true,
        deploy: {
          id: deploy.id,
          state: deploy.state,
          url: deploy.ssl_url || deploy.url || null,
          deployUrl: deploy.deploy_ssl_url || deploy.deploy_url || null,
          error: deploy.error_message || null,
          createdAt: deploy.created_at || null,
          updatedAt: deploy.updated_at || null,
          publishedAt: deploy.published_at || null,
          commitRef: deploy.commit_ref || null,
          commitUrl: deploy.commit_url || null
        }
      };
    }

    case "netlify_get_site": {
      const site = await getNetlifySite(args.siteId ? String(args.siteId) : undefined);
      return { success: true, site: { id: site.id, name: site.name, url: site.ssl_url || site.url, state: site.state, adminUrl: site.admin_url, repo: site.build_settings?.repo_url || null } };
    }

    case "provision_resources": {
      const projectId = String(args.projectId || "");
      const repoName = String(args.githubRepoName || "").trim();
      if (!repoName) throw new Error("githubRepoName is required.");

      const existingProject = await getProjectRecord(projectId);
      const configuredOwner = String(existingProject?.github_repo_name || "").split("/")[0];
      const owner = configuredOwner || (await githubRequest("/user")).login;
      let githubRepo = null;

      if (existingProject?.github_repo_name) {
        const parts = String(existingProject.github_repo_name).split("/");
        githubRepo = await getGitHubRepository(parts[0], parts[1]);
      }
      if (!githubRepo) {
        githubRepo = await getGitHubRepository(owner, repoName);
      }
      if (!githubRepo) {
        githubRepo = await createGitHubRepository(
          repoName,
          String(args.repositoryDescription || `Zeus project ${projectId || repoName}`),
          args.privateRepository !== false
        );
      }

      const resolvedOwner = githubRepo.owner?.login || owner;
      let netlifySite: any = null;
      let deployKey: any = null;
      let webhook: any = null;
      const existingSiteId = existingProject?.netlify_site_id ? String(existingProject.netlify_site_id) : "";

      if (existingSiteId) {
        try {
          netlifySite = await getNetlifySite(existingSiteId);
        } catch (error: any) {
          console.warn("[provision] stored Netlify site is unavailable:", error?.message || error);
        }
      }

      if (!netlifySite && args.netlifySiteName) {
        try {
          deployKey = await createNetlifyDeployKey();
          if (!deployKey?.id || !deployKey?.public_key) {
            throw new Error("Netlify did not return a usable deploy key.");
          }

          await githubAddDeployKey(
            resolvedOwner,
            githubRepo.name,
            `Netlify - ${args.netlifySiteName}`,
            deployKey.public_key
          );

          netlifySite = await createNetlifySite(String(args.netlifySiteName), {
            provider: "github",
            id: githubRepo.id,
            repo: githubRepo.full_name,
            private: githubRepo.private,
            branch: githubRepo.default_branch || "main",
            cmd: "npm run build",
            dir: "dist",
            deploy_key_id: deployKey.id
          });

          try {
            webhook = await githubCreateNetlifyWebhook(resolvedOwner, githubRepo.name);
          } catch (hookError: any) {
            console.warn("[provision] Netlify GitHub webhook could not be created:", hookError?.message || hookError);
          }
        } catch (error: any) {
          const message = error?.message || "Netlify provisioning failed.";
          if (supabase && projectId) {
            await supabase.from("projects").update({
              github_repo_url: githubRepo.html_url,
              github_repo_name: githubRepo.full_name,
              infrastructure_status: "Partially Provisioned"
            }).eq("id", projectId);
            await supabase.from("audit_logs").insert([{
              user_id: null,
              user_name: "Lead Architect",
              action: "PROVISION_RESOURCES_PARTIAL",
              target_type: "project",
              target_name: projectId || repoName,
              details: JSON.stringify({ githubRepo: githubRepo.full_name, error: message }),
              timestamp: new Date().toISOString()
            }]);
          }
          return {
            success: false,
            code: "PARTIAL_PROVISIONING",
            projectId,
            github: {
              id: githubRepo.id,
              name: githubRepo.full_name,
              url: githubRepo.html_url,
              private: githubRepo.private,
              defaultBranch: githubRepo.default_branch
            },
            netlify: null,
            message: `GitHub was provisioned, but Netlify provisioning did not complete: ${message}`
          };
        }
      }

      if (supabase && projectId) {
        const { data, error } = await supabase.from("projects").update({
          github_repo_url: githubRepo.html_url,
          github_repo_name: githubRepo.full_name,
          netlify_site_id: netlifySite?.id || null,
          netlify_site_url: netlifySite?.ssl_url || netlifySite?.url || null,
          infrastructure_status: netlifySite ? "Provisioned" : "GitHub Provisioned"
        }).eq("id", projectId).select().maybeSingle();
        if (error) throw new Error(`Project metadata update failed: ${error.message}`);

        await supabase.from("audit_logs").insert([{
          user_id: null,
          user_name: "Lead Architect",
          action: "PROVISION_RESOURCES",
          target_type: "project",
          target_name: projectId || repoName,
          details: JSON.stringify({
            githubRepo: githubRepo.full_name,
            netlifySiteId: netlifySite?.id || null,
            netlifyLinked: !!netlifySite,
            webhookCreated: !!webhook,
            reused: !!existingProject
          }),
          timestamp: new Date().toISOString()
        }]);

        return {
          success: true,
          projectId,
          github: {
            id: githubRepo.id,
            name: githubRepo.full_name,
            owner: resolvedOwner,
            url: githubRepo.html_url,
            private: githubRepo.private,
            defaultBranch: githubRepo.default_branch
          },
          netlify: netlifySite ? {
            id: netlifySite.id,
            name: netlifySite.name,
            url: netlifySite.ssl_url || netlifySite.url,
            linkedRepository: githubRepo.full_name,
            branch: githubRepo.default_branch || "main",
            deployKeyConfigured: !!deployKey || !!existingSiteId,
            webhookConfigured: !!webhook
          } : null,
          project: data,
          message: netlifySite
            ? "Infrastructure is provisioned. Existing resources were reused when available; verify the resulting deployment after project files are committed."
            : "GitHub infrastructure is provisioned."
        };
      }

      return {
        success: true,
        projectId,
        github: {
          id: githubRepo.id,
          name: githubRepo.full_name,
          owner: resolvedOwner,
          url: githubRepo.html_url,
          private: githubRepo.private,
          defaultBranch: githubRepo.default_branch
        },
        netlify: netlifySite ? {
          id: netlifySite.id,
          name: netlifySite.name,
          url: netlifySite.ssl_url || netlifySite.url
        } : null,
        message: "Infrastructure is provisioned. Configure Supabase to persist project metadata and audit history."
      };
    }

    case "commit_and_deploy": {
      const projectId = String(args.projectId || "");
      const branch = String(args.branch || "").trim();
      const project = await getProjectRecord(projectId);

      let siteId = project?.netlify_site_id ? String(project.netlify_site_id) : "";
      if (!siteId && process.env.NETLIFY_SITE_ID) siteId = String(process.env.NETLIFY_SITE_ID);
      if (!siteId) throw new Error("No Netlify site is associated with this project.");

      const site = await getNetlifySite(siteId);
      const deploy = await getNetlifyDeploy(site.id);
      const state = String(deploy?.state || "unknown").toLowerCase();
      const ready = ["ready", "processed"].includes(state);
      const failed = ["error", "retrying"].includes(state);

      if (supabase && projectId) {
        await supabase.from("projects").update({
          netlify_site_id: site.id,
          netlify_site_url: site.ssl_url || site.url || null,
          infrastructure_status: failed ? "Deployment Failed" : ready ? "Deployed" : "Deployment In Progress"
        }).eq("id", projectId);

        await supabase.from("audit_logs").insert([{
          user_id: null,
          user_name: "Lead Architect",
          action: "VERIFY_DEPLOYMENT",
          target_type: "netlify",
          target_name: site.name || site.id,
          details: JSON.stringify({
            projectId,
            branch: branch || null,
            commitMessage: String(args.commitMessage || ""),
            deployId: deploy?.id || null,
            state
          }),
          timestamp: new Date().toISOString()
        }]);
      }

      return {
        success: !failed,
        code: ready ? "DEPLOYMENT_READY" : failed ? "DEPLOYMENT_FAILED" : "DEPLOYMENT_IN_PROGRESS",
        site: {
          id: site.id,
          name: site.name,
          url: site.ssl_url || site.url || null,
          state: site.state || null
        },
        deploy: deploy ? {
          id: deploy.id,
          state,
          url: deploy.ssl_url || deploy.url || null,
          deployUrl: deploy.deploy_ssl_url || deploy.deploy_url || null,
          error: deploy.error_message || null,
          commitRef: deploy.commit_ref || null,
          commitUrl: deploy.commit_url || null
        } : null,
        message: ready
          ? "The latest real Netlify deployment is ready."
          : failed
            ? `The latest Netlify deployment failed: ${deploy?.error_message || "unknown Netlify error"}`
            : `The latest Netlify deployment is currently ${state}.`
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function extractText(interaction: any): string {
  if (typeof interaction?.output_text === "string" && interaction.output_text.trim()) {
    return interaction.output_text;
  }
  let text = "";
  for (const step of interaction?.steps || []) {
    if (step.type === "model_output") {
      for (const part of step.content || []) {
        if (part.type === "text" && part.text) text += part.text;
      }
    }
  }
  return text;
}

// --- AI ORCHESTRATOR API ---
app.post("/api/chat", async (req, res) => {
  try {
    const { newMessage } = req.body || {};
    if (!newMessage || typeof newMessage !== "string") {
      return res.status(400).json({ error: "newMessage is required." });
    }

    const provider = resolveProvider();
    const apiKey = provider === "gemini"
      ? process.env.GEMINI_API_KEY
      : provider === "openai"
        ? process.env.OPENAI_API_KEY
        : process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: `AI provider "${provider}" is selected but its API key is not configured.`
      });
    }

    const models: Record<string, string> = {
      gemini: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      openai: process.env.OPENAI_MODEL || "gpt-5-mini",
      anthropic: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5"
    };

    const systemInstruction = `You are the Lead Orchestrator Agent for a personal SaaS development suite.
You plan, develop and deploy web applications.

IMPORTANT:
- Use tools when the user asks you to perform an action, not merely explain how to do it.
- Never claim an external operation succeeded unless the tool result says success=true.
- If a tool returns success=false, explain the limitation honestly.
- Use plan_project before making architectural/database decisions for a new project.
- Use audit_action for high-impact actions after they actually occur.
- Do not invent repositories, deployments, database resources, URLs, commits or pull requests.
- Prefer real data and real tool results over placeholder content.`;

    const result = await runProviderAgent({
      provider,
      model: models[provider],
      apiKey: String(apiKey),
      input: newMessage,
      systemInstruction,
      tools: TOOL_DEFINITIONS,
      executeTool,
      maxToolRounds: 8
    });

    res.json({
      role: "model",
      parts: [{ text: result.text }],
      timestamp: new Date().toISOString(),
      provider: result.provider,
      model: result.model,
      toolRounds: result.rounds
    });
  } catch (error: any) {
    console.error("[server] AI Orchestrator error:", error);
    const message = error?.message || "Unknown server error.";
    res.status(500).json({ error: message });
  }
});

// --- PLATFORM DATABASE API ---
function requireServerSecret(req: express.Request, res: express.Response, next: express.NextFunction) {
  const configured = process.env.ZEUS_INTERNAL_API_KEY;
  const supplied = req.header("x-zeus-api-key");

  // Server-to-server callers authenticate with the private key.
  if (configured && supplied === configured) return next();

  // Browser calls are restricted to the same origin so the dashboard can use
  // the API without exposing a server secret to client JavaScript. This is
  // CSRF protection, not user authentication; Supabase Auth/RBAC remains a
  // later security layer.
  const fetchSite = req.header("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "same-site") return next();

  const origin = req.header("origin");
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const host = req.get("host");
      const forwardedHost = req.header("x-forwarded-host");
      if (originUrl.host === host || originUrl.host === forwardedHost) return next();
    } catch {}
  }

  if (!configured && (req.path.startsWith("/api/projects") || req.path.startsWith("/api/audit-logs"))) {
    return res.status(403).json({ error: "Same-origin browser access or ZEUS_INTERNAL_API_KEY is required." });
  }

  return res.status(401).json({ error: "Unauthorized." });
}

app.get("/api/projects", requireServerSecret, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/projects", requireServerSecret, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const project = req.body;
  const { data, error } = await supabase.from("projects").insert([project]).select().single();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.get("/api/audit-logs", requireServerSecret, async (req, res) => {
  if (!supabase) return res.status(501).json({ error: "Supabase not configured" });
  const { data, error } = await supabase.from("audit_logs").select("*").order("timestamp", { ascending: false }).limit(50);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/audit-logs", requireServerSecret, async (req, res) => {
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
