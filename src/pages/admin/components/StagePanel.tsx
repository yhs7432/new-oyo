import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import type { AdminIdentity } from '@/config/admin';
import { SHEET_EDIT_URL } from '@/config/admin';
import { formatThb, statusClass } from '@/pages/admin/utils';
import SettlementSection from '@/pages/admin/components/SettlementSection';
import SaleCompleteModal from '@/pages/admin/components/SaleCompleteModal';
import { isSoldItem } from '@/utils/settlement';

export type StageKey = 'register' | 'dispatch' | 'receive' | 'sale' | 'audit' | 'history';

interface Props {
  stage: StageKey;
  items: Product[];
  loading: boolean;
  identity?: AdminIdentity;
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
    desc: '판매된 상품을 정리하는 화면입니다. 판매 완료로 저장하면 재고 목록에서 빠지고, 같은 내용이 시트의 ‘판매 완료’ 탭에 한 줄씩 기록됩니다.',
    steps: [
      '판매할 상품을 찾아 “판매 완료”를 누릅니다.',
      '실제 판매가·VAT·수수료를 확인하고 저장합니다.',
      '재고상태가 판매 완료로 바뀌고 홈페이지에서 숨겨집니다.',
      '같은 내용이 시트 ‘판매 완료’ 탭에 장부로 남습니다.',
    ],
    listTitle: '판매 상품',
    empty: '판매 대기 중인 상품이 없습니다.',
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
      '판매 이력은 시트의 ‘판매 완료’ 탭에 자동으로 쌓입니다.',
      '인보이스·운송장은 공유 드라이브에 보관합니다.',
      '필요한 서류는 시트 도구에서 내려받습니다.',
    ],
    listTitle: '판매 완료 상품',
    empty: '아직 판매 완료로 기록된 상품이 없습니다.',
  },
};

type SaleFilter = 'ready' | 'sold' | 'all';

const LIST_LIMIT = 30;

function matchesStage(item: Product, stage: StageKey): boolean {
  const status = item.stockStatus ?? '';
  if (stage === 'history') return isSoldItem(item);
  if (stage === 'dispatch') return status.includes('출고');
  if (stage === 'receive') return status.includes('입고');
  if (stage === 'audit') return !item.priceOnRequest;
  return true;
}

export default function StagePanel({ stage, items, loading, identity }: Props) {
  const config = CONFIG[stage];
  const [saleFilter, setSaleFilter] = useState<SaleFilter>('ready');
  const [selling, setSelling] = useState<Product | null>(null);
  const [notice, setNotice] = useState('');

  const soldCount = useMemo(() => items.filter(isSoldItem).length, [items]);
  const readyCount = items.length - soldCount;

  const list = useMemo(() => {
    if (stage === 'register') {
      return [...items].sort((a, b) => (a.addedAt < b.addedAt ? 1 : -1)).slice(0, 10);
    }
    if (stage === 'sale') {
      const base =
        saleFilter === 'sold'
          ? items.filter(isSoldItem)
          : saleFilter === 'all'
            ? items
            : items.filter((item) => !isSoldItem(item));
      return base.slice(0, LIST_LIMIT);
    }
    return items.filter((item) => matchesStage(item, stage)).slice(0, 10);
  }, [items, saleFilter, stage]);

  const emptyText = (() => {
    if (stage !== 'sale') return config.empty;
    if (saleFilter === 'sold') return '아직 판매 완료로 기록된 상품이 없습니다.';
    if (saleFilter === 'all') return '등록된 상품이 없습니다.';
    return '판매 대기 중인 상품이 없습니다. 모두 정리되었습니다.';
  })();

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
          {stage === 'sale'
            ? '판매 완료로 저장하면 재고 목록에서는 숨겨지고, 판매 기록은 시트의 ‘판매 완료’ 탭에 자동으로 한 줄씩 남습니다. 그 시점의 환율도 함께 저장되어 이후 환율이 올라도 이 건의 정산은 그 값으로 유지됩니다. 잘못 판매 완료했다면 “기록 수정”에서 재고상태를 판매 가능으로 되돌려 저장하세요. 그러면 ‘판매 완료’ 탭의 기록과 고정 환율도 함께 정리됩니다.'
            : '이 단계의 상태 변경은 “현재 재고” 화면에서 상품을 열어 수정·저장하면 시트에 기록됩니다. 박스·운송장 같은 세부 메모는 시트에서 직접 적어 주세요.'}
        </p>
      </div>

      {notice && (
        <p className="mt-3 rounded-lg border border-secondary-300/70 bg-secondary-50 px-4 py-2.5 text-[11.5px] leading-relaxed text-secondary-900">
          <i className="ri-checkbox-circle-line mr-1"></i>
          {notice}
        </p>
      )}

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
          <div className="flex flex-col gap-2 border-b border-background-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-[12.5px] font-medium text-foreground-900">{config.listTitle}</h2>
            {stage === 'sale' && (
              <div className="flex flex-wrap items-center gap-1.5">
                {[
                  { key: 'ready' as SaleFilter, label: `판매 대기 ${readyCount}` },
                  { key: 'sold' as SaleFilter, label: `판매 완료 ${soldCount}` },
                  { key: 'all' as SaleFilter, label: '전체' },
                ].map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    onClick={() => setSaleFilter(option.key)}
                    className={`cursor-pointer whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                      saleFilter === option.key
                        ? 'bg-foreground-900 text-background-50'
                        : 'border border-background-300 text-foreground-700 hover:border-foreground-400'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {loading && <p className="px-4 py-6 text-[12px] text-foreground-600">불러오는 중…</p>}

          {!loading && list.length === 0 && (
            <p className="px-4 py-8 text-center text-[12px] leading-relaxed text-foreground-600">
              {emptyText}
            </p>
          )}

          {!loading &&
            list.map((product) => {
              const sold = isSoldItem(product);
              return (
                <div
                  key={product.id}
                  className="flex flex-wrap items-center gap-3 border-b border-background-200/70 px-4 py-2.5 last:border-0"
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
                  {stage === 'sale' && (
                    <button
                      type="button"
                      onClick={() => {
                        setNotice('');
                        setSelling(product);
                      }}
                      className={`inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded border px-2 py-1 text-[11px] transition-colors ${
                        sold
                          ? 'border-background-300 text-foreground-700 hover:border-foreground-400'
                          : 'border-primary-400 bg-primary-100 text-primary-800 hover:bg-primary-200'
                      }`}
                    >
                      <i className={sold ? 'ri-edit-line' : 'ri-check-double-line'}></i>
                      {sold ? '기록 수정' : '판매 완료'}
                    </button>
                  )}
                </div>
              );
            })}

          {!loading && stage === 'sale' && list.length >= LIST_LIMIT && (
            <p className="border-t border-background-200 px-4 py-2.5 text-[10.5px] text-foreground-500">
              최근 {LIST_LIMIT}건만 표시합니다. 전체 목록은 “현재 재고” 화면의 판매 완료 필터에서
              확인할 수 있습니다.
            </p>
          )}
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

      {selling && (
        <SaleCompleteModal
          product={selling}
          staffName={identity?.name ?? ''}
          onClose={() => setSelling(null)}
          onCompleted={(message) => {
            if (message) setNotice(message);
          }}
        />
      )}
    </div>
  );
}