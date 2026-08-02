/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseDecision } from '@/types';

/**
 * Analyzes project specifications and determines if a persistent database is required.
 * Generates SQL schemas, migrations, RLS policies, and RBAC role definitions.
 */
export function evaluateDatabaseRequirements(
  projectName: string, 
  userPrompt: string
): DatabaseDecision {
  const promptLower = userPrompt.toLowerCase();
  const nameLower = projectName.toLowerCase();
  const combined = `${nameLower} ${promptLower}`;

  // Keywords that clearly indicate static/no-database requirements
  const staticKeywords = [
    'portfolio', 'landing page', 'static website', 'company profile', 
    'documentation', 'resume', 'showcase', 'calculator', 'converter',
    'greeting card', 'hello world', 'single page brochure'
  ];

  // Keywords indicating database/backend requirements
  const dbKeywords = [
    'e-commerce', 'ecommerce', 'store', 'marketplace', 'booking',
    'auth', 'login', 'signup', 'user profile', 'dashboard',
    'school management', 'crm', 'inventory', 'chat', 'messaging',
    'forum', 'social', 'saas', 'stripe', 'payment', 'multi-tenant',
    'roles', 'permissions', 'supabase', 'database', 'sql'
  ];

  const matchesStatic = staticKeywords.some(k => combined.includes(k));
  const matchesDb = dbKeywords.some(k => combined.includes(k));

  // Decision logic
  const databaseRequired = matchesDb || (!matchesStatic && promptLower.length > 30);

  if (!databaseRequired) {
    return {
      projectId: 'proj_' + Math.random().toString(36).substring(2, 9),
      projectName: projectName || 'Static Web App',
      databaseRequired: false,
      reason: 'The requested application is static or client-side only. It does not require user registration, persistent content, or server-side database storage. The project will be built cleanly without unnecessary database overhead.',
      recommendedProvider: 'None',
      requiredServices: [],
      suggestedSchema: [],
      generatedMigrations: [],
      projectRbacRoles: ['public_visitor']
    };
  }

  // Derive domain-specific RBAC roles and database schema
  let rbacRoles: string[] = ['user', 'admin'];
  let tableName = 'user_data';
  let schemaDescription = 'Core user entities and persistent state.';

  if (combined.includes('e-commerce') || combined.includes('store') || combined.includes('shop')) {
    rbacRoles = ['customer', 'seller', 'admin'];
    tableName = 'products_and_orders';
    schemaDescription = 'Products catalog, order transactions, and customer cart history.';
  } else if (combined.includes('school') || combined.includes('education') || combined.includes('learning')) {
    rbacRoles = ['student', 'teacher', 'staff', 'admin'];
    tableName = 'courses_and_grades';
    schemaDescription = 'Student enrollments, course catalogs, and academic performance logs.';
  } else if (combined.includes('marketplace') || combined.includes('booking')) {
    rbacRoles = ['buyer', 'seller', 'service_provider', 'admin'];
    tableName = 'listings_and_bookings';
    schemaDescription = 'Service listings, availability schedules, and reservation records.';
  } else if (combined.includes('saas') || combined.includes('dashboard')) {
    rbacRoles = ['owner', 'admin', 'member', 'viewer'];
    tableName = 'organization_subscriptions';
    schemaDescription = 'Multi-tenant organization accounts, subscription metrics, and API audit logs.';
  }

  const migration001Sql = `-- ==========================================
-- Migration 001: Initial Schema & Supabase RLS
-- Project: ${projectName}
-- Provider: Supabase (PostgreSQL)
-- ==========================================

-- 1. Create Profiles table linked to Supabase Auth Users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT '${rbacRoles[0]}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id);

-- RLS Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. Create Domain Entity Table: ${tableName}
CREATE TABLE IF NOT EXISTS public.${tableName} (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Owner or Admin full access
CREATE POLICY "Owner or Admin access" 
ON public.${tableName} FOR ALL 
USING (
  auth.uid() = owner_id 
  OR EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'owner')
  )
);

-- Index for high-performance query execution
CREATE INDEX IF NOT EXISTS idx_${tableName}_owner ON public.${tableName}(owner_id);
`;

  return {
    projectId: 'proj_' + Math.random().toString(36).substring(2, 9),
    projectName: projectName || 'SaaS Application',
    databaseRequired: true,
    reason: `The requested application requires user authentication, multi-role permissions (${rbacRoles.join(', ')}), persistent records (${tableName}), and secure server-side row-level isolation.`,
    recommendedProvider: 'Supabase',
    requiredServices: [
      'PostgreSQL',
      'Supabase Authentication',
      'Row Level Security',
      'Supabase Storage'
    ],
    suggestedSchema: [
      {
        tableName: 'profiles',
        description: 'User identity profiles linked to Supabase auth.users with RBAC role attributes.',
        columns: ['id (UUID)', 'email (TEXT)', 'full_name (TEXT)', 'role (TEXT)', 'created_at (TIMESTAMPTZ)'],
        rlsPolicy: 'Users can read and update their own profile; Admins have full access.'
      },
      {
        tableName,
        description: schemaDescription,
        columns: ['id (UUID)', 'owner_id (UUID)', 'title (TEXT)', 'data (JSONB)', 'status (TEXT)'],
        rlsPolicy: 'Owner or user with matching RBAC role permissions can read/write rows.'
      }
    ],
    generatedMigrations: [
      {
        filename: 'supabase/migrations/001_initial_schema.sql',
        sql: migration001Sql
      }
    ],
    projectRbacRoles: rbacRoles
  };
}
