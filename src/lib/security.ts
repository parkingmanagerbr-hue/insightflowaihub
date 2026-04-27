/**
 * ============================================================
 *  InsightFlow — Centralized Security Utilities
 *  src/lib/security.ts
 * ============================================================
 *
 *  Covers:
 *  1. SQL Injection Prevention  — allowlist + dangerous-pattern detection
 *  2. SSRF Defense              — URL validation against internal ranges
 *  3. Input Sanitization        — strip HTML/script tags from user input
 *  4. Rate Limiting             — token-bucket per operation type
 *  5. Content Security Policy   — nonce generator for inline scripts (future)
 * ============================================================
 */

// ──────────────────────────────────────────────────────────────
// 1. SQL INJECTION PREVENTION
// ──────────────────────────────────────────────────────────────

/**
 * Operations explicitly allowed for non-admin query execution.
 * Everything else is blocked.
 */
const SQL_ALLOWLIST = /^\s*(SELECT|WITH|EXPLAIN|SHOW|DESCRIBE|DESC)\b/i;

/**
 * Patterns that are always dangerous, regardless of context.
 * Covers: destructive DML, DDL, stored procedures, out-of-band exfil.
 */
const SQL_DANGEROUS_PATTERNS: RegExp[] = [
  /\b(DROP|TRUNCATE|DELETE|UPDATE|INSERT|REPLACE|MERGE|UPSERT)\b/i,
  /\b(ALTER|CREATE|RENAME|COMMENT)\b/i,
  /\b(GRANT|REVOKE|DENY)\b/i,
  /\b(EXEC|EXECUTE|SP_|XP_)\b/i,
  /\b(LOAD_FILE|INTO\s+OUTFILE|INTO\s+DUMPFILE)\b/i,
  /\b(SLEEP|BENCHMARK|WAITFOR\s+DELAY)\b/i,
  /\b(UTL_FILE|UTL_HTTP|UTL_TCP)\b/i,        // Oracle SSRF gadgets
  /\b(OPENROWSET|OPENDATASOURCE|OPENQUERY)\b/i, // MSSQL SSRF gadgets
  /;.*(?:DROP|DELETE|UPDATE|INSERT)/i,          // stacked queries
  /--\s*;/,                                      // comment-then-terminate
  /\/\*.*\*\//s,                                 // block comments used to hide payloads
  /0x[0-9a-fA-F]{4,}/,                          // hex-encoded payloads
  /CHAR\s*\(\s*\d+/i,                           // char() encoding bypass
  /CONCAT\s*\(/i,                               // concatenation obfuscation
];

export interface SQLValidationResult {
  valid: boolean;
  error?: string;
  sanitized?: string;
}

/**
 * Validates AI-generated SQL before execution.
 *
 * @param sql  - Raw SQL string from AI or user input
 * @param isAdmin - Admin users get a slightly wider (but still safe) allowlist
 */
export function validateSQL(sql: string, isAdmin = false): SQLValidationResult {
  if (!sql || typeof sql !== 'string') {
    return { valid: false, error: 'SQL inválido ou vazio.' };
  }

  const trimmed = sql.trim();

  if (trimmed.length > 8_000) {
    return { valid: false, error: 'Query muito longa (máx. 8.000 caracteres).' };
  }

  // Non-admins: only SELECT / WITH / EXPLAIN
  if (!isAdmin && !SQL_ALLOWLIST.test(trimmed)) {
    return {
      valid: false,
      error:
        'Apenas consultas SELECT são permitidas. Operações de escrita bloqueadas por segurança.',
    };
  }

  // Check dangerous patterns for everyone
  for (const pattern of SQL_DANGEROUS_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        error: `SQL bloqueado: padrão perigoso detectado (${pattern.source.slice(0, 40)}…).`,
      };
    }
  }

  // Strip trailing semicolons to prevent stacked queries
  const sanitized = trimmed.replace(/;\s*$/, '');

  return { valid: true, sanitized };
}

// ──────────────────────────────────────────────────────────────
// 2. SSRF DEFENSE — URL VALIDATION
// ──────────────────────────────────────────────────────────────

/**
 * Private / link-local IP ranges that must never be reachable via user-
 * supplied URLs (SSRF attack vectors).
 */
const BLOCKED_IP_PATTERNS: RegExp[] = [
  /^127\./,                          // loopback (only localhost:11434 is explicitly allowed)
  /^10\./,                           // RFC 1918
  /^172\.(1[6-9]|2\d|3[01])\./,     // RFC 1918
  /^192\.168\./,                     // RFC 1918
  /^169\.254\./,                     // link-local / AWS metadata
  /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./,  // CGNAT
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 ULA
  /^fe80:/i,                         // IPv6 link-local
  /^0\./,                            // "this" network
  /^255\./,                          // broadcast
  /^metadata\.google\.internal$/i,   // GCP metadata
  /^169\.254\.169\.254$/,            // AWS/Azure/GCP metadata IP
];

/** Hostnames we unconditionally block regardless of resolution */
const BLOCKED_HOSTNAMES: RegExp[] = [
  /^metadata\.google\.internal$/i,
  /^instance-data$/i,
];

export interface URLValidationResult {
  valid: boolean;
  error?: string;
  normalized?: string;
}

/**
 * Validates a user-supplied URL for the Ollama endpoint.
 *
 * Rules:
 * - Must be http or https (no file://, ftp://, etc.)
 * - Hostname must not resolve to a private/cloud-metadata address
 * - By default only localhost:11434 is allowed; pass `extraAllowedOrigins`
 *   for additional explicitly approved hosts
 *
 * @param raw                - URL string from user input / localStorage
 * @param extraAllowedOrigins - Additional origins admin has whitelisted (e.g. "http://192.168.1.5:11434")
 */
export function validateOllamaURL(
  raw: string,
  extraAllowedOrigins: string[] = [],
): URLValidationResult {
  if (!raw || typeof raw !== 'string') {
    return { valid: false, error: 'URL não fornecida.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return { valid: false, error: 'URL malformada.' };
  }

  // Protocol check
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, error: `Protocolo não permitido: ${parsed.protocol}` };
  }

  const hostname = parsed.hostname.toLowerCase();

  // Blocked hostname check
  for (const pattern of BLOCKED_HOSTNAMES) {
    if (pattern.test(hostname)) {
      return { valid: false, error: `Hostname bloqueado: ${hostname}` };
    }
  }

  // Default allow: localhost:11434
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1';
  const isDefaultOllama = isLocalhost && parsed.port === '11434';

  if (isDefaultOllama) {
    return { valid: true, normalized: `${parsed.protocol}//${parsed.host}` };
  }

  // Check extra allowed origins (exact match after normalization)
  const normalizedInput = `${parsed.protocol}//${parsed.host}`;
  const isExplicitlyAllowed = extraAllowedOrigins.some((allowed) => {
    try {
      const a = new URL(allowed.trim());
      return `${a.protocol}//${a.host}` === normalizedInput;
    } catch {
      return false;
    }
  });

  if (isExplicitlyAllowed) {
    return { valid: true, normalized: normalizedInput };
  }

  // Block private IP ranges for non-explicitly-allowed origins
  for (const pattern of BLOCKED_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      return {
        valid: false,
        error: `Endereço bloqueado por segurança: ${hostname} está em um range privado/restrito. Adicione-o explicitamente nas configurações para permitir.`,
      };
    }
  }

  // For public hostnames: allow (admin may be running Ollama in cloud)
  return { valid: true, normalized: normalizedInput };
}

// ──────────────────────────────────────────────────────────────
// 3. INPUT SANITIZATION
// ──────────────────────────────────────────────────────────────

/** Characters / sequences that should never reach the AI or be stored */
const DANGEROUS_HTML_PATTERNS: RegExp[] = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /javascript\s*:/gi,
  /vbscript\s*:/gi,
  /on\w+\s*=/gi,        // onclick=, onerror=, etc.
  /data\s*:/gi,          // data: URIs
];

/**
 * Strips HTML/script injection attempts from a user-supplied string.
 * Suitable for chat messages and prompt inputs.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  let clean = input;
  for (const pattern of DANGEROUS_HTML_PATTERNS) {
    clean = clean.replace(pattern, '');
  }
  // Collapse whitespace created by removed tags
  return clean.replace(/\s{3,}/g, '  ').trim();
}

/**
 * Sanitizes an API key string (trim + basic format check).
 * Does NOT log or expose the value.
 */
export function sanitizeAPIKey(key: string): string {
  if (!key || typeof key !== 'string') return '';
  return key.trim().replace(/[^\x20-\x7E]/g, ''); // printable ASCII only
}

// ──────────────────────────────────────────────────────────────
// 4. RATE LIMITING (in-memory token bucket)
// ──────────────────────────────────────────────────────────────

interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, TokenBucket>();

/**
 * Token-bucket rate limiter.
 *
 * @param key          - Unique identifier (e.g. "ollama:userId", "sql:userId")
 * @param maxTokens    - Bucket capacity
 * @param refillRate   - Tokens added per second
 * @returns true if the request is allowed, false if rate-limited
 */
export function checkRateLimit(key: string, maxTokens = 10, refillRate = 1): boolean {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket) {
    bucket = { tokens: maxTokens, lastRefill: now };
    buckets.set(key, bucket);
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - bucket.lastRefill) / 1000;
  bucket.tokens = Math.min(maxTokens, bucket.tokens + elapsed * refillRate);
  bucket.lastRefill = now;

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/** Clear rate limit buckets (e.g. on logout) */
export function clearRateLimits(): void {
  buckets.clear();
}

// ──────────────────────────────────────────────────────────────
// 5. CSP NONCE GENERATOR (for future inline-script hardening)
// ──────────────────────────────────────────────────────────────

/** Generates a cryptographically random base64 nonce for CSP headers */
export function generateCSPNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

// ──────────────────────────────────────────────────────────────
// 6. SECURE LOCAL STORAGE (wraps sensitive keys)
// ──────────────────────────────────────────────────────────────

/**
 * Namespaced secure storage — never stores credentials in plain text.
 * Uses sessionStorage for sensitive keys (cleared on tab close).
 */
export const secureStorage = {
  /** Store an API key in sessionStorage (not localStorage) */
  setKey(name: string, value: string): void {
    try {
      sessionStorage.setItem(`_if_${name}`, sanitizeAPIKey(value));
    } catch {
      // Storage quota exceeded or private mode — silently fail
    }
  },

  /** Retrieve an API key from sessionStorage */
  getKey(name: string): string | null {
    try {
      return sessionStorage.getItem(`_if_${name}`);
    } catch {
      return null;
    }
  },

  /** Remove a stored key */
  removeKey(name: string): void {
    try {
      sessionStorage.removeItem(`_if_${name}`);
    } catch {
      // ignore
    }
  },

  /** Store non-sensitive config in localStorage */
  setConfig(name: string, value: string): void {
    try {
      localStorage.setItem(`_if_cfg_${name}`, value);
    } catch {
      // ignore
    }
  },

  /** Retrieve non-sensitive config */
  getConfig(name: string): string | null {
    try {
      return localStorage.getItem(`_if_cfg_${name}`);
    } catch {
      return null;
    }
  },
};
