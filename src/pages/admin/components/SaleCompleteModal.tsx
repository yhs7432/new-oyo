import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/types/product';
import { useFxRate } from '@/hooks/useFxRate';
import { formatFxRate, quoteInBase, rateFromQuote } from '@/services/fxRate';
import { formatKrw, formatThb, todayIso } from '@/pages/admin/utils';
import { archiveSaleEntry, updateSheetRows } from '@/services/sheetWrite';
import {
  CATEGORY_LABEL,
  FEE_RATE,
  FEE_RATE_LEGACY,
  FX_RATE,
  SALE_DATE,
  VAT_RATE,
  noteAmount,
  noteFxRate,
  noteKrPrice,
  noteRate,
  readNoteValue,
  writeNoteValue,
} from '@/utils/sheetNote';

interface Props {
  product: Product;
  staffName: string;
  onClose: () => void;
  onCompleted: (message: string) => void;
}

type SaveState = 'idle' | 'saving' | 'error';

const CHANNELS = ['매장 판매', '도매 파트너', '온라인', '기타'];

/**
 * 판매 완료 처리 창.
 * 1) 원본 시트 행을 판매 완료·웹 숨김으로 바꾸고 판매일·VAT·수수료를 남깁니다.
 * 2) 같은 내용을 '판매 완료' 탭에 한 줄로 기록합니다.
 */
export default function SaleCompleteModal({ product, staffName, onClose, onCompleted }: Props) {
  const { rate, base } = useFxRate();
  const raw = product.raw ?? {};
  const note = raw['비고'] ?? '';

  const initialSaleDate = readNoteValue(note, SALE_DATE);
  const [saleDate, setSaleDate] = useState(
    /^\d{4}-\d{2}-\d{2}$/.test(initialSaleDate) ? initialSaleDate : todayIso(),
  );
  const [price, setPrice] = useState(
    product.priceOnRequest ? '' : String(Math.round(product.price)),
  );
  const [vat, setVat] = useState(
    noteRate(note, VAT_RATE) > 0 ? String(noteRate(note, VAT_RATE)) : '',
  );
  const [fee, setFee] = useState(
    noteAmount(note, FEE_RATE, FEE_RATE_LEGACY) > 0
      ? String(noteAmount(note, FEE_RATE, FEE_RATE_LEGACY))
      : '',
  );
  const [channel, setChannel] = useState(CHANNELS[0]);
  const [memo, setMemo] = useState('');
  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  /** 이미 판매 완료로 기록된 상품은 그때 고정된 환율을 그대로 이어서 씁니다. */
  const storedRate = (product.stockStatus ?? '').includes('완료') ? noteFxRate(note) : 0;

  /** 환율을 현재 기준(1฿ / 1원)으로 표기합니다. */
  const draftRate = (value: number): string => {
    const quote = quoteInBase(value, base);
    if (!quote) return '';
    const text = quote.toFixed(base === 'krw' ? 4 : 2);
    return text.includes('.') ? text.replace(/0+$/, '').replace(/\.$/, '') : text;
  };

  const [fxRate, setFxRate] = useState(() => draftRate(storedRate > 0 ? storedRate : rate));
  const [fxTouched, setFxTouched] = useState(false);
  const prevBase = useRef(base);

  // 오늘 환율을 아직 불러오는 중이었다면, 도착한 값으로 한 번 맞춰 줍니다.
  useEffect(() => {
    if (fxTouched || storedRate > 0) return;
    setFxRate(draftRate(rate));
  }, [rate, fxTouched, storedRate]);

  const fxRateValue = Number(fxRate.replace(/[^0-9.]/g, '')) || 0;
  const appliedRate = fxTouched
    ? rateFromQuote(fxRateValue, base) || rate
    : storedRate > 0
      ? storedRate
      : rate;

  // 기준을 바꾸면 입력값을 반대 방향 표기로 다시 보여 줍니다.
  useEffect(() => {
    const previous = prevBase.current;
    if (previous === base) return;
    prevBase.current = base;
    setFxRate((current) => {
      const numeric = Number(current.replace(/[^0-9.]/g, '')) || 0;
      const krwPerThb = rateFromQuote(numeric, previous);
      return draftRate(krwPerThb > 0 ? krwPerThb : rate);
    });
  }, [base, rate]);

  const saleThb = Number(price.replace(/[^0-9.-]/g, '')) || 0;
  const costKrw = Number(String(raw['한국원가(KRW)'] ?? '').replace(/[^0-9]/g, '')) || 0;
  const costThb = appliedRate > 0 ? costKrw / appliedRate : 0;
  const vatRateValue = Math.min(100, Number(vat) || 0);
  const vatAmount = (saleThb * vatRateValue) / 100;
  const feeAmount = Number(fee.replace(/[^0-9.]/g, '')) || 0;
  const netThb = saleThb - costThb - vatAmount - feeAmount;
  const marginPercent = saleThb > 0 ? Math.round((netThb / saleThb) * 100) : 0;

  /** 한국 판매 기준 금액입니다. 비고에 적힌 원화 판매가가 없으면 판매가를 환산해 씁니다. */
  const krPriceKrw =
    noteKrPrice(note) > 0 ? noteKrPrice(note) : Math.round(saleThb * appliedRate);
  const krVatKrw = (krPriceKrw * vatRateValue) / 100;
  const krFeeKrw = feeAmount * appliedRate;
  const krNetKrw = krPriceKrw - costKrw - krVatKrw - krFeeKrw;

  const submit = async () => {
    if (saleThb <= 0) {
      setState('error');
      setMessage('판매가를 입력해 주세요. 0원으로는 판매 완료 처리할 수 없습니다.');
      return;
    }

    setState('saving');
    setMessage('');

    const withVat = writeNoteValue(note, VAT_RATE, vatRateValue > 0 ? String(vatRateValue) : null);
    const withFee = writeNoteValue(withVat, FEE_RATE, feeAmount > 0 ? String(feeAmount) : null);
    const withDate = writeNoteValue(withFee, SALE_DATE, saleDate || null);
    const withoutLegacy = writeNoteValue(withDate, FEE_RATE_LEGACY, null);
    // 판매 완료 시점의 환율을 이 판매 건에 고정해서 남깁니다.
    const finalNote = writeNoteValue(
      withoutLegacy,
      FX_RATE,
      appliedRate > 0 ? String(appliedRate) : null,
    );

    const update = await updateSheetRows([
      {
        id: product.id,
        fields: {
          재고상태: '판매 완료',
          웹노출: 'N',
          '판매가격(THB)': saleThb,
          비고: finalNote,
        },
      },
    ]);

    if (!update.ok) {
      setState('error');
      setMessage(update.message);
      return;
    }

    const archive = await archiveSaleEntry({
      판매일: saleDate,
      재고번호: product.id,
      상품명: product.name.en,
      브랜드: product.brand,
      카테고리: CATEGORY_LABEL[product.category],
      중고등급: product.headGrade ?? '',
      '상태(%)': product.conditionPercent ?? '',
      '판매가(THB)': saleThb,
      '원가(KRW)': costKrw,
      'VAT(THB)': Math.round(vatAmount),
      '웹수수료(THB)': Math.round(feeAmount),
      '순수익(THB)': Math.round(netThb),
      '한국판매가(KRW)': krPriceKrw > 0 ? Math.round(krPriceKrw) : '',
      '한국순수익(KRW)': krPriceKrw > 0 ? Math.round(krNetKrw) : '',
      환율: appliedRate,
      판매채널: channel,
      담당자: staffName,
      메모: memo.trim(),
    });

    if (!archive.ok) {
      setState('error');
      setMessage(
        `${product.id} 판매 완료 처리는 저장했습니다. 다만 '판매 완료' 시트 기록은 실패했습니다 — ${archive.message} 「시트 연동」 화면에서 스크립트를 최신 버전으로 다시 배포한 뒤 상품을 한 번 더 열어 저장해 주세요.`,
      );
      onCompleted('');
      return;
    }

    onCompleted(
      `${product.id} · ${product.name.en} 판매 완료로 정리했습니다. ${archive.message}`,
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground-950/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-lg bg-background-50 sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-background-200 bg-background-50 px-5 py-3.5">
          <h2 className="font-heading text-[15px] text-foreground-950">판매 완료 처리 · {product.id}</h2>
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
              <p className="mt-1 text-[10.5px] text-foreground-500">
                저장하면 홈페이지에서 숨겨지고, 같은 내용이 시트의 ‘판매 완료’ 탭에 한 줄로
                남습니다. 이때 정산 환율도 함께 고정되어 이후 환율이 올라도 이 건은 영향을 받지
                않습니다.
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                판매일
              </span>
              <input
                type="date"
                value={saleDate}
                onChange={(event) => setSaleDate(event.target.value)}
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                실제 판매가 (THB)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예: 8900"
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-right text-sm text-foreground-900 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                정산 환율 ({base === 'krw' ? '฿ / 1원' : '원 / 1฿'})
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={fxRate}
                onChange={(event) => {
                  setFxTouched(true);
                  setFxRate(event.target.value.replace(/[^0-9.]/g, ''));
                }}
                placeholder={base === 'krw' ? '예: 0.0252' : '예: 40.2'}
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-right text-sm text-foreground-900 outline-none focus:border-primary-500"
              />
              <span className="mt-1 block text-[10px] leading-relaxed text-foreground-500">
                {storedRate > 0
                  ? `판매 당시 저장된 ${formatFxRate(storedRate, base)}을 그대로 씁니다.`
                  : (product.stockStatus ?? '').includes('완료')
                    ? '판매 당시 환율 기록이 없어 오늘 환율로 채웁니다. 저장하면 이 값으로 고정됩니다.'
                    : '저장하면 이 환율로 고정됩니다.'}
              </span>
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                VAT (%)
              </span>
              <input
                type="text"
                inputMode="decimal"
                value={vat}
                onChange={(event) => setVat(event.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="예: 7"
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-right text-sm text-foreground-900 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                웹 수수료 (THB)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={fee}
                onChange={(event) => setFee(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예: 250"
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-right text-sm text-foreground-900 outline-none focus:border-primary-500"
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
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
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                메모 (선택)
              </span>
              <input
                value={memo}
                onChange={(event) => setMemo(event.target.value)}
                maxLength={80}
                placeholder="예: 헤드커버 미포함, 매장 방문 판매"
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none placeholder:text-foreground-500 focus:border-primary-500"
              />
            </label>
          </div>

          <div className="mt-4 rounded-md border border-background-200 bg-background-100/70 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-foreground-900">
                <i className="ri-calculator-line text-[13px] text-foreground-500"></i>
                정산 미리보기
              </p>
              <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] text-secondary-900">
                담당자 {staffName}
              </span>
            </div>
            <dl className="mt-2.5 flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">판매가</dt>
                <dd className="text-foreground-900">
                  {formatThb(saleThb)}
                  <span className="ml-1 text-[10.5px] text-foreground-500">
                    / {formatKrw(saleThb * appliedRate)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">원가</dt>
                <dd className="text-foreground-900">
                  − {formatThb(costThb)}
                  <span className="ml-1 text-[10.5px] text-foreground-500">
                    (${formatFxRate(appliedRate, base)} 고정)
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">VAT ({vatRateValue}%)</dt>
                <dd className="text-foreground-900">
                  {vatAmount > 0 ? `− ${formatThb(vatAmount)}` : '없음'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">웹 수수료</dt>
                <dd className="text-foreground-900">
                  {feeAmount > 0 ? `− ${formatThb(feeAmount)}` : '없음'}
                </dd>
              </div>
            </dl>
            <div className="mt-2.5 flex flex-wrap items-end justify-between gap-2 border-t border-background-300/60 pt-2.5">
              <span className="text-[12px] font-medium text-foreground-900">예상 순수익</span>
              <span className="text-right">
                <strong
                  className={`font-heading text-[16px] font-normal ${
                    netThb >= 0 ? 'text-secondary-900' : 'text-accent-800'
                  }`}
                >
                  {formatThb(netThb)}
                </strong>
                <span className="ml-1.5 text-[10.5px] text-foreground-500">마진 {marginPercent}%</span>
              </span>
            </div>
            {krPriceKrw > 0 && (
              <div className="mt-1.5 flex flex-wrap items-center justify-between gap-2 rounded-md bg-background-100/80 px-2.5 py-1.5">
                <span className="flex flex-wrap items-center gap-1.5 whitespace-nowrap text-[11.5px] text-foreground-700">
                  <span className="rounded-full bg-accent-100 px-1.5 py-0.5 text-[10px] text-accent-900">
                    한국 판매
                  </span>
                  판매가 {formatKrw(krPriceKrw)}
                </span>
                <span
                  className={`text-[11.5px] ${krNetKrw >= 0 ? 'text-secondary-900' : 'text-accent-800'}`}
                >
                  순수익 {formatKrw(krNetKrw)}
                </span>
              </div>
            )}
          </div>

          {state !== 'idle' && (
            <p
              className={`mt-3 rounded-md px-3 py-2.5 text-[11px] leading-relaxed ${
                state === 'error'
                  ? 'border border-accent-300/70 bg-accent-50 text-accent-900'
                  : 'border border-secondary-300/70 bg-secondary-50 text-secondary-900'
              }`}
            >
              <i className={`mr-1 ${state === 'error' ? 'ri-error-warning-line' : 'ri-loader-4-line animate-spin'}`}></i>
              {state === 'saving' ? '시트에 기록하는 중…' : message}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-background-200 bg-background-50 px-5 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
          >
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={state === 'saving'}
            className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {state === 'saving' ? '기록 중…' : '판매 완료로 저장'}
          </button>
        </div>
      </div>
    </div>
  );
}