import { useState } from 'react';
import type { Product } from '@/types/product';
import { formatThb } from '@/pages/admin/utils';
import { restoreSoldProduct } from '@/pages/admin/restoreSale';

interface Props {
  product: Product;
  onClose: () => void;
  onRestored: (message: string) => void;
}

type SaveState = 'idle' | 'saving' | 'error';

/** 되돌린 뒤의 재고상태 선택지입니다. */
const TARGET_STATUS = ['판매 가능', '태국 입고', '예약'];

/**
 * 판매 완료 상품을 다시 판매 목록으로 되돌리는 창.
 * 되돌리면 메인 시트의 재고상태·웹노출이 복구되고 ‘판매 완료’ 탭 기록도 정리됩니다.
 */
export default function RestoreSaleModal({ product, onClose, onRestored }: Props) {
  const [targetStatus, setTargetStatus] = useState(TARGET_STATUS[0]);
  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  const record = product.saleRecord;

  const submit = async () => {
    setState('saving');
    setMessage('');
    const result = await restoreSoldProduct(product, targetStatus);
    if (!result.ok) {
      setState('error');
      setMessage(result.message);
      return;
    }
    onRestored(result.message);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground-950/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-lg bg-background-50 sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-background-200 bg-background-50 px-5 py-3.5">
          <h2 className="font-heading text-[15px] text-foreground-950">
            판매 완료 되돌리기 · {product.id}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-foreground-600 transition-colors hover:bg-background-200"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        <div className="px-5 py-4">
          <div className="flex items-start gap-3">
            <div className="h-20 w-16 shrink-0 overflow-hidden rounded bg-background-200">
              <img
                src={product.image}
                alt={product.name.en}
                title={product.name.en}
                className="h-full w-full object-cover object-top"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-medium text-foreground-950">{product.name.en}</p>
              <p className="mt-0.5 text-[11.5px] text-foreground-600">
                {product.brand} · {product.spec}
              </p>
              <p className="mt-1 text-[10.5px] leading-relaxed text-foreground-500">
                {record?.saleDate
                  ? `판매일 ${record.saleDate}`
                  : '판매일 기록 없음'}
                {record && record.revenue > 0 ? ` · 판매가 ${formatThb(record.revenue)}` : ''}
                {record?.channel ? ` · ${record.channel}` : ''}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-background-200 bg-background-100/70 px-3.5 py-3">
            <p className="text-[12px] font-medium text-foreground-900">되돌리면 이렇게 됩니다</p>
            <ul className="mt-2 flex flex-col gap-1.5 text-[11px] leading-relaxed text-foreground-600">
              <li className="flex gap-1.5">
                <i className="ri-eye-line mt-0.5 text-[12px] text-secondary-700"></i>
                홈페이지 현재 판매 목록에 다시 나타납니다. (웹노출 Y)
              </li>
              <li className="flex gap-1.5">
                <i className="ri-file-list-3-line mt-0.5 text-[12px] text-secondary-700"></i>
                시트의 ‘판매 완료’ 탭 기록이 삭제되어 정산에서도 빠집니다.
              </li>
              <li className="flex gap-1.5">
                <i className="ri-lock-unlock-line mt-0.5 text-[12px] text-secondary-700"></i>
                고정됐던 판매일·판매 시점 환율이 해제됩니다.
              </li>
            </ul>
            <p className="mt-2 border-t border-background-300/60 pt-2 text-[10.5px] leading-relaxed text-foreground-500">
              판매가와 원가는 시트에 남아 있는 값을 그대로 둡니다. 금액을 다시 정리하려면 되돌린 뒤
              ‘수정·저장’에서 고쳐 주세요.
            </p>
          </div>

          <div className="mt-3">
            <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
              되돌린 뒤 재고상태
            </span>
            <div className="flex flex-wrap gap-1.5">
              {TARGET_STATUS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTargetStatus(option)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] transition-colors ${
                    targetStatus === option
                      ? 'bg-foreground-900 text-background-50'
                      : 'border border-background-300 text-foreground-700 hover:border-foreground-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
            <span className="mt-1.5 block text-[10px] leading-relaxed text-foreground-500">
              기본값은 ‘판매 가능’입니다. 아직 매장에 도착하지 않았다면 ‘태국 입고’를 고르세요.
            </span>
          </div>

          {state !== 'idle' && (
            <p
              className={`mt-3 rounded-md px-3 py-2.5 text-[11px] leading-relaxed ${
                state === 'error'
                  ? 'border border-accent-300/70 bg-accent-50 text-accent-900'
                  : 'border border-secondary-300/70 bg-secondary-50 text-secondary-900'
              }`}
            >
              <i
                className={`mr-1 ${
                  state === 'error' ? 'ri-error-warning-line' : 'ri-loader-4-line animate-spin'
                }`}
              ></i>
              {state === 'saving' ? '시트에 반영하는 중…' : message}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-background-200 bg-background-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            disabled={state === 'saving'}
            className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={state === 'saving'}
            className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === 'saving' ? '되돌리는 중…' : '판매 목록으로 되돌리기'}
          </button>
        </div>
      </div>
    </div>
  );
}