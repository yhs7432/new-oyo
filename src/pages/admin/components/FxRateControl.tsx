import { useEffect, useRef, useState } from 'react';
import { useFxRate } from '@/hooks/useFxRate';
import { FX_SOURCE_LABEL, formatFxRateInverse, quoteInBase, rateFromQuote } from '@/services/fxRate';

interface Props {
  /** Show the small "which rate / which day" caption under the control. */
  caption?: boolean;
}

function draftOf(rate: number, base: 'thb' | 'krw'): string {
  const quote = quoteInBase(rate, base);
  if (!quote) return '';
  const text = quote.toFixed(base === 'krw' ? 4 : 2);
  return text.includes('.') ? text.replace(/0+$/, '').replace(/\.$/, '') : text;
}

/**
 * THB ↔ KRW rate control used across the admin console.
 * The daily quote is fetched automatically; typing a value switches to manual.
 * The quote can be read/entered either as `1฿ = ?원` or as `1원 = ?฿`.
 */
export default function FxRateControl({ caption = true }: Props) {
  const {
    rate,
    base,
    auto,
    loading,
    error,
    rateDate,
    source,
    stale,
    setRate,
    setBase,
    enableAuto,
    refresh,
  } = useFxRate();
  const [draft, setDraft] = useState(() => draftOf(rate, base));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setDraft(draftOf(rate, base));
  }, [rate, base]);

  const commit = (value: string) => {
    if (value.trim() === draftOf(rate, base)) {
      setDraft(draftOf(rate, base));
      return;
    }
    const parsed = Number(value.replace(/[^0-9.]/g, ''));
    const next = rateFromQuote(parsed, base);
    if (next > 0) {
      setRate(next);
      return;
    }
    setDraft(draftOf(rate, base));
  };

  const statusText = auto
    ? `${rateDate ? `${rateDate} 기준` : '오늘 기준'} · ${source ? FX_SOURCE_LABEL[source] : '자동 조회'}`
    : '직접 입력한 환율로 계산 중';

  const baseOptions: { key: 'thb' | 'krw'; label: string }[] = [
    { key: 'thb', label: '1฿' },
    { key: 'krw', label: '1원' },
  ];

  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2 py-1.5">
        <span className="flex h-4 w-4 items-center justify-center text-[13px] text-foreground-500">
          <i className="ri-exchange-dollar-line"></i>
        </span>
        <div
          role="group"
          aria-label="환율 기준 선택"
          className="flex items-center gap-0.5 rounded-full border border-background-300 bg-background-100 p-0.5"
        >
          {baseOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setBase(option.key)}
              aria-pressed={base === option.key}
              title={
                option.key === 'thb'
                  ? '1바트에 몇 원인지로 환율을 봅니다'
                  : '1원에 몇 바트인지로 환율을 봅니다'
              }
              className={`cursor-pointer rounded-full px-1.5 py-0.5 text-[10px] leading-none transition-colors ${
                base === option.key
                  ? 'bg-background-50 font-medium text-foreground-900'
                  : 'text-foreground-500 hover:text-foreground-800'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <span className="text-[11px] text-foreground-600">=</span>
        <input
          type="number"
          step={base === 'krw' ? 0.0001 : 0.01}
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
          aria-label={base === 'krw' ? '1원당 바트 환율' : '1바트당 원화 환율'}
          className="w-[76px] shrink-0 box-border appearance-none rounded border border-background-300 bg-background-100 px-1.5 py-0.5 text-right text-[12px] tabular-nums text-foreground-900 outline-none focus:border-primary-500 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
        <span className="text-[11px] text-foreground-600">{base === 'krw' ? '฿' : '원'}</span>
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
          {!error && !loading ? ` · ${formatFxRateInverse(rate, base)}` : ''}
        </span>
      )}
    </div>
  );
}