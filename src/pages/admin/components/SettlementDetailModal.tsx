import { useEffect, useState } from 'react';
import { formatThb } from '@/pages/admin/utils';
import type { SettlementLine, SettlementTotals } from '@/utils/settlement';
import { normalizeDate } from '@/utils/settlement';

interface Props {
  lines: SettlementLine[];
  totals: SettlementTotals;
  periodLabel: string;
  onClose: () => void;
}

const PAGE_STEP = 10;

const num = new Intl.NumberFormat('en-US');

/**
 * 정산 기간 안에서 판매 완료된 상품 목록.
 * 요약 카드의 '상세 보기'에서 열리며, 처음부터 목록을 펼쳐 보여 줍니다.
 */
export default function SettlementDetailModal({ lines, totals, periodLabel, onClose }: Props) {
  const [visible, setVisible] = useState(Math.min(PAGE_STEP, lines.length));

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const shown = lines.slice(0, visible);
  const remaining = lines.length - shown.length;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground-950/50 p-0 sm:items-center sm:p-6">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col rounded-t-lg bg-background-50 sm:rounded-lg">
        <div className="flex items-start justify-between gap-3 border-b border-background-200 px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="flex flex-wrap items-center gap-2 font-heading text-[15px] text-foreground-950">
              <i className="ri-file-list-3-line text-[15px] text-foreground-500"></i>
              판매 내역
              <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-normal text-secondary-900">
                {num.format(lines.length)}건
              </span>
            </h2>
            <p className="mt-1 text-[10.5px] text-foreground-500">
              {periodLabel} · 판매일 최신순으로 정렬했습니다
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-200"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <p className="rounded-md bg-background-100/70 px-3 py-8 text-center text-[11.5px] leading-relaxed text-foreground-600">
              <i className="ri-calendar-line mr-1"></i>
              선택한 기간에는 판매 완료 기록이 없습니다. 기간을 넓혀 보세요.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] border-collapse text-[11.5px]">
                  <thead>
                    <tr className="border-b border-background-300/60 text-[10px] uppercase tracking-[0.1em] text-foreground-500">
                      <th className="py-1.5 pr-2 text-left font-normal">판매일</th>
                      <th className="px-2 py-1.5 text-left font-normal">상품</th>
                      <th className="px-2 py-1.5 text-right font-normal">판매가</th>
                      <th className="px-2 py-1.5 text-right font-normal">원가</th>
                      <th className="px-2 py-1.5 text-right font-normal">VAT·수수료</th>
                      <th className="px-2 py-1.5 text-right font-normal">순수익</th>
                      <th className="py-1.5 pl-2 text-right font-normal">마진</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shown.map((line) => {
                      const iso = normalizeDate(line.saleDate);
                      return (
                        <tr
                          key={line.product.id}
                          className="border-b border-background-200/70 transition-colors last:border-0 hover:bg-background-100/60"
                        >
                          <td className="whitespace-nowrap py-2 pr-2 text-foreground-800">
                            {iso || (
                              <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[9.5px] text-accent-900">
                                날짜 미기록
                              </span>
                            )}
                          </td>
                          <td className="px-2 py-2">
                            <span className="block max-w-[220px] truncate font-medium text-foreground-900">
                              {line.product.name.en}
                            </span>
                            <span className="mt-0.5 block truncate text-[10px] text-foreground-500">
                              {line.product.id} · {line.product.brand}
                              {line.rateLocked && (
                                <span className="ml-1 text-accent-800">· 환율 고정</span>
                              )}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-900">
                            {formatThb(line.revenue)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-600">
                            − {formatThb(line.cost)}
                          </td>
                          <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-600">
                            − {formatThb(line.charges)}
                          </td>
                          <td
                            className={`whitespace-nowrap px-2 py-2 text-right font-medium ${
                              line.net >= 0 ? 'text-foreground-950' : 'text-accent-800'
                            }`}
                          >
                            {formatThb(line.net)}
                          </td>
                          <td
                            className={`whitespace-nowrap py-2 pl-2 text-right ${
                              line.net >= 0 ? 'text-secondary-900' : 'text-accent-700'
                            }`}
                          >
                            {line.marginPercent}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {remaining > 0 && (
                <button
                  type="button"
                  onClick={() => setVisible((current) => current + PAGE_STEP)}
                  className="mt-3 w-full cursor-pointer whitespace-nowrap rounded-md border border-background-300 bg-background-100/60 px-3 py-2 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400 hover:text-foreground-950"
                >
                  <i className="ri-add-line mr-1"></i>
                  {Math.min(PAGE_STEP, remaining)}건 더 보기
                  <span className="ml-1 text-foreground-500">({shown.length}/{lines.length})</span>
                </button>
              )}
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-background-200 bg-background-100/60 px-5 py-3">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11.5px]">
            <span className="text-foreground-600">
              판매가 <strong className="ml-1 font-medium text-foreground-900">{formatThb(totals.revenue)}</strong>
            </span>
            <span className="text-foreground-600">
              순수익
              <strong
                className={`ml-1 font-medium ${totals.net >= 0 ? 'text-secondary-900' : 'text-accent-800'}`}
              >
                {formatThb(totals.net)}
              </strong>
            </span>
            <span className="text-foreground-600">
              마진 <strong className="ml-1 font-medium text-foreground-900">{totals.marginPercent}%</strong>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}