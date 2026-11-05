import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { formatKrw, formatThb } from '@/pages/admin/utils';
import { useFxRate } from '@/hooks/useFxRate';
import {
  isRangeActive,
  monthlySettlement,
  outOfRangeCount,
  totalSettlement,
  undatedSoldCount,
  type DateRange,
} from '@/utils/settlement';
import SettlementPeriodFilter, {
  rangeLabel,
} from '@/pages/admin/components/SettlementPeriodFilter';
import SettlementTrend from '@/pages/admin/components/SettlementTrend';

interface Props {
  items: Product[];
}

/**
 * 판매 완료 정산 영역 — 기간 선택, 정산 요약 카드, 월별 추이 표.
 * 처음 화면과 판매·출고 화면에서 같은 기준으로 재사용한다.
 */
export default function SettlementSection({ items }: Props) {
  const { rate } = useFxRate();
  const [rawRange, setRawRange] = useState<DateRange>({ from: '', to: '' });

  const range = useMemo<DateRange>(() => {
    if (rawRange.from && rawRange.to && rawRange.from > rawRange.to) {
      return { from: rawRange.to, to: rawRange.from };
    }
    return rawRange;
  }, [rawRange]);
  const rangeActive = isRangeActive(range);

  const settlement = useMemo(() => totalSettlement(items, rate, range), [items, rate, range]);
  const monthly = useMemo(() => monthlySettlement(items, rate, range), [items, rate, range]);
  const excluded = useMemo(() => outOfRangeCount(items, range), [items, range]);
  const undated = useMemo(() => undatedSoldCount(items), [items]);

  return (
    <div>
      <SettlementPeriodFilter
        range={rawRange}
        onChange={setRawRange}
        outOfRange={excluded}
        undated={undated}
      />

      <div className="mt-3 rounded-lg border border-background-200 bg-background-50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="flex flex-wrap items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
            <i className="ri-calculator-line text-[13px]"></i>
            판매 완료 정산 · {settlement.count}건
            <span className="normal-case tracking-normal text-foreground-400">
              {rangeActive ? rangeLabel(range) : '전체 기간'}
            </span>
          </p>
          <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] text-secondary-900">
            원가·VAT·수수료 자동 반영
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="min-w-0">
            <span className="block text-[10.5px] text-foreground-500">판매가 합계</span>
            <strong className="mt-0.5 block text-[13px] font-medium text-foreground-900">
              {formatThb(settlement.revenue)}
            </strong>
          </div>
          <div className="min-w-0">
            <span className="block text-[10.5px] text-foreground-500">원가 합계</span>
            <strong className="mt-0.5 block text-[13px] font-medium text-foreground-900">
              − {formatThb(settlement.cost)}
            </strong>
          </div>
          <div className="min-w-0">
            <span className="block text-[10.5px] text-foreground-500">VAT · 수수료</span>
            <strong className="mt-0.5 block text-[13px] font-medium text-foreground-900">
              − {formatThb(settlement.charges)}
            </strong>
          </div>
          <div className="min-w-0">
            <span className="block text-[10.5px] text-foreground-500">순수익</span>
            <strong
              className={`mt-0.5 block text-[13px] font-medium ${
                settlement.net >= 0 ? 'text-secondary-900' : 'text-accent-800'
              }`}
            >
              {formatThb(settlement.net)}
            </strong>
            <span
              className={`mt-0.5 block text-[10.5px] ${
                settlement.net >= 0 ? 'text-secondary-800' : 'text-accent-700'
              }`}
            >
              마진 {settlement.marginPercent}%
              <span className="ml-1 text-foreground-500">
                · 약 {formatKrw(settlement.net * rate)}
              </span>
            </span>
          </div>
        </div>
        <p className="mt-3 border-t border-background-200 pt-2.5 text-[10.5px] leading-relaxed text-foreground-500">
          판매 완료 상품의 원가를 THB로 환산하고, 상품별 VAT(판매가의 %)와 웹 수수료(바트 금액)를
          빼서 계산합니다. 마진율은 (순수익 ÷ 판매가 합계) 기준입니다. 두 값은 상품 수정 화면에서
          상품마다 입력할 수 있습니다.
        </p>
      </div>

      <SettlementTrend
        rows={monthly}
        total={settlement}
        periodLabel={rangeActive ? rangeLabel(range) : '전체 기간'}
        rangeActive={rangeActive}
      />
    </div>
  );
}