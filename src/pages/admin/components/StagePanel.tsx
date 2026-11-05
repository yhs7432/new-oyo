import { useMemo } from 'react';
import type { Product } from '@/types/product';
import { SHEET_EDIT_URL } from '@/config/admin';
import { formatThb, statusClass } from '@/pages/admin/utils';
import SettlementSection from '@/pages/admin/components/SettlementSection';

export type StageKey = 'register' | 'dispatch' | 'receive' | 'sale' | 'audit' | 'history';

interface Props {
  stage: StageKey;
  items: Product[];
  loading: boolean;
}

const CONFIG: Record<
  StageKey,
  { title: string; desc: string; steps: string[]; listTitle: string; empty: string }
> = {
  register: {
    title: '상품 등록',
    desc: '새 상품은 구글시트에 행을 추가하면 이 화면과 홈페이지에 곧바로 반영됩니다.',
    steps: [
      '시트에 재고번호·브랜드·상품명·카테고리·사양을 입력합니다.',
      '판매가격(THB)과 재고상태를 채웁니다.',
      '사진 링크를 비고 칸에 넣으면 상세 페이지에 사진이 표시됩니다.',
      '웹노출 칸을 Y로 바꾸면 홈페이지에 노출됩니다.',
    ],
    listTitle: '최근 등록 상품',
    empty: '시트에 등록된 상품이 없습니다.',
  },
  dispatch: {
    title: '한국 출고',
    desc: '한국에서 태국으로 보내는 상품의 출고를 확정하는 단계입니다.',
    steps: [
      '출고할 상품을 박스 단위로 묶어 확인합니다.',
      '출고일과 운송장 번호를 시트 비고 칸에 기록합니다.',
      '재고상태를 출고 완료(운송 중)로 바꿉니다.',
      '태국 도착 후 태국 입고 화면에서 확인합니다.',
    ],
    listTitle: '출고 진행 상품',
    empty: '출고 대기로 표시된 상품이 없습니다. 시트의 재고상태를 확인해 주세요.',
  },
  receive: {
    title: '태국 입고',
    desc: '태국 매장에 도착한 상품을 확인하고 판매 가능 상태로 전환합니다.',
    steps: [
      '도착 상품의 재고번호를 확인합니다.',
      '파손·수량 차이를 확인해 시트에 기록합니다.',
      '재고상태를 판매 가능으로 변경합니다.',
      '매장 진열 후 판매·출고 화면에서 관리합니다.',
    ],
    listTitle: '입고 확인 상품',
    empty: '입고 대기로 표시된 상품이 없습니다.',
  },
  sale: {
    title: '판매·출고',
    desc: '판매된 상품의 판매가와 채널을 확인합니다.',
    steps: [
      '판매 상품의 재고번호를 확인합니다.',
      '판매가격과 판매일, 판매 채널을 기록합니다.',
      '재고상태를 판매 완료로 변경합니다.',
      '증빙이 필요하면 이력·증빙 화면에서 확인합니다.',
    ],
    listTitle: '판매 완료 상품',
    empty: '판매 완료로 표시된 상품이 없습니다.',
  },
  audit: {
    title: '재고실사',
    desc: '시트의 재고와 매장 실물을 대조해 차이를 확인합니다.',
    steps: [
      '실사 기준일을 정하고 목록을 출력합니다.',
      '매장에서 실물 재고번호를 확인합니다.',
      '장부 수량과 차이가 나는 상품을 시트에 표시합니다.',
      '차이 사유를 정리해 담당자에게 공유합니다.',
    ],
    listTitle: '실사 대상 요약',
    empty: '실사 기록은 시트에서 관리됩니다. 실사 후 결과를 시트에 남겨 주세요.',
  },
  history: {
    title: '이력·증빙',
    desc: '출고·판매 이력과 증빙 자료를 확인합니다.',
    steps: [
      '상품별 이력은 시트의 비고 칸에 날짜와 함께 남깁니다.',
      '인보이스·운송장은 공유 드라이브에 보관합니다.',
      '필요한 서류는 시트 도구에서 내려받습니다.',
    ],
    listTitle: '판매 완료 상품',
    empty: '아직 기록된 이력이 없습니다.',
  },
};

export default function StagePanel({ stage, items, loading }: Props) {
  const config = CONFIG[stage];

  const list = useMemo(() => {
    if (stage === 'register') {
      return [...items]
        .sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1))
        .slice(0, 10);
    }
    if (stage === 'sale' || stage === 'history') {
      return items.filter((item) => (item.stockStatus ?? '').includes('완료')).slice(0, 10);
    }
    if (stage === 'dispatch') {
      return items.filter((item) => (item.stockStatus ?? '').includes('출고')).slice(0, 10);
    }
    if (stage === 'receive') {
      return items.filter((item) => (item.stockStatus ?? '').includes('입고')).slice(0, 10);
    }
    return items.filter((item) => !item.priceOnRequest).slice(0, 8);
  }, [items, stage]);

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl text-foreground-950">{config.title}</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            {config.desc}
          </p>
        </div>
        <a
          href={SHEET_EDIT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-[12px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
        >
          <i className="ri-google-fill"></i>
          시트에서 처리
        </a>
      </div>

      <div className="mt-5 rounded-lg border border-accent-300/70 bg-accent-50 px-4 py-3.5">
        <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-accent-900">
          <i className="ri-information-line mt-0.5 text-[14px]"></i>
          이 단계의 상태 변경은 “현재 재고” 화면에서 상품을 열어 수정·저장하면 시트에 기록됩니다.
          박스·운송장 같은 세부 메모는 시트에서 직접 적어 주세요.
        </p>
      </div>

      {stage === 'sale' && (
        <section className="mt-5">
          <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-heading text-base text-foreground-950">
              판매 완료 정산
              <span className="ml-2 text-[11px] font-normal text-foreground-500">
                기간을 정해 매출·순수익·마진을 확인합니다
              </span>
            </h2>
          </div>
          <SettlementSection items={items} />
        </section>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg border border-background-200 bg-background-50">
          <div className="border-b border-background-200 px-4 py-3">
            <h2 className="text-[12.5px] font-medium text-foreground-900">{config.listTitle}</h2>
          </div>

          {loading && <p className="px-4 py-6 text-[12px] text-foreground-600">불러오는 중…</p>}

          {!loading && list.length === 0 && (
            <p className="px-4 py-8 text-center text-[12px] leading-relaxed text-foreground-600">
              {config.empty}
            </p>
          )}

          {!loading &&
            list.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 border-b border-background-200/70 px-4 py-2.5 last:border-0"
              >
                <div className="h-11 w-9 shrink-0 overflow-hidden rounded bg-background-200">
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
                    {product.id} · {product.brand} · {product.addedAt || '등록일 없음'}
                  </p>
                </div>
                <span
                  className={`whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] ${statusClass(product.stockStatus)}`}
                >
                  {product.stockStatus ?? '상태 없음'}
                </span>
                <span className="hidden whitespace-nowrap text-[11.5px] text-foreground-800 sm:block">
                  {product.priceOnRequest ? '가격 문의' : formatThb(product.price)}
                </span>
              </div>
            ))}
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <h2 className="text-[12.5px] font-medium text-foreground-900">진행 순서</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {config.steps.map((step, index) => (
              <li key={step} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10.5px] font-medium text-secondary-900">
                  {index + 1}
                </span>
                <span className="text-[11.5px] leading-relaxed text-foreground-700">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-background-200 pt-3 text-[10.5px] leading-relaxed text-foreground-500">
            시트에서 재고상태를 바꾸면 이 화면의 숫자도 다음 새로고침에 함께 반영됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}