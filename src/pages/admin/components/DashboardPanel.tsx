import { useMemo } from 'react';
import type { Product } from '@/types/product';
import type { AdminTab } from '@/config/admin';
import { SHEET_EDIT_URL } from '@/config/admin';
import { formatKrw, formatThb, countStatus } from '@/pages/admin/utils';
import { useFxRate } from '@/hooks/useFxRate';
import { formatFxRate } from '@/services/fxRate';

interface Props {
  items: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  onTab: (tab: AdminTab) => void;
}

export default function DashboardPanel({ items, loading, error, onRetry, onTab }: Props) {
  const { rate, base, auto, rateDate } = useFxRate();

  const summary = useMemo(() => {
    const available = countStatus(items, '가능');
    const reserved = countStatus(items, '예약');
    const sold = countStatus(items, '완료');
    const priced = items.filter((item) => !item.priceOnRequest);
    const totalThb = priced.reduce((sum, item) => sum + item.price, 0);
    const noPrice = items.length - priced.length;
    const noPhoto = items.filter((item) => (item.images?.length ?? 0) === 0).length;
    return { available, reserved, sold, totalThb, noPrice, noPhoto, priced: priced.length };
  }, [items]);

  const recent = useMemo(
    () =>
      [...items]
        .sort((a, b) => {
          if (a.addedAt === b.addedAt) return a.id < b.id ? 1 : -1;
          return a.addedAt < b.addedAt ? 1 : -1;
        })
        .slice(0, 6),
    [items],
  );

  const stages: { key: AdminTab; label: string; value: number; caption: string; tone: string }[] = [
    {
      key: 'register',
      label: '상품 등록 (누적)',
      value: items.length,
      caption: '웹에 노출 중인 전체 상품',
      tone: 'bg-background-100',
    },
    {
      key: 'stock',
      label: '판매 가능',
      value: summary.available,
      caption: '한국·태국 통합 판매 가능',
      tone: 'bg-secondary-50',
    },
    {
      key: 'sale',
      label: '예약',
      value: summary.reserved,
      caption: '입금·예약 확인 필요',
      tone: 'bg-accent-50',
    },
    {
      key: 'history',
      label: '판매 완료',
      value: summary.sold,
      caption: '시트 기준 판매 완료',
      tone: 'bg-background-200/60',
    },
  ];

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl text-foreground-950">통합 재고 현황</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            구글시트 재고를 그대로 읽어 단계별 현황을 보여 줍니다. 등록·출고·판매 기록은 시트에서
            관리합니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onRetry}
            className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3.5 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
          >
            <i className="ri-refresh-line mr-1"></i>
            시트 새로고침
          </button>
          <a
            href={SHEET_EDIT_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-[12px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            <i className="ri-google-fill"></i>
            Google 시트 ↗
          </a>
        </div>
      </div>

      {error && (
        <div className="mt-5 rounded-lg border border-accent-300 bg-accent-50 p-4">
          <p className="flex items-center gap-2 text-[12.5px] font-medium text-accent-900">
            <i className="ri-error-warning-line"></i>
            재고를 불러오지 못했습니다. 시트 공유 설정을 확인해 주세요.
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

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stages.map((stage, index) => (
          <button
            key={stage.label}
            type="button"
            onClick={() => onTab(stage.key)}
            className={`cursor-pointer rounded-lg border border-background-200 ${stage.tone} p-4 text-left transition-colors hover:border-foreground-300`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
                {stage.label}
              </span>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-background-50 text-[10px] text-foreground-600">
                {index + 1}
              </span>
            </div>
            <strong className="mt-2 block font-heading text-3xl font-normal text-foreground-950">
              {loading ? '—' : stage.value.toLocaleString('en-US')}
            </strong>
            <span className="mt-1 block text-[11px] text-foreground-500">{stage.caption}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <p className="text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">
            판매가 기준 재고 금액
          </p>
          <div className="mt-2 flex flex-wrap items-end gap-x-4 gap-y-1">
            <strong className="font-heading text-2xl font-normal text-foreground-950">
              {formatThb(summary.totalThb)}
            </strong>
            <span className="text-[12px] text-foreground-600">
              약 {formatKrw(summary.totalThb * rate)} · {formatFxRate(rate, base)}
              {auto && rateDate ? ` (${rateDate} 자동)` : ''}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-foreground-500">
            가격이 입력된 {summary.priced.toLocaleString('en-US')}개 상품 기준입니다.
          </p>
        </div>
        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <p className="text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">확인이 필요해요</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onTab('stock')}
              className="cursor-pointer rounded-full bg-accent-100 px-3 py-1.5 text-[11.5px] text-accent-900 transition-colors hover:bg-accent-200"
            >
              가격 미정 {summary.noPrice}개
            </button>
            <button
              type="button"
              onClick={() => onTab('stock')}
              className="cursor-pointer rounded-full bg-background-200 px-3 py-1.5 text-[11.5px] text-foreground-700 transition-colors hover:bg-background-300"
            >
              사진 없음 {summary.noPhoto}개
            </button>
            <button
              type="button"
              onClick={() => onTab('stock')}
              className="cursor-pointer rounded-full bg-secondary-100 px-3 py-1.5 text-[11.5px] text-secondary-900 transition-colors hover:bg-secondary-200"
            >
              예약 {summary.reserved}개
            </button>
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 rounded-lg border border-background-200 bg-background-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="flex items-center gap-2 text-[11.5px] leading-relaxed text-foreground-600">
          <i className="ri-calculator-line text-[14px] text-foreground-500"></i>
          판매 완료 정산과 월별 추이는{' '}
          <strong className="font-medium text-foreground-900">판매·출고</strong> 화면에서
          기간을 골라 확인할 수 있습니다.
        </p>
        <button
          type="button"
          onClick={() => onTab('sale')}
          className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-3 py-1.5 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400 hover:text-foreground-950"
        >
          정산 보러 가기 ›
        </button>
      </div>

      <div className="mt-6 rounded-lg border border-background-200 bg-background-50">
        <div className="flex items-center justify-between border-b border-background-200 px-4 py-3">
          <h2 className="text-[12.5px] font-medium text-foreground-900">최근 등록 상품</h2>
          <button
            type="button"
            onClick={() => onTab('stock')}
            className="cursor-pointer whitespace-nowrap text-[11.5px] text-foreground-600 transition-colors hover:text-foreground-950"
          >
            전체 재고 보기 ›
          </button>
        </div>

        {loading && <p className="px-4 py-6 text-[12px] text-foreground-600">재고를 불러오는 중…</p>}
        {!loading && recent.length === 0 && (
          <p className="px-4 py-6 text-[12px] text-foreground-600">표시할 상품이 없습니다.</p>
        )}

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2 xl:grid-cols-3">
          {recent.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-3 border-b border-background-200/70 px-4 py-3 last:border-0"
            >
              <div className="h-12 w-10 shrink-0 overflow-hidden rounded bg-background-200">
                <img
                  src={product.image}
                  alt={product.name.en}
                  title={product.name.en}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground-900">
                  {product.name.en}
                </p>
                <p className="mt-0.5 truncate text-[10.5px] text-foreground-500">
                  {product.brand} · {product.addedAt || '등록일 없음'}
                </p>
              </div>
              <span className="whitespace-nowrap text-[11.5px] text-foreground-800">
                {product.priceOnRequest ? '가격 문의' : formatThb(product.price)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-4 rounded-lg bg-background-200/50 px-4 py-3 text-[11px] leading-relaxed text-foreground-600">
        한국에서 바로 판매된 상품은 태국 입고 단계를 거치지 않고 판매 완료로 넘어갑니다. 이 화면은
        시트의 재고상태 값을 그대로 집계합니다.
      </p>
    </div>
  );
}