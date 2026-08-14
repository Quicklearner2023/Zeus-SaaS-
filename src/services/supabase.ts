/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { PlatformProject, UserProfile, AuditLog, AgentTask } from '@/types';

const SUPABASE_CONFIG_KEY = 'saas_supabase_config_v1';

export interface SupabaseCredentials {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getStoredSupabaseCredentials(): SupabaseCredentials {
  const envUrl = import.meta.env.VITE_SUPABASE_URL || '';
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

  try {
    const raw = localStorage.getItem(SUPABASE_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        supabaseUrl: parsed.supabaseUrl || envUrl,
        supabaseAnonKey: parsed.supabaseAnonKey || envKey
      };
    }
  } catch (e) {
    console.warn('Failed to parse stored Supabase credentials:', e);
  }

  return {
    supabaseUrl: envUrl,
    supabaseAnonKey: envKey
  };
}

export function saveSupabaseCredentials(credentials: SupabaseCredentials) {
  localStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(credentials));
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const creds = getStoredSupabaseCredentials();
  if (!creds.supabaseUrl || !creds.supabaseAnonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(creds.supabaseUrl, creds.supabaseAnonKey);
    } catch (err) {
      console.error('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return supabaseInstance;
}

export function resetSupabaseInstance() {
  supabaseInstance = null;
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { 
      success: false, 
      message: 'Supabase URL or Anon Key missing. Provide credentials in .env.example or via the Supabase Configurator.' 
    };
  }

  try {
    const { data, error } = await client.from('projects').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return { 
          success: true, 
          message: 'Connected to Supabase PostgreSQL! (Note: Run the provided SQL migration script to initialize schema tables).' 
        };
      }
      return { success: false, message: `Supabase Error (${error.code}): ${error.message}` };
    }

    return { success: true, message: `Successfully connected to Supabase PostgreSQL! (${data ?? 0} project records active)` };
  } catch (err: any) {
    return { success: false, message: `Connection failed: ${err.message || err}` };
  }
}

/**
 * Full SQL setup script for the SaaS Orchestrator application itself
 */
export const SAAS_PLATFORM_SUPABASE_SQL = `-- ===================================================
-- Supabase Schema Migration: Personal SaaS Orchestrator
-- Copy & Run this SQL script in your Supabase SQL Editor
-- (Supabase Dashboard -> SQL Editor -> New Query)
-- ===================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id TEXT PRIMARY KEY DEFAULT ('proj_' || md5(random()::text)),
  name TEXT NOT NULL,
  description TEXT,
  framework TEXT DEFAULT 'React + Vite',
  repository_url TEXT,
  deployment_url TEXT,
  github_branch TEXT DEFAULT 'main',
  netlify_site_id TEXT,
  database_required BOOLEAN DEFAULT true,
  database_provider TEXT DEFAULT 'Supabase',
  database_status TEXT DEFAULT 'Provisioned',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Platform Users / Profiles Table
CREATE TABLE IF NOT EXISTS public.users (
  id TEXT PRIMARY KEY DEFAULT ('usr_' || md5(random()::text)),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY DEFAULT ('audit_' || md5(random()::text)),
  user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_name TEXT NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Agent Tasks Table
CREATE TABLE IF NOT EXISTS public.agent_tasks (
  id TEXT PRIMARY KEY DEFAULT ('task_' || md5(random()::text)),
  project_id TEXT REFERENCES public.projects(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  title TEXT NOT NULL,
  user_request TEXT NOT NULL,
  status TEXT DEFAULT 'planning',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_tasks ENABLE ROW LEVEL SECURITY;

-- The browser must never have anonymous write/read access to platform data.
-- The Zeus server uses the Supabase service-role key for privileged operations.
-- These policies allow authenticated users during the current single-user testing
-- phase while keeping the public/anon role locked out. Multi-user ownership/RBAC
-- can be tightened later without exposing the service-role key.
DROP POLICY IF EXISTS "Allow anon read projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anon insert projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anon update projects" ON public.projects;
DROP POLICY IF EXISTS "Allow anon read users" ON public.users;
DROP POLICY IF EXISTS "Allow anon insert users" ON public.users;
DROP POLICY IF EXISTS "Allow anon read audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow anon insert audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Allow anon read agent_tasks" ON public.agent_tasks;
DROP POLICY IF EXISTS "Allow anon insert agent_tasks" ON public.agent_tasks;

DROP POLICY IF EXISTS "Authenticated users can read projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can update projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can read users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can create users" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can create audit logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Authenticated users can read agent tasks" ON public.agent_tasks;
DROP POLICY IF EXISTS "Authenticated users can create agent tasks" ON public.agent_tasks;

CREATE POLICY "Authenticated users can read projects"
  ON public.projects FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create projects"
  ON public.projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update projects"
  ON public.projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can read users"
  ON public.users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create users"
  ON public.users FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read audit logs"
  ON public.audit_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create audit logs"
  ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can read agent tasks"
  ON public.agent_tasks FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create agent tasks"
  ON public.agent_tasks FOR INSERT TO authenticated WITH CHECK (true);
`;
