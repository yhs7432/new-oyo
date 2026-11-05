import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import { typeOptions } from '@/utils/products';
import { WHOLESALE_RATE } from '@/config/admin';
import { useFxRate } from '@/hooks/useFxRate';
import { formatKrw, formatThb, statusClass, wholesalePrice } from '@/pages/admin/utils';

interface Props {
  items: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

const PAGE_SIZES = [12, 24, 48];

const TYPE_LABEL: Record<string, string> = {
  driver: '드라이버',
  wood: '우드',
  iron: '아이언',
  utility: '유틸리티',
  wedge: '웨지',
  putter: '퍼터',
  bag: '백',
  accessory: '액세서리',
};

export default function PartnerPanel({ items, loading, error, onRetry }: Props) {
  const { rate, setRate } = useFxRate();
  const [query, setQuery] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');
  const [pageSize, setPageSize] = useState(12);
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [query, type, status, pageSize]);

  const available = filtered.filter((item) => (item.stockStatus ?? '').includes('가능')).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary-100 px-2.5 py-1 text-[10.5px] font-medium text-secondary-900">
            <i className="ri-store-3-line"></i>
            도매 파트너 전용
          </span>
          <h1 className="mt-2 font-heading text-2xl text-foreground-950">도매 카탈로그</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            현재 판매 가능한 재고와 도매가를 확인하실 수 있습니다. 도매가는 판매가의{' '}
            {Math.round(WHOLESALE_RATE * 100)}% 기준이며, 수량·출고 일정은 담당자에게 문의해
            주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="cursor-pointer whitespace-nowrap self-start rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
        >
          <i className="ri-refresh-line mr-1"></i>
          새로고침
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {[
          { label: '전체 상품', value: items.length.toLocaleString('en-US'), icon: 'ri-archive-2-line' },
          { label: '검색 결과', value: filtered.length.toLocaleString('en-US'), icon: 'ri-search-line' },
          { label: '판매 가능', value: available.toLocaleString('en-US'), icon: 'ri-checkbox-circle-line' },
          {
            label: '도매가 기준',
            value: `판매가 ${Math.round(WHOLESALE_RATE * 100)}%`,
            icon: 'ri-price-tag-3-line',
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-background-200 bg-background-50 px-3.5 py-3"
          >
            <div className="flex items-center gap-1.5 text-[10.5px] text-foreground-500">
              <span className="flex h-3.5 w-3.5 items-center justify-center text-[13px]">
                <i className={stat.icon}></i>
              </span>
              {stat.label}
            </div>
            <p className="mt-1.5 font-heading text-[17px] text-foreground-950">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-lg border border-background-200 bg-background-50 p-3.5">
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
            <option value="all">전체 카테고리</option>
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {TYPE_LABEL[option] ?? option}
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
            className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500 lg:w-28"
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

      {error && (
        <div className="mt-4 rounded-lg border border-accent-300 bg-accent-50 p-4">
          <p className="flex items-center gap-2 text-[12.5px] font-medium text-accent-900">
            <i className="ri-error-warning-line"></i>
            상품 목록을 불러오지 못했습니다.
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
        <p className="mt-4 text-[12.5px] text-foreground-600">목록을 불러오는 중…</p>
      )}

      {!error && !loading && filtered.length === 0 && (
        <p className="mt-4 rounded-lg border border-background-200 bg-background-50 px-4 py-10 text-center text-[12.5px] text-foreground-600">
          조건에 맞는 상품이 없습니다.
        </p>
      )}

      {!error && !loading && filtered.length > 0 && (
        <>
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((product) => {
              const wholesale = wholesalePrice(product.price, WHOLESALE_RATE);
              return (
                <article
                  key={product.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50"
                >
                  <div className="h-40 w-full overflow-hidden bg-background-200">
                    <img
                      src={product.image}
                      alt={product.name.en}
                      title={`${product.name.en} ${product.brand}`}
                      className="h-full w-full object-cover object-top"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] ${statusClass(product.stockStatus)}`}
                      >
                        {product.stockStatus ?? '상태 없음'}
                      </span>
                      {product.headGrade && (
                        <span className="inline-flex items-center rounded-full bg-background-200 px-2 py-0.5 text-[10px] text-foreground-700">
                          헤드 {product.headGrade}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
                      {product.brand}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-[12.5px] font-medium leading-snug text-foreground-950">
                      {product.name.en}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10.5px] leading-relaxed text-foreground-500">
                      {product.spec || TYPE_LABEL[product.type] || product.type}
                    </p>

                    <div className="mt-3 flex items-end justify-between gap-2 border-t border-background-200 pt-2.5">
                      <div className="min-w-0">
                        <p className="text-[9.5px] uppercase tracking-[0.14em] text-foreground-500">
                          도매가
                        </p>
                        {product.priceOnRequest || wholesale <= 0 ? (
                          <p className="mt-0.5 whitespace-nowrap text-[12px] font-medium text-accent-700">
                            견적 문의
                          </p>
                        ) : (
                          <>
                            <p className="mt-0.5 whitespace-nowrap font-heading text-[15px] text-foreground-950">
                              {formatThb(wholesale)}
                            </p>
                            <p className="whitespace-nowrap text-[10px] text-foreground-500">
                              {formatKrw(wholesale * rate)}
                            </p>
                          </>
                        )}
                      </div>
                      <Link
                        to={`/products/${product.id}`}
                        className="shrink-0 cursor-pointer whitespace-nowrap rounded-md border border-foreground-900 px-2.5 py-1.5 text-[11px] text-foreground-900 transition-colors hover:bg-foreground-900 hover:text-background-50"
                      >
                        상세
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-4 flex flex-col items-center justify-between gap-2.5 sm:flex-row">
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
              <span className="px-1 text-[11.5px] text-foreground-600">
                {safePage} / {totalPages}
              </span>
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

      <p className="mt-5 rounded-lg border border-background-200 bg-background-100/70 px-4 py-3 text-[11px] leading-relaxed text-foreground-600">
        <i className="ri-information-line mr-1"></i>
        도매 카탈로그는 재고 조회 전용 화면입니다. 매입 원가와 시트 편집 도구는 파트너 등급에
        표시되지 않으며, 주문·출고 요청은 담당자에게 직접 전달해 주세요.
      </p>
    </div>
  );
}