import { formatThb } from '@/pages/admin/utils';
import type { MonthlySettlement, SettlementTotals } from '@/utils/settlement';

interface Props {
  rows: MonthlySettlement[];
  total: SettlementTotals;
  periodLabel: string;
  rangeActive: boolean;
}

const monthFormatter = new Intl.NumberFormat('en-US');

export default function SettlementTrend({ rows, total, periodLabel, rangeActive }: Props) {
  return (
    <div className="mt-3 rounded-lg border border-background-200 bg-background-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
          <i className="ri-line-chart-line text-[13px]"></i>
          월별 판매 완료 정산
        </p>
        <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10px] text-foreground-700">
          {periodLabel}
        </span>
      </div>

      {rows.length === 0 ? (
        <p className="mt-3 rounded-md bg-background-100/60 px-3 py-5 text-center text-[11.5px] leading-relaxed text-foreground-600">
          <i className="ri-calendar-line mr-1"></i>
          {rangeActive
            ? '선택한 기간에는 판매 완료 기록이 없습니다. 기간을 넓혀 보세요.'
            : '아직 판매 완료 기록이 없습니다. 상품을 판매 완료로 바꾸면 월별 추이가 쌓입니다.'}
        </p>
      ) : (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse text-[11.5px]">
            <thead>
              <tr className="border-b border-background-300/60 text-[10px] uppercase tracking-[0.1em] text-foreground-500">
                <th className="py-1.5 pr-2 text-left font-normal">월</th>
                <th className="px-2 py-1.5 text-right font-normal">건수</th>
                <th className="px-2 py-1.5 text-right font-normal">판매가</th>
                <th className="px-2 py-1.5 text-right font-normal">원가</th>
                <th className="px-2 py-1.5 text-right font-normal">VAT·수수료</th>
                <th className="px-2 py-1.5 text-right font-normal">순수익</th>
                <th className="py-1.5 pl-2 text-right font-normal">마진</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-background-200/70 last:border-0 transition-colors hover:bg-background-100/60"
                >
                  <td className="whitespace-nowrap py-2 pr-2 text-foreground-900">
                    {row.label}
                    {row.undated && (
                      <span className="ml-1.5 rounded-full bg-accent-100 px-1.5 py-0.5 text-[9.5px] text-accent-900">
                        확인 필요
                      </span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-700">
                    {monthFormatter.format(row.count)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-900">
                    {formatThb(row.revenue)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-600">
                    − {formatThb(row.cost)}
                  </td>
                  <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-600">
                    − {formatThb(row.charges)}
                  </td>
                  <td
                    className={`whitespace-nowrap px-2 py-2 text-right font-medium ${
                      row.net >= 0 ? 'text-foreground-950' : 'text-accent-800'
                    }`}
                  >
                    {formatThb(row.net)}
                  </td>
                  <td
                    className={`whitespace-nowrap py-2 pl-2 text-right ${
                      row.net >= 0 ? 'text-secondary-900' : 'text-accent-700'
                    }`}
                  >
                    {row.marginPercent}%
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-background-300/60 bg-background-100/70">
                <td className="whitespace-nowrap py-2 pr-2 font-medium text-foreground-950">
                  합계
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-800">
                  {monthFormatter.format(total.count)}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-950">
                  {formatThb(total.revenue)}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-700">
                  − {formatThb(total.cost)}
                </td>
                <td className="whitespace-nowrap px-2 py-2 text-right text-foreground-700">
                  − {formatThb(total.charges)}
                </td>
                <td
                  className={`whitespace-nowrap px-2 py-2 text-right font-medium ${
                    total.net >= 0 ? 'text-foreground-950' : 'text-accent-800'
                  }`}
                >
                  {formatThb(total.net)}
                </td>
                <td
                  className={`whitespace-nowrap py-2 pl-2 text-right font-medium ${
                    total.net >= 0 ? 'text-secondary-900' : 'text-accent-700'
                  }`}
                >
                  {total.marginPercent}%
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      <p className="mt-2.5 border-t border-background-200 pt-2.5 text-[10.5px] leading-relaxed text-foreground-500">
        상품 수정 화면의 <strong className="font-medium text-foreground-700">판매일</strong>을 기준으로
        묶습니다. 판매일이 비어 있는 상품은 “날짜 미기록”으로 모아 마지막 줄에 표시하니, 판매일을 한 번
        채워 주시면 해당 월로 옮겨 집계됩니다.
      </p>
    </div>
  );
}