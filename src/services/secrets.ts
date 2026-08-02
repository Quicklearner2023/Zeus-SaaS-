/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Key patterns to sanitize
const SENSITIVE_PATTERNS = [
  /AIzaSy[A-Za-z0-9_-]{33}/g, // Gemini / Google API Key
  /ghp_[A-Za-z0-9]{36}/g,     // GitHub Personal Access Token
  /github_pat_[A-Za-z0-9_]{82}/g, // GitHub Fine-grained PAT
  /nfp_[A-Za-z0-9]{32,64}/g,  // Netlify Auth Token
  /sbp_[A-Za-z0-9]{40}/g,     // Supabase Access Token
  /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g, // JWTs / Service Role Keys
  /(key|token|secret|password|auth|bearer)\s*[:=]\s*["']?([A-Za-z0-9_\-\.]{12,})["']?/gi
];

/**
 * Redacts secrets from any string to prevent exposure in logs, responses, or UI.
 */
export function sanitizeText(text: string): string {
  if (!text) return text;
  
  let clean = text;

  // Redact known pattern matches
  SENSITIVE_PATTERNS.forEach(pattern => {
    clean = clean.replace(pattern, (match, p1, p2) => {
      if (p2) {
        return `${p1}="[REDACTED_SECRET]"`;
      }
      return '[REDACTED_SECRET]';
    });
  });

  return clean;
}

/**
 * Checks if an action string or plan step contains a high-impact risk that requires approval.
 */
export function isHighRiskAction(actionDescription: string): { isHighRisk: boolean; riskType?: string; reason?: string } {
  const lower = actionDescription.toLowerCase();

  if (lower.includes('drop table') || lower.includes('delete table') || lower.includes('truncate table')) {
    return {
      isHighRisk: true,
      riskType: 'drop_table',
      reason: 'Destructive database action: Dropping or truncating database tables will permanently remove data.'
    };
  }

  if (lower.includes('delete database') || lower.includes('drop database')) {
    return {
      isHighRisk: true,
      riskType: 'delete_database',
      reason: 'Critical database action: Deleting a database permanently destroys all schemas and customer records.'
    };
  }

  if (lower.includes('delete repository') || lower.includes('delete repo')) {
    return {
      isHighRisk: true,
      riskType: 'delete_repository',
      reason: 'Source code loss: Deleting a GitHub repository removes source history and version control.'
    };
  }

  if (lower.includes('force push') || lower.includes('push -f')) {
    return {
      isHighRisk: true,
      riskType: 'force_push_branch',
      reason: 'Git overwrite: Force-pushing can overwrite commits made by other team members.'
    };
  }

  if (lower.includes('paid resource') || lower.includes('create paid') || lower.includes('upgrade tier')) {
    return {
      isHighRisk: true,
      riskType: 'create_paid_resource',
      reason: 'Billing impact: Provisioning paid cloud infrastructure incurs recurring charges.'
    };
  }

  if (lower.includes('disable rls') || lower.includes('disable security') || lower.includes('expose secret')) {
    return {
      isHighRisk: true,
      riskType: 'disable_security',
      reason: 'Security risk: Disabling Row Level Security exposes customer data to unauthorized reads.'
    };
  }

  return { isHighRisk: false };
}
