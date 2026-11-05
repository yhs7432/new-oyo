import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { typeOptions } from '@/utils/products';
import { SHEET_EDIT_URL } from '@/config/admin';
import { useFxRate } from '@/hooks/useFxRate';
import { formatKrw, formatThb, statusClass } from '@/pages/admin/utils';
import ItemEditModal from '@/pages/admin/components/ItemEditModal';
import { isWriterReady, updateSheetRows } from '@/services/sheetWrite';
import {
  CATEGORY_LABEL,
  SPECIAL_FLAG,
  SPECIAL_PRICE,
  categoryBadgeClass,
  isSpecial,
  writeNoteValue,
} from '@/utils/sheetNote';
import { Link } from 'react-router-dom';

interface Props {
  items: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PAGE_SIZES = [20, 50, 100];

export default function InventoryPanel({ items, loading, error, onRetry }: Props) {
  const { rate, setRate } = useFxRate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [pageSize, setPageSize] = useState(20);
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const toggleSpecial = async (product: Product) => {
    const note = product.raw?.['비고'] ?? '';
    const turningOn = !isSpecial(note);
    const nextNote = writeNoteValue(note, SPECIAL_FLAG, turningOn ? 'Y' : null);
    const finalNote = turningOn ? nextNote : writeNoteValue(nextNote, SPECIAL_PRICE, null);

    setBusyId(product.id);
    setNotice('');
    const result = await updateSheetRows([{ id: product.id, fields: { 비고: finalNote } }]);
    setBusyId(null);
    setNotice(
      result.ok
        ? `${product.id} · ${turningOn ? '특가 상품으로 이동했습니다.' : '중고 상품으로 돌렸습니다.'} ${result.message}`
        : result.message,
    );
    if (result.ok) onRetry();
  };

  const statusOptions = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.stockStatus ?? '상태 없음'))).filter(
        (value) => value.length > 0,
      ),
    [items],
  );

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return items.filter((product) => {
      if (type !== 'all' && product.type !== type) return false;
      if (status !== 'all' && (product.stockStatus ?? '상태 없음') !== status) return false;
      if (!keyword) return true;
      return [product.id, product.name.en, product.brand, product.spec]
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [items, query, type, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const rows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selected = items.find((item) => item.id === selectedId) ?? null;

  useEffect(() => {
    setPage(1);
  }, [query, type, status, pageSize]);

  const pageNumbers = useMemo(() => {
    const windowSize = 5;
    let start = Math.max(1, safePage - Math.floor(windowSize / 2));
    const end = Math.min(totalPages, start + windowSize - 1);
    start = Math.max(1, Math.min(start, end - windowSize + 1));
    const list: number[] = [];
    for (let i = start; i <= end; i += 1) list.push(i);
    return list;
  }, [safePage, totalPages]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl text-foreground-950">현재 재고</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            시트의 재고를 검색·필터로 확인하고, 수정한 내용은 그대로 구글시트에 저장됩니다. 골프채는
            중고 상품으로, 골프채 외 상품은 액세서리로 자동 분류됩니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
          >
            <i className="ri-refresh-line mr-1"></i>
            새로고침
          </button>
          <a
            href={SHEET_EDIT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-[12px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            <i className="ri-google-fill"></i>
            시트 열기
          </a>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-background-200 bg-background-50 p-3.5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
              <i className="ri-search-line text-[15px]"></i>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="상품명 · 브랜드 · 재고번호 검색"
              className="w-full box-border rounded-md border border-background-300 bg-background-100 py-2 pl-9 pr-3 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-500 focus:border-primary-500"
            />
          </div>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
            aria-label="카테고리"
            className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500 lg:w-40"
          >
            <option value="all">전체 종류</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'accessory' ? '액세서리' : option === 'bag' ? '가방' : option}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            aria-label="재고 상태"
            className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500 lg:w-40"
          >
            <option value="all">전체 상태</option>
            {statusOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value))}
            aria-label="페이지당 개수"
            className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500 lg:w-32"
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}개씩
              </option>
            ))}
          </select>

          <label className="flex items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 bg-background-100 px-2.5 py-2 text-[11.5px] text-foreground-600">
            1฿ =
            <input
              type="number"
              step={0.1}
              value={rate}
              onChange={(event) => setRate(Number(event.target.value))}
              aria-label="원화 환율"
              className="w-14 box-border rounded border border-background-300 bg-background-50 px-1.5 py-0.5 text-right text-[12px] text-foreground-900 outline-none focus:border-primary-500"
            />
            원
          </label>
        </div>
      </div>

      {!isWriterReady() && (
        <p className="mt-4 rounded-lg border border-accent-300/70 bg-accent-50 px-4 py-3 text-[11.5px] leading-relaxed text-accent-900">
          <i className="ri-information-line mr-1"></i>
          아직 시트 쓰기 연결이 없습니다. “시트 연동” 화면에서 연결하면 여기서 저장한 값이 실제
          시트에 기록되고 홈페이지에 반영됩니다.
        </p>
      )}

      {notice && (
        <p className="mt-4 rounded-lg border border-secondary-300/70 bg-secondary-50 px-4 py-2.5 text-[11.5px] leading-relaxed text-secondary-900">
          <i className="ri-arrow-left-right-line mr-1"></i>
          {notice}
        </p>
      )}

      {error && (
        <div className="mt-4 rounded-lg border border-accent-300 bg-accent-50 p-4">
          <p className="flex items-center gap-2 text-[12.5px] font-medium text-accent-900">
            <i className="ri-error-warning-line"></i>
            재고를 불러오지 못했습니다.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-2.5 cursor-pointer whitespace-nowrap rounded-md bg-foreground-900 px-3.5 py-1.5 text-[11.5px] text-background-50"
          >
            다시 시도
          </button>
        </div>
      )}

      {!error && loading && (
        <p className="mt-4 text-[12.5px] text-foreground-600">재고를 불러오는 중…</p>
      )}

      {!error && !loading && filtered.length === 0 && (
        <p className="mt-4 rounded-lg border border-background-200 bg-background-50 px-4 py-8 text-center text-[12.5px] text-foreground-600">
          조건에 맞는 상품이 없습니다.
        </p>
      )}

      {!error && !loading && filtered.length > 0 && (
        <>
          <div className="mt-4 overflow-x-auto rounded-lg border border-background-200 bg-background-50">
            <table className="w-full min-w-[940px] border-collapse text-left">
              <thead>
                <tr className="border-b border-background-200 bg-background-100/70">
                  {['상품 정보', '수량 · 구성', '상태 · 위치', '관리', '판매가 (THB / KRW)'].map(
                    (label) => (
                      <th
                        key={label}
                        className="whitespace-nowrap px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-500"
                      >
                        {label}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((product) => (
                  <tr key={product.id} className="border-b border-background-200/70 last:border-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-14 w-11 shrink-0 overflow-hidden rounded bg-background-200">
                          <img
                            src={product.image}
                            alt={product.name.en}
                            title={product.name.en}
                            className="h-full w-full object-cover object-top"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="max-w-[250px] truncate text-[12.5px] font-medium text-foreground-900">
                            {product.name.en}
                          </p>
                          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10.5px] text-foreground-500">
                            <span
                              className={`rounded-full px-1.5 py-0.5 text-[9.5px] ${categoryBadgeClass(product.category)}`}
                            >
                              {CATEGORY_LABEL[product.category]}
                            </span>
                            <span>
                              {product.brand} · {product.id}
                            </span>
                          </p>
                          <p className="text-[10.5px] text-foreground-500">
                            {product.addedAt || '등록일 없음'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="whitespace-nowrap text-[12px] text-foreground-900">1 PCS</p>
                      <p className="mt-0.5 max-w-[180px] text-[10.5px] leading-relaxed text-foreground-500">
                        {product.spec}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10.5px] ${statusClass(product.stockStatus)}`}
                      >
                        {product.stockStatus ?? '상태 없음'}
                      </span>
                      <p className="mt-1 whitespace-nowrap text-[10.5px] text-foreground-500">
                        태국 매장 · {product.headCoverIncluded ? '헤드커버 포함' : '커버 미포함'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedId(product.id)}
                          className="cursor-pointer whitespace-nowrap rounded border border-background-300 px-2 py-1 text-[11px] text-foreground-800 transition-colors hover:border-foreground-400"
                        >
                          수정·저장
                        </button>
                        <Link
                          to={`/products/${product.id}`}
                          className="cursor-pointer whitespace-nowrap rounded border border-background-300 px-2 py-1 text-[11px] text-foreground-800 transition-colors hover:border-foreground-400"
                        >
                          상세
                        </Link>
                        {product.category !== 'accessories' && (
                          <button
                            type="button"
                            onClick={() => void toggleSpecial(product)}
                            disabled={busyId === product.id || !isWriterReady()}
                            title={
                              isWriterReady()
                                ? product.category === 'events'
                                  ? '중고 상품으로 되돌립니다'
                                  : '특가 상품 페이지로 옮깁니다'
                                : '시트 쓰기 연결 후 사용할 수 있습니다'
                            }
                            className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded border px-2 py-1 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                              product.category === 'events'
                                ? 'border-accent-500 bg-accent-500 text-background-50 hover:bg-accent-600'
                                : 'border-background-300 text-foreground-800 hover:border-primary-400'
                            }`}
                          >
                            <i
                              className={
                                busyId === product.id
                                  ? 'ri-loader-4-line animate-spin'
                                  : product.category === 'events'
                                    ? 'ri-arrow-go-back-line'
                                    : 'ri-price-tag-3-line'
                              }
                            ></i>
                            {product.category === 'events' ? '특가 해제' : '특가'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {product.priceOnRequest ? (
                        <span className="text-[11.5px] text-accent-700">가격 문의</span>
                      ) : (
                        <>
                          <p className="whitespace-nowrap text-[12.5px] font-medium text-foreground-950">
                            {formatThb(product.price)}
                          </p>
                          <p className="mt-0.5 whitespace-nowrap text-[10.5px] text-foreground-500">
                            {formatKrw(product.price * rate)}
                          </p>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col items-center justify-between gap-2.5 sm:flex-row">
            <span className="text-[11.5px] text-foreground-600">
              총 {filtered.length.toLocaleString('en-US')}개 ·{' '}
              {(safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}개 표시
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPage((value) => Math.max(1, value - 1))}
                disabled={safePage === 1}
                className="cursor-pointer whitespace-nowrap rounded border border-background-300 px-2.5 py-1 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                ‹ 이전
              </button>
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  className={`h-7 w-7 cursor-pointer rounded border text-[11.5px] transition-colors ${
                    number === safePage
                      ? 'border-foreground-900 bg-foreground-900 text-background-50'
                      : 'border-background-300 text-foreground-700 hover:border-foreground-400'
                  }`}
                >
                  {number}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
                disabled={safePage === totalPages}
                className="cursor-pointer whitespace-nowrap rounded border border-background-300 px-2.5 py-1 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                다음 ›
              </button>
            </div>
          </div>
        </>
      )}

      {selected && (
        <ItemEditModal
          product={selected}
          rate={rate}
          onClose={() => setSelectedId(null)}
          onSaved={onRetry}
        />
      )}
    </div>
  );
}