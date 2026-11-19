/**
 * Readdy Backend (Supabase-compatible) auth recovery.
 *
 * Background:
 * When the backend project is reset / migrated, or a session is revoked elsewhere,
 * the browser keeps an old refresh token in localStorage. supabase-js then tries to
 * refresh it in the background and rejects with:
 *   "Invalid Refresh Token: Refresh Token Not Found"
 * That rejection is not awaited by app code, so it surfaces as an unhandled
 * rejection and can break the page.
 *
 * This module detects those specific failures, wipes the stale local session and
 * lets the app continue as a signed-out visitor.
 */
import { supabase } from '@/services/supabase';

const INVALID_REFRESH_PATTERNS = [
  'invalid refresh token',
  'refresh token not found',
  'refresh_token_not_found',
  'invalid_grant',
  'session_not_found',
  'session not found',
];

function toText(value: unknown): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.message;
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const parts = [record.message, record.error_description, record.error, record.code, record.name];
    return parts.filter((part): part is string => typeof part === 'string').join(' ');
  }
  return '';
}

export function isInvalidRefreshTokenError(error: unknown): boolean {
  const text = toText(error).toLowerCase();
  if (!text) return false;
  return INVALID_REFRESH_PATTERNS.some((pattern) => text.includes(pattern));
}

/** Removes Supabase auth token entries from a web Storage instance. */
function removeAuthTokenKeys(storage: Storage | undefined) {
  if (!storage) return;
  const keys: string[] = [];
  try {
    for (let index = 0; index < storage.length; index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith('sb-') && key.includes('-auth-token')) keys.push(key);
    }
    keys.forEach((key) => storage.removeItem(key));
  } catch {
    // Private browsing / quota errors must never break the app.
  }
}

function clearLocalSession() {
  if (typeof window === 'undefined') return;
  removeAuthTokenKeys(window.localStorage);
  removeAuthTokenKeys(window.sessionStorage);
}

let recovering = false;

/**
 * Clears the unusable session so the next request is treated as signed-out.
 * Safe to call repeatedly; concurrent calls collapse into one run.
 */
export async function recoverAuthSession(): Promise<void> {
  if (recovering) return;
  recovering = true;
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    // The token is already invalid, so a server-side sign-out can fail. Ignore it.
  } finally {
    clearLocalSession();
    recovering = false;
  }
}

let installed = false;

/**
 * Global safety net: whenever an invalid refresh token rejection escapes to the
 * browser, clean the local session instead of showing an error page.
 */
export function installAuthRecovery(): void {
  if (installed || typeof window === 'undefined') return;
  installed = true;

  const handle = (reason: unknown) => {
    if (isInvalidRefreshTokenError(reason)) {
      void recoverAuthSession();
    }
  };

  window.addEventListener('unhandledrejection', (event) => handle(event.reason));
  window.addEventListener('error', (event) => handle(event.error));
}