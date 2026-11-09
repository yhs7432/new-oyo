import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { useFxRate } from '@/hooks/useFxRate';
import { formatKrw, formatThb } from '@/pages/admin/utils';
import { archiveSaleEntry, isWriterReady, updateSheetRows } from '@/services/sheetWrite';
import { isSoldItem } from '@/utils/settlement';
import { CATEGORY_LABEL, SALE_DATE, writeNoteValue } from '@/utils/sheetNote';

interface Props {
  items: Product[];
  staffName: string;
  onDone: () => void;
}

const CHANNELS = ['매장 판매', '도매 파트너', '온라인', '기타'];
/** 예전에 판매 후 직접 숨겨 두었을 때 남는 비고 표시. 복구하면 함께 지웁니다. */
const HIDDEN_MARKER = '웹숨김(N)';

function costKrwOf(product: Product): number {
  return Number(String(product.raw?.['한국원가(KRW)'] ?? '').replace(/[^0-9]/g, '')) || 0;
}

/**
 * 메인 시트를 다시 입력하면서 판매 완료 상태가 초기화된 상품을 되살립니다.
 * ‘웹노출 N’으로 숨겨져 있지만 아직 판매 완료로 기록되지 않은 상품을 모아,
 * 한 번에 판매 완료로 정리하고 ‘판매 완료’ 탭에도 기록을 남깁니다.
 */
export default function SaleRecoveryPanel({ items, staffName, onDone }: Props) {
  const { rate } = useFxRate();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [saleDate, setSaleDate] = useState('');
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const candidates = useMemo(
    () => items.filter((item) => item.visible === false && !isSoldItem(item) && !item.saleRecord),
    [items],
  );

  const signature = candidates.map((item) => item.id).join(',');

  // 목록이 바뀌면 기본값을 “전부 선택”으로 맞춥니다.
  useEffect(() => {
    setSelected(candidates.map((item) => item.id));
  }, [signature]);

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    );
  };

  const allSelected = candidates.length > 0 && selected.length === candidates.length;

  const recover = async () => {
    const targets = candidates.filter((item) => selected.includes(item.id));
    if (targets.length === 0) {
      setError('복구할 상품을 하나 이상 선택해 주세요.');
      return;
    }
    if (!isWriterReady()) {
      setError('시트 쓰기 연결이 없어 복구할 수 없습니다. 위쪽 “시트 연결”을 먼저 설정해 주세요.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');
    setProgress('시트에 판매 완료로 기록하는 중…');

    const rows = targets.map((product) => {
      const note = product.raw?.['비고'] ?? '';
      const cleaned = writeNoteValue(note, HIDDEN_MARKER, null);
      const fields: Record<string, string | number> = {
        재고상태: '판매 완료',
        웹노출: 'N',
      };
      const withDate = saleDate ? writeNoteValue(cleaned, SALE_DATE, saleDate) : cleaned;
      if (withDate !== note) fields['비고'] = withDate;
      return { id: product.id, fields };
    });

    const update = await updateSheetRows(rows);
    if (!update.ok) {
      setBusy(false);
      setProgress('');
      setError(update.message);
      return;
    }

    let archived = 0;
    const failed: string[] = [];
    for (let index = 0; index < targets.length; index += 1) {
      const product = targets[index];
      setProgress(`‘판매 완료’ 탭에 기록하는 중… ${index + 1} / ${targets.length}`);
      const revenue = product.priceOnRequest ? 0 : product.price;
      const costKrw = costKrwOf(product);
      const costThb = rate > 0 ? costKrw / rate : 0;
      const result = await archiveSaleEntry({
        판매일: saleDate,
        재고번호: product.id,
        상품명: product.name.en,
        브랜드: product.brand,
        카테고리: CATEGORY_LABEL[product.category],
        중고등급: product.headGrade ?? '',
        '상태(%)': product.conditionPercent ?? '',
        '판매가(THB)': revenue,
        '원가(KRW)': costKrw,
        'VAT(THB)': 0,
        '웹수수료(THB)': 0,
        '순수익(THB)': Math.round(revenue - costThb),
        환율: rate,
        판매채널: channel,
        담당자: staffName,
        메모: '과거 판매분 일괄 복구',
      });
      if (result.ok) archived += 1;
      else failed.push(product.id);
    }

    setBusy(false);
    setProgress('');
    setMessage(
      `${targets.length}건을 판매 완료로 되살렸습니다. 그중 ${archived}건이 ‘판매 완료’ 탭에 기록되었습니다.` +
        (failed.length > 0
          ? ` 기록에 실패한 재고번호: ${failed.slice(0, 8).join(', ')}${failed.length > 8 ? ' 외' : ''} — 각 상품을 열어 한 번 더 저장하면 기록됩니다.`
          : ''),
    );
    onDone();
  };

  return (
    <div className="mt-5 rounded-lg border border-background-200 bg-background-50">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 font-heading text-[13.5px] text-foreground-950">
            <span className="flex h-4 w-4 items-center justify-center text-[14px] text-foreground-500">
              <i className="ri-history-line"></i>
            </span>
            과거 판매 복구
            <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10.5px] font-medium text-secondary-900">
              숨김 상품 {candidates.length}건
            </span>
          </span>
          <span className="mt-1 block text-[11.5px] leading-relaxed text-foreground-600">
            메인 시트를 다시 입력하면서 판매 완료가 풀린 상품을 한 번에 되살립니다. 웹노출이 N인데
            아직 판매 완료로 기록되지 않은 상품만 모았습니다.
          </span>
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center text-foreground-500">
          <i className={open ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'}></i>
        </span>
      </button>

      {open && (
        <div className="border-t border-background-200 px-4 py-3.5">
          {candidates.length === 0 ? (
            <p className="rounded-md bg-background-100 px-3.5 py-3 text-[11.5px] leading-relaxed text-foreground-600">
              <i className="ri-check-double-line mr-1"></i>
              복구할 상품이 없습니다. 숨김 상태이면서 판매 완료로 기록되지 않은 상품이 없습니다.
            </p>
          ) : (
            <>
              <div className="flex flex-col gap-2.5 lg:flex-row lg:items-end">
                <label className="block min-w-0 lg:w-48">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                    판매일 (모르면 비워 두세요)
                  </span>
                  <input
                    type="date"
                    value={saleDate}
                    onChange={(event) => setSaleDate(event.target.value)}
                    className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500"
                  />
                </label>
                <div className="min-w-0">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                    판매 채널
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {CHANNELS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setChannel(option)}
                        className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] transition-colors ${
                          channel === option
                            ? 'bg-foreground-900 text-background-50'
                            : 'border border-background-300 text-foreground-700 hover:border-foreground-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 lg:ml-auto">
                  <button
                    type="button"
                    onClick={() =>
                      setSelected(allSelected ? [] : candidates.map((item) => item.id))
                    }
                    className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400"
                  >
                    {allSelected ? '전체 해제' : '전체 선택'}
                  </button>
                  <span className="text-[11.5px] text-foreground-600">
                    {selected.length} / {candidates.length}건 선택
                  </span>
                </div>
              </div>

              <div className="mt-3 max-h-80 overflow-y-auto rounded-md border border-background-200">
                <table className="w-full min-w-[520px] border-collapse text-left">
                  <thead className="sticky top-0 bg-background-100/95">
                    <tr>
                      <th className="w-10 px-2.5 py-2">
                        <span className="sr-only">선택</span>
                      </th>
                      {['재고번호', '상품', '판매가(THB)', '원가(KRW)'].map((label) => (
                        <th
                          key={label}
                          className="whitespace-nowrap px-2.5 py-2 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-500"
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((product) => {
                      const checked = selected.includes(product.id);
                      return (
                        <tr
                          key={product.id}
                          className="cursor-pointer border-t border-background-200/70 transition-colors hover:bg-background-100/70"
                          onClick={() => toggle(product.id)}
                        >
                          <td className="px-2.5 py-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggle(product.id)}
                              onClick={(event) => event.stopPropagation()}
                              className="h-3.5 w-3.5 cursor-pointer accent-foreground-900"
                            />
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2 text-[11.5px] text-foreground-900">
                            {product.id}
                          </td>
                          <td className="px-2.5 py-2">
                            <p className="max-w-[220px] truncate text-[11.5px] text-foreground-900">
                              {product.name.en}
                            </p>
                            <p className="text-[10px] text-foreground-500">{product.brand}</p>
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2 text-[11.5px] text-foreground-900">
                            {product.priceOnRequest ? (
                              <span className="text-accent-700">가격 없음</span>
                            ) : (
                              formatThb(product.price)
                            )}
                          </td>
                          <td className="whitespace-nowrap px-2.5 py-2 text-[11px] text-foreground-600">
                            {costKrwOf(product) > 0 ? formatKrw(costKrwOf(product)) : '—'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <p className="mt-2.5 text-[10.5px] leading-relaxed text-foreground-500">
                판매일을 비워 두면 정산에서 “날짜 미기록”으로 잡힙니다. 판매가는 지금 시트에 적힌
                THB 가격을 사용하니, 실제 판매가와 다르면 복구 후 각 상품을 열어 저장해 주세요.
              </p>

              {error && (
                <p className="mt-2.5 rounded-md border border-accent-300/70 bg-accent-50 px-3 py-2.5 text-[11px] leading-relaxed text-accent-900">
                  <i className="ri-error-warning-line mr-1"></i>
                  {error}
                </p>
              )}
              {busy && progress && (
                <p className="mt-2.5 rounded-md border border-secondary-300/70 bg-secondary-50 px-3 py-2.5 text-[11px] leading-relaxed text-secondary-900">
                  <i className="ri-loader-4-line mr-1 animate-spin"></i>
                  {progress}
                </p>
              )}
              {!busy && message && (
                <p className="mt-2.5 rounded-md border border-secondary-300/70 bg-secondary-50 px-3 py-2.5 text-[11px] leading-relaxed text-secondary-900">
                  <i className="ri-check-line mr-1"></i>
                  {message}
                </p>
              )}

              <div className="mt-3 flex flex-col items-start justify-between gap-2 border-t border-background-200 pt-3 sm:flex-row sm:items-center">
                <span className="text-[11px] text-foreground-500">
                  선택한 상품은 홈페이지에서 숨겨지고 판매 완료로 집계됩니다.
                </span>
                <button
                  type="button"
                  onClick={() => void recover()}
                  disabled={busy || selected.length === 0}
                  className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {busy ? '복구 중…' : `선택한 ${selected.length}건 판매 완료로 복구`}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}