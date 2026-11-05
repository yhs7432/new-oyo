import type { DateRange } from '@/utils/settlement';
import { isRangeActive } from '@/utils/settlement';

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
  /** Sold products excluded because of the selected range. */
  outOfRange: number;
  /** Sold products with no sale date at all. */
  undated: number;
}

const pad = (value: number) => String(value).padStart(2, '0');
const isoOf = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

function monthBounds(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 0);
  return { from: isoOf(start), to: isoOf(end) };
}

export function buildPresets(): { key: string; label: string; range: DateRange }[] {
  const now = new Date();
  const thisMonth = monthBounds(0);
  const threeMonths = monthBounds(2);
  return [
    { key: 'all', label: '전체 기간', range: { from: '', to: '' } },
    { key: 'month', label: '이번 달', range: thisMonth },
    { key: 'quarter', label: '최근 3개월', range: threeMonths },
    {
      key: 'year',
      label: '올해',
      range: { from: `${now.getFullYear()}-01-01`, to: `${now.getFullYear()}-12-31` },
    },
  ];
}

export function rangeLabel(range: DateRange): string {
  if (!isRangeActive(range)) return '전체 기간';
  if (range.from && range.to) return `${range.from} ~ ${range.to}`;
  if (range.from) return `${range.from} 이후`;
  return `${range.to} 이전`;
}

export default function SettlementPeriodFilter({ range, onChange, outOfRange, undated }: Props) {
  const presets = buildPresets();
  const active = isRangeActive(range);
  const activeKey =
    presets.find((preset) => preset.range.from === range.from && preset.range.to === range.to)
      ?.key ?? 'custom';

  return (
    <div className="mt-3 rounded-lg border border-background-200 bg-background-50 p-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
          <i className="ri-calendar-2-line text-[13px]"></i>
          정산 기간
        </p>
        <div className="flex flex-wrap items-center gap-1">
          {presets.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => onChange(preset.range)}
              className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[10.5px] transition-colors ${
                activeKey === preset.key
                  ? 'bg-foreground-900 text-background-50'
                  : 'bg-background-200/70 text-foreground-700 hover:bg-background-300/70'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1.5">
          <span className="text-[10.5px] text-foreground-500">시작일</span>
          <input
            type="date"
            value={range.from}
            max={range.to || undefined}
            onChange={(event) => onChange({ ...range, from: event.target.value })}
            className="cursor-pointer rounded-md border border-background-300 bg-background-100/60 px-2.5 py-1.5 text-[11.5px] text-foreground-800 outline-none transition-colors focus:border-foreground-400"
          />
        </label>
        <span className="text-[11px] text-foreground-400">~</span>
        <label className="flex items-center gap-1.5">
          <span className="text-[10.5px] text-foreground-500">종료일</span>
          <input
            type="date"
            value={range.to}
            min={range.from || undefined}
            onChange={(event) => onChange({ ...range, to: event.target.value })}
            className="cursor-pointer rounded-md border border-background-300 bg-background-100/60 px-2.5 py-1.5 text-[11.5px] text-foreground-800 outline-none transition-colors focus:border-foreground-400"
          />
        </label>
        {active && (
          <button
            type="button"
            onClick={() => onChange({ from: '', to: '' })}
            className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-2.5 py-1.5 text-[11px] text-foreground-600 transition-colors hover:border-foreground-400 hover:text-foreground-900"
          >
            <i className="ri-close-line mr-0.5"></i>
            초기화
          </button>
        )}
        <span className="ml-auto rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] text-secondary-900">
          {rangeLabel(range)}
        </span>
      </div>

      {(outOfRange > 0 || undated > 0) && (
        <p className="mt-2 text-[10.5px] leading-relaxed text-foreground-500">
          {active && outOfRange > 0 && (
            <>
              기간 밖 판매 완료 <strong className="font-medium text-foreground-700">{outOfRange}건</strong>
              은 합계에서 제외했습니다.{' '}
            </>
          )}
          {undated > 0 && (
            <>
              판매일이 없는 <strong className="font-medium text-foreground-700">{undated}건</strong>
              은 기간과 상관없이 집계에서 빠집니다.
            </>
          )}
        </p>
      )}
    </div>
  );
}