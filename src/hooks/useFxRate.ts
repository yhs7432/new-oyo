import { useCallback, useSyncExternalStore } from 'react';
import {
  DEFAULT_FX_RATE,
  fetchDailyFx,
  localDateKey,
  readAutoEnabled,
  readCachedFx,
  readManualRate,
  writeAutoEnabled,
  writeCachedFx,
  writeManualRate,
  type FxSource,
} from '@/services/fxRate';

interface FxStore {
  /** KRW per 1 THB */
  rate: number;
  /** true = daily quote from the FX provider, false = typed in by the user */
  auto: boolean;
  status: 'idle' | 'loading' | 'ready' | 'error';
  error: string | null;
  /** Quote date of the applied rate (YYYY-MM-DD) */
  rateDate: string;
  updatedAt: string;
  source: FxSource | '';
  /** Today's quote could not be used, so a stored/fallback rate is showing */
  stale: boolean;
}

function createInitialState(): FxStore {
  const base: FxStore = {
    rate: DEFAULT_FX_RATE,
    auto: true,
    status: 'idle',
    error: null,
    rateDate: '',
    updatedAt: '',
    source: '',
    stale: true,
  };
  if (typeof window === 'undefined') return base;
  if (!readAutoEnabled()) {
    return { ...base, auto: false, rate: readManualRate(), stale: false };
  }
  const cached = readCachedFx();
  if (!cached) return base;
  const fresh = cached.date === localDateKey();
  return {
    ...base,
    rate: cached.rate,
    rateDate: cached.date,
    updatedAt: cached.fetchedAt,
    source: cached.source,
    stale: !fresh,
    status: fresh ? 'ready' : 'idle',
  };
}

let state: FxStore = createInitialState();
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;
let started = false;
let watching = false;

/** A tab left open overnight should pick up the next day's quote. */
function watchDayChange(): void {
  if (watching || typeof window === 'undefined') return;
  watching = true;
  const check = () => {
    if (!state.auto || state.status === 'loading') return;
    if (state.rateDate === localDateKey()) return;
    void runSync();
  };
  window.addEventListener('focus', check);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') check();
  });
}

function emit(patch: Partial<FxStore>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function getSnapshot(): FxStore {
  return state;
}

async function runSync(): Promise<void> {
  if (inflight) return inflight;
  emit({ status: 'loading', error: null });
  inflight = (async () => {
    try {
      const snapshot = await fetchDailyFx();
      writeCachedFx(snapshot);
      emit({
        rate: snapshot.rate,
        auto: true,
        rateDate: snapshot.date,
        updatedAt: snapshot.fetchedAt,
        source: snapshot.source,
        stale: snapshot.date !== localDateKey(),
        status: 'ready',
        error: null,
      });
    } catch {
      emit({
        status: 'error',
        error: '오늘 환율을 불러오지 못했습니다. 저장된 환율로 계산합니다.',
      });
    } finally {
      inflight = null;
    }
  })();
  return inflight;
}

function startSyncOnce(): void {
  if (started) return;
  started = true;
  watchDayChange();
  if (!state.auto || state.status === 'ready') return;
  void runSync();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  startSyncOnce();
  return () => {
    listeners.delete(listener);
  };
}

/** Typing a rate switches the console to manual mode. */
function setManualRate(next: number): void {
  if (!Number.isFinite(next) || next <= 0) return;
  writeManualRate(next);
  writeAutoEnabled(false);
  emit({
    rate: next,
    auto: false,
    status: 'idle',
    error: null,
    rateDate: '',
    updatedAt: '',
    source: '',
    stale: false,
  });
}

function enableAuto(): void {
  writeAutoEnabled(true);
  emit({ auto: true, error: null });
  const cached = readCachedFx();
  if (cached && cached.date === localDateKey()) {
    emit({
      rate: cached.rate,
      rateDate: cached.date,
      updatedAt: cached.fetchedAt,
      source: cached.source,
      stale: false,
      status: 'ready',
    });
    return;
  }
  void runSync();
}

function disableAuto(): void {
  writeAutoEnabled(false);
  writeManualRate(state.rate);
  emit({
    auto: false,
    status: 'idle',
    error: null,
    rateDate: '',
    updatedAt: '',
    source: '',
    stale: false,
  });
}

/** Refresh button: re-fetch today's quote (switching back to auto if needed). */
function refresh(): void {
  if (!state.auto) {
    enableAuto();
    return;
  }
  void runSync();
}

export interface FxRateApi {
  rate: number;
  auto: boolean;
  loading: boolean;
  error: string | null;
  rateDate: string;
  updatedAt: string;
  source: FxSource | '';
  stale: boolean;
  setRate: (next: number) => void;
  enableAuto: () => void;
  disableAuto: () => void;
  refresh: () => void;
}

/** Shared, app-wide manual THB → KRW rate with a once-a-day auto sync. */
export function useFxRate(): FxRateApi {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const enable = useCallback(() => enableAuto(), []);
  const disable = useCallback(() => disableAuto(), []);
  const refreshRate = useCallback(() => refresh(), []);

  return {
    rate: snapshot.rate,
    auto: snapshot.auto,
    loading: snapshot.status === 'loading',
    error: snapshot.error,
    rateDate: snapshot.rateDate,
    updatedAt: snapshot.updatedAt,
    source: snapshot.source,
    stale: snapshot.stale,
    setRate: setManualRate,
    enableAuto: enable,
    disableAuto: disable,
    refresh: refreshRate,
  };
}