import { useEffect, useRef, useState } from 'react';
import { useFxRate } from '@/hooks/useFxRate';
import { FX_SOURCE_LABEL } from '@/services/fxRate';

interface Props {
  /** Show the small "which rate / which day" caption under the control. */
  caption?: boolean;
}

/**
 * THB → KRW rate control used across the admin console.
 * The daily quote is fetched automatically; typing a value switches to manual.
 */
export default function FxRateControl({ caption = true }: Props) {
  const {
    rate,
    auto,
    loading,
    error,
    rateDate,
    source,
    stale,
    setRate,
    enableAuto,
    refresh,
  } = useFxRate();
  const [draft, setDraft] = useState(String(rate));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(String(rate));
  }, [rate]);

  const commit = (value: string) => {
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    if (Number.isFinite(parsed) && parsed > 0) {
      setRate(parsed);
      return;
    }
    setDraft(String(rate));
  };

  const statusText = auto
    ? `${rateDate ? `${rateDate} 기준` : '오늘 기준'} · ${source ? FX_SOURCE_LABEL[source] : '자동 조회'}`
    : '직접 입력한 환율로 계산 중';

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2 py-1.5">
        <span className="flex h-4 w-4 items-center justify-center text-[13px] text-foreground-500">
          <i className="ri-exchange-dollar-line"></i>
        </span>
        <span className="text-[11px] text-foreground-600">1฿ =</span>
        <input
          type="number"
          step={0.01}
          inputMode="decimal"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onFocus={() => {
            focused.current = true;
          }}
          onBlur={(event) => {
            focused.current = false;
            commit(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur();
          }}
          aria-label="1바트당 원화 환율"
          className="w-14 box-border rounded border border-background-300 bg-background-100 px-1.5 py-0.5 text-right text-[12px] text-foreground-900 outline-none focus:border-primary-500"
        />
        <span className="text-[11px] text-foreground-600">원</span>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          title={auto ? '오늘 환율을 다시 불러옵니다' : '자동 환율로 되돌립니다'}
          aria-label={auto ? '환율 새로고침' : '자동 환율 사용'}
          className="flex h-6 w-6 cursor-pointer items-center justify-center rounded border border-background-300 text-[12px] text-foreground-600 transition-colors hover:border-foreground-400 hover:text-foreground-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <i className={loading ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'}></i>
        </button>
        {auto ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-1.5 py-0.5 text-[10px] text-secondary-900">
            <i className="ri-flashlight-line text-[11px]"></i>
            자동
          </span>
        ) : (
          <button
            type="button"
            onClick={enableAuto}
            className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-full border border-secondary-300 px-1.5 py-0.5 text-[10px] text-secondary-900 transition-colors hover:bg-secondary-100"
          >
            <i className="ri-flashlight-line text-[11px]"></i>
            자동으로
          </button>
        )}
      </div>
      {caption && (
        <span
          className={`text-[9.5px] leading-none ${
            error ? 'text-accent-700' : 'text-foreground-500'
          }`}
        >
          {loading ? '오늘 환율 불러오는 중…' : error ?? statusText}
          {!error && auto && stale && !loading ? ' (최근 저장값)' : ''}
        </span>
      )}
    </div>
  );
}