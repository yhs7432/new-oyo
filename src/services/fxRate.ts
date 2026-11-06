import { ADMIN_FX_KEY } from '@/config/admin';

/** Where the daily quote came from. */
export type FxSource = 'frankfurter' | 'er-api';

export interface FxSnapshot {
  /** KRW per 1 THB */
  rate: number;
  /** Quote date (local YYYY-MM-DD) */
  date: string;
  /** ISO timestamp of the successful fetch in this browser */
  fetchedAt: string;
  source: FxSource;
}

export const DEFAULT_FX_RATE = 39.7;

const CACHE_KEY = 'oyogolf.admin.fx.cache';
const AUTO_KEY = 'oyogolf.admin.fx.auto';
const TIMEOUT_MS = 8000;

export const FX_SOURCE_LABEL: Record<FxSource, string> = {
  frankfurter: '유럽중앙은행(ECB)',
  'er-api': 'ExchangeRate-API',
};

/** Local calendar day key, e.g. `2026-11-06`. */
export function localDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function roundRate(value: number): number {
  return Math.round(value * 100) / 100;
}

function storage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function positiveNumber(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

/** Manually entered rate (also used as the fallback when auto sync fails). */
export function readManualRate(): number {
  const store = storage();
  const stored = positiveNumber(store?.getItem(ADMIN_FX_KEY));
  return stored ?? DEFAULT_FX_RATE;
}

export function writeManualRate(rate: number): void {
  const store = storage();
  if (!store || !Number.isFinite(rate) || rate <= 0) return;
  store.setItem(ADMIN_FX_KEY, String(rate));
}

/** Auto sync is on unless the user explicitly switched it off. */
export function readAutoEnabled(): boolean {
  const store = storage();
  if (!store) return true;
  return store.getItem(AUTO_KEY) !== '0';
}

export function writeAutoEnabled(enabled: boolean): void {
  const store = storage();
  if (!store) return;
  store.setItem(AUTO_KEY, enabled ? '1' : '0');
}

export function readCachedFx(): FxSnapshot | null {
  const store = storage();
  const raw = store?.getItem(CACHE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<FxSnapshot> | null;
    const rate = positiveNumber(parsed?.rate);
    if (!rate) return null;
    const source: FxSource = parsed?.source === 'er-api' ? 'er-api' : 'frankfurter';
    return {
      rate: roundRate(rate),
      date: typeof parsed?.date === 'string' && parsed.date ? parsed.date : localDateKey(),
      fetchedAt: typeof parsed?.fetchedAt === 'string' ? parsed.fetchedAt : '',
      source,
    };
  } catch {
    return null;
  }
}

export function writeCachedFx(snapshot: FxSnapshot): void {
  const store = storage();
  if (!store) return;
  try {
    store.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    // Storage may be full or blocked — the in-memory rate still works.
  }
}

async function fetchJson(url: string): Promise<unknown> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(url, { signal: controller.signal, cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as unknown;
  } finally {
    clearTimeout(timer);
  }
}

function parseFrankfurter(payload: unknown): FxSnapshot | null {
  const data = payload as { date?: string; rates?: Record<string, unknown> } | null;
  const rate = positiveNumber(data?.rates?.KRW);
  if (!rate) return null;
  return {
    rate: roundRate(rate),
    date: data?.date || localDateKey(),
    fetchedAt: new Date().toISOString(),
    source: 'frankfurter',
  };
}

function parseErApi(payload: unknown): FxSnapshot | null {
  const data = payload as {
    result?: string;
    time_last_update_unix?: number;
    rates?: Record<string, unknown>;
  } | null;
  if (data?.result !== 'success') return null;
  const rate = positiveNumber(data?.rates?.KRW);
  if (!rate) return null;
  const unix = Number(data?.time_last_update_unix);
  const date =
    Number.isFinite(unix) && unix > 0 ? localDateKey(new Date(unix * 1000)) : localDateKey();
  return { rate: roundRate(rate), date, fetchedAt: new Date().toISOString(), source: 'er-api' };
}

const PROVIDERS: { url: string; parse: (payload: unknown) => FxSnapshot | null }[] = [
  {
    url: 'https://api.frankfurter.dev/v1/latest?base=THB&symbols=KRW',
    parse: parseFrankfurter,
  },
  {
    url: 'https://open.er-api.com/v6/latest/THB',
    parse: parseErApi,
  },
];

/**
 * Daily THB → KRW quote. The second provider is only tried when the first one
 * fails, so a single working source is enough to keep the console running.
 */
export async function fetchDailyFx(): Promise<FxSnapshot> {
  for (const provider of PROVIDERS) {
    try {
      const snapshot = provider.parse(await fetchJson(provider.url));
      if (snapshot) return snapshot;
    } catch {
      // Try the next provider.
    }
  }
  throw new Error('환율을 불러오지 못했습니다.');
}