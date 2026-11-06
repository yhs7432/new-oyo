import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { useFxRate } from '@/hooks/useFxRate';
import { formatFxRate } from '@/services/fxRate';
import { archiveSaleEntry, deleteSheetRows, removeSaleArchiveEntries, updateSheetRows } from '@/services/sheetWrite';
import {
  GRADE_OPTIONS,
  STOCK_STATUS_OPTIONS,
  conditionToSheet,
  formatKrw,
  formatThb,
  mergeNotePhotos,
  numericValue,
  parsePhotoUrls,
  statusClass,
} from '@/pages/admin/utils';
import {
  CATEGORY_LABEL,
  FEE_RATE,
  FEE_RATE_LEGACY,
  FX_RATE,
  SALE_DATE,
  SPECIAL_FLAG,
  SPECIAL_PRICE,
  VAT_RATE,
  isClubType,
  isSpecial,
  noteFxRate,
  readNoteValue,
  writeNoteValue,
} from '@/utils/sheetNote';

/** 판매 완료 시트의 ‘판매채널’ 칸에 들어갈 선택지입니다. */
const SALE_CHANNELS = ['매장 판매', '도매 파트너', '온라인', '기타'];

interface Props {
  product: Product;
  rate: number;
  onClose: () => void;
  onSaved: () => void;
}

type SaveState = 'idle' | 'saving' | 'done' | 'error';

/** `2026.11.5` / `2026/11/05` / `2026-11-05` → `2026-11-05` for a date input. */
function toDateInput(value: string): string {
  const match = value.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) return '';
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`;
}

function todayInput(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export default function ItemEditModal({ product, rate, onClose, onSaved }: Props) {
  const { base } = useFxRate();
  const raw = useMemo(() => product.raw ?? {}, [product.raw]);
  const originalNote = raw['비고'] ?? '';
  const initialVat = readNoteValue(originalNote, VAT_RATE).replace(/[^0-9.]/g, '');
  const initialFee = (readNoteValue(originalNote, FEE_RATE) || readNoteValue(originalNote, FEE_RATE_LEGACY))
    .replace(/[^0-9]/g, '');
  const initialSaleDate = toDateInput(readNoteValue(originalNote, SALE_DATE));

  const [brand, setBrand] = useState(raw['브랜드'] ?? product.brand);
  const [name, setName] = useState(raw['상품명'] ?? product.name.en);
  const [spec, setSpec] = useState(raw['사양'] ?? product.spec);
  const [price, setPrice] = useState(raw['판매가격(THB)'] ?? String(product.price || ''));
  const [cost, setCost] = useState(raw['한국원가(KRW)'] ?? '');
  const [vat, setVat] = useState(initialVat);
  const [fee, setFee] = useState(initialFee);
  const [saleDate, setSaleDate] = useState(initialSaleDate);
  const [grade, setGrade] = useState(raw['중고등급'] ?? product.headGrade ?? '');
  const [condition, setCondition] = useState(
    product.conditionPercent ? String(product.conditionPercent) : '',
  );
  const [stockStatus, setStockStatus] = useState(
    raw['재고상태'] ?? product.stockStatus ?? '판매 가능',
  );
  const [visible, setVisible] = useState(raw['웹노출'] ?? 'Y');
  const [location, setLocation] = useState(raw['보관위치'] ?? '');
  const [staff, setStaff] = useState(raw['담당자'] ?? '');
  const [cover, setCover] = useState(raw['헤드커버'] ?? (product.headCoverIncluded ? '포함' : '미포함'));
  const [photoText, setPhotoText] = useState(parsePhotoUrls(originalNote).join('\n'));

  const initialSpecial = isSpecial(originalNote);
  const initialSpecialPrice = readNoteValue(originalNote, SPECIAL_PRICE).replace(/[^0-9]/g, '');
  const [special, setSpecial] = useState(initialSpecial);
  const [specialPrice, setSpecialPrice] = useState(initialSpecialPrice);
  const isClub = isClubType(product.type);

  const [state, setState] = useState<SaveState>('idle');
  const [channel, setChannel] = useState(SALE_CHANNELS[0]);
  const [message, setMessage] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const photoUrls = photoText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const parsedPrice = Number(String(price).replace(/[^0-9.-]/g, '')) || 0;
  const parsedSpecialPrice = Number(String(specialPrice).replace(/[^0-9]/g, '')) || 0;
  const nextCategory = isClub ? (special ? 'events' : 'used') : 'accessories';
  const specialDiscount =
    special && parsedSpecialPrice > 0 && parsedPrice > parsedSpecialPrice
      ? Math.round(((parsedPrice - parsedSpecialPrice) / parsedPrice) * 100)
      : 0;

  const vatRateValue = Math.min(100, Number(vat) || 0);
  const feeBahtValue = Number(String(fee).replace(/[^0-9.]/g, '')) || 0;
  const costKrw = Number(String(cost).replace(/[^0-9]/g, '')) || 0;
  // 판매 완료 시점에 고정된 환율이 있으면 그 값으로 계산합니다.
  const savedFxRate = (raw['재고상태'] ?? product.stockStatus ?? '').includes('완료')
    ? noteFxRate(originalNote)
    : 0;
  const settlementRate = savedFxRate > 0 ? savedFxRate : rate;
  const costThb = settlementRate > 0 ? costKrw / settlementRate : 0;
  const vatAmount = (parsedPrice * vatRateValue) / 100;
  const feeAmount = feeBahtValue;
  const feeSharePercent =
    parsedPrice > 0 ? Math.round((feeBahtValue / parsedPrice) * 1000) / 10 : 0;
  const netThb = parsedPrice - costThb - vatAmount - feeAmount;
  const marginPercent = parsedPrice > 0 ? Math.round((netThb / parsedPrice) * 100) : 0;
  const isSold = (stockStatus ?? '').includes('완료');

  /** 재고상태가 '판매 완료' 계열이면 웹노출은 항상 N으로 맞춥니다. */
  const isSoldStatus = (status: string) => status.includes('완료');
  const originalStockStatus = raw['재고상태'] ?? product.stockStatus ?? '판매 가능';
  /** 판매 완료로 기록된 상품을 다시 판매 가능으로 되돌리는 중인지. */
  const isReverting = isSoldStatus(originalStockStatus) && !isSoldStatus(stockStatus);
  const initialVisible = raw['웹노출'] ?? 'Y';
  const originalVisible = isSoldStatus(raw['재고상태'] ?? product.stockStatus ?? '판매 가능')
    ? 'N'
    : initialVisible;
  const effectiveVisible = isSoldStatus(stockStatus) ? 'N' : visible;

  const dirty =
    brand !== (raw['브랜드'] ?? product.brand) ||
    name !== (raw['상품명'] ?? product.name.en) ||
    spec !== (raw['사양'] ?? product.spec) ||
    price !== (raw['판매가격(THB)'] ?? String(product.price || '')) ||
    cost !== (raw['한국원가(KRW)'] ?? '') ||
    vat !== initialVat ||
    fee !== initialFee ||
    saleDate !== initialSaleDate ||
    grade !== (raw['중고등급'] ?? product.headGrade ?? '') ||
    condition !== (product.conditionPercent ? String(product.conditionPercent) : '') ||
    stockStatus !== (raw['재고상태'] ?? product.stockStatus ?? '판매 가능') ||
    effectiveVisible !== originalVisible ||
    location !== (raw['보관위치'] ?? '') ||
    staff !== (raw['담당자'] ?? '') ||
    cover !== (raw['헤드커버'] ?? (product.headCoverIncluded ? '포함' : '미포함')) ||
    special !== initialSpecial ||
    specialPrice !== initialSpecialPrice ||
    mergeNotePhotos(originalNote, photoUrls) !== mergeNotePhotos(originalNote, parsePhotoUrls(originalNote));

  const save = async () => {
    setState('saving');
    setMessage('');

    const nextNote = mergeNotePhotos(originalNote, photoUrls);
    const noteWithSpecial = writeNoteValue(nextNote, SPECIAL_FLAG, special && isClub ? 'Y' : null);
    const noteWithPrice = writeNoteValue(
      noteWithSpecial,
      SPECIAL_PRICE,
      special && isClub && parsedSpecialPrice > 0 ? String(parsedSpecialPrice) : null,
    );
    const noteWithVat = writeNoteValue(
      noteWithPrice,
      VAT_RATE,
      vatRateValue > 0 ? String(vatRateValue) : null,
    );
    const noteWithoutLegacyFee = writeNoteValue(noteWithVat, FEE_RATE_LEGACY, null);
    const noteWithDate = writeNoteValue(
      noteWithoutLegacyFee,
      SALE_DATE,
      saleDate ? saleDate : null,
    );
    const noteWithFee = writeNoteValue(
      noteWithDate,
      FEE_RATE,
      feeBahtValue > 0 ? String(feeBahtValue) : null,
    );
    // 판매 완료로 저장할 때 환율을 함께 고정합니다(이미 고정된 건은 그 값을 유지).
    const rateToFreeze = savedFxRate > 0 ? savedFxRate : rate;
    const finalNote = writeNoteValue(
      noteWithFee,
      FX_RATE,
      isSoldStatus(stockStatus) && rateToFreeze > 0 ? String(rateToFreeze) : null,
    );
    const fields: Record<string, string | number> = {
      브랜드: brand.trim(),
      상품명: name.trim(),
      사양: spec.trim(),
      '판매가격(THB)': numericValue(price),
      '한국원가(KRW)': numericValue(cost),
      중고등급: grade,
      '상태(%)': conditionToSheet(condition),
      헤드커버: cover,
      재고상태: stockStatus,
      웹노출: effectiveVisible,
      보관위치: location.trim(),
      담당자: staff.trim(),
    };
    if (finalNote !== originalNote) fields['비고'] = finalNote;

    const result = await updateSheetRows([{ id: product.id, fields }]);
    if (!result.ok) {
      setMessage(result.message);
      setState('error');
      return;
    }

    // 판매 가능 → 판매 완료로 바뀐 순간, '판매 완료' 시트에도 한 줄 기록합니다.
    const wasSold = isSoldStatus(originalStockStatus);
    if (isSoldStatus(stockStatus) && !wasSold) {
      const archive = await archiveSaleEntry({
        판매일: saleDate || todayInput(),
        재고번호: product.id,
        상품명: name.trim(),
        브랜드: brand.trim(),
        카테고리: CATEGORY_LABEL[nextCategory],
        중고등급: grade,
        '상태(%)': condition,
        '판매가(THB)': parsedPrice,
        '원가(KRW)': costKrw,
        'VAT(THB)': Math.round(vatAmount),
        '웹수수료(THB)': Math.round(feeAmount),
        '순수익(THB)': Math.round(netThb),
        환율: rateToFreeze,
        판매채널: channel,
        담당자: staff.trim(),
        메모: '',
      });

      if (!archive.ok) {
        setMessage(
          `${result.message} 다만 '판매 완료' 시트 기록은 실패했습니다 — ${archive.message} 「시트 연동」 화면에서 스크립트를 최신 버전으로 다시 배포한 뒤 다시 저장해 주세요.`,
        );
        setState('error');
        onSaved();
        return;
      }

      setMessage(`${result.message} ${archive.message}`);
      setState('done');
      onSaved();
      return;
    }

    // 판매 완료 → 판매 가능으로 되돌리면 '판매 완료' 탭의 기록도 함께 지웁니다.
    if (!isSoldStatus(stockStatus) && wasSold) {
      const cleanup = await removeSaleArchiveEntries([{ id: product.id, name: name.trim() }]);
      if (!cleanup.ok) {
        setMessage(
          `${result.message} 다만 '판매 완료' 시트 기록은 지우지 못했습니다 — ${cleanup.message} 「시트 연동」 화면에서 스크립트를 최신 버전으로 다시 배포한 뒤 다시 저장해 주세요.`,
        );
        setState('error');
        onSaved();
        return;
      }
      setMessage(`${result.message} 판매 완료를 되돌렸습니다. ${cleanup.message}`);
      setState('done');
      onSaved();
      return;
    }

    setMessage(result.message);
    setState('done');
    onSaved();
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError('');

    const result = await deleteSheetRows([{ id: product.id, name: product.name.en }]);
    setDeleting(false);

    if (!result.ok) {
      const raw = result.message || '삭제하지 못했습니다.';
      setDeleteError(
        raw.includes('지원하지 않는')
          ? `${raw} 시트에 배포된 스크립트가 예전 버전입니다. 「시트 연동」 화면에서 스크립트 코드를 다시 복사해 붙여 넣고 새로 배포해 주세요.`
          : raw,
      );
      return;
    }
    onSaved();
    onClose();
  };

  const inputClass =
    'w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-500';
  const labelClass = 'mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500';

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground-950/50 p-0 sm:items-center sm:p-6">
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-lg bg-background-50 sm:rounded-lg">
        <div className="sticky top-0 flex items-center justify-between border-b border-background-200 bg-background-50 px-5 py-3.5">
          <h2 className="font-heading text-[15px] text-foreground-950">상품 수정 · {product.id}</h2>
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
              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <span className={`rounded-full px-2 py-0.5 text-[10.5px] ${statusClass(stockStatus)}`}>
                  {stockStatus || '상태 없음'}
                </span>
                {grade && (
                  <span className="rounded-full bg-secondary-100 px-2 py-0.5 text-[10.5px] text-secondary-900">
                    등급 {grade}
                  </span>
                )}
                {condition && (
                  <span className="rounded-full bg-background-200 px-2 py-0.5 text-[10.5px] text-foreground-700">
                    상태 {condition}%
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={labelClass}>브랜드</span>
              <input value={brand} onChange={(event) => setBrand(event.target.value)} className={inputClass} />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>상품명</span>
              <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={labelClass}>사양</span>
              <input value={spec} onChange={(event) => setSpec(event.target.value)} className={inputClass} />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>판매가격 (THB)</span>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>한국원가 (KRW)</span>
              <input
                type="text"
                inputMode="numeric"
                value={cost}
                onChange={(event) => setCost(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="0"
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>VAT (%)</span>
              <input
                type="text"
                inputMode="decimal"
                value={vat}
                onChange={(event) => setVat(event.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="예: 7"
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>웹 수수료 (THB)</span>
              <input
                type="text"
                inputMode="numeric"
                value={fee}
                onChange={(event) => setFee(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예: 250"
                className={`${inputClass} text-right`}
              />
            </label>
            <div className="flex flex-col justify-end rounded-md bg-background-100/70 px-3 py-2 text-[10.5px] leading-relaxed text-foreground-600 sm:col-span-2">
              <span>
                <i className="ri-information-line mr-1"></i>
                VAT는 판매가의 %로, 웹 수수료는 실제로 내는 태국 바트(฿) 금액으로 넣어 주세요. 비워
                두면 0으로 계산합니다.
              </span>
            </div>
            <label className="block min-w-0">
              <span className={labelClass}>중고등급</span>
              <select value={grade} onChange={(event) => setGrade(event.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="">등급 없음</option>
                {GRADE_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>상태 (%)</span>
              <input
                type="text"
                inputMode="numeric"
                value={condition}
                onChange={(event) => setCondition(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="예: 90"
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>재고상태</span>
              <select
                value={stockStatus}
                onChange={(event) => {
                  const next = event.target.value;
                  const wasSold = stockStatus.includes('완료');
                  setStockStatus(next);
                  if (next.includes('완료')) {
                    if (!saleDate) setSaleDate(todayInput());
                    setVisible('N');
                  } else if (wasSold) {
                    /* 판매 완료에서 되돌리면 웹노출도 자동으로 Y로 복구합니다. */
                    setVisible('Y');
                  }
                }}
                className={`${inputClass} cursor-pointer`}
              >
                {STOCK_STATUS_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
                {!STOCK_STATUS_OPTIONS.includes(stockStatus) && stockStatus && (
                  <option value={stockStatus}>{stockStatus}</option>
                )}
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>판매일</span>
              <input
                type="date"
                value={saleDate}
                onChange={(event) => setSaleDate(event.target.value)}
                className={`${inputClass} text-right`}
              />
              <span className="mt-1 block text-[10px] leading-relaxed text-foreground-500">
                판매 완료로 바꾸면 오늘 날짜가 자동 입력됩니다.
              </span>
            </label>
            {isSoldStatus(stockStatus) && (
              <label className="block min-w-0">
                <span className={labelClass}>판매 채널</span>
                <select
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                  className={`${inputClass} cursor-pointer`}
                >
                  {SALE_CHANNELS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="mt-1 block text-[10px] leading-relaxed text-foreground-500">
                  판매 완료 시트에 이 채널로 기록됩니다.
                </span>
              </label>
            )}
            <label className="block min-w-0">
              <span className={labelClass}>웹노출</span>
              <select
                value={effectiveVisible}
                onChange={(event) => setVisible(event.target.value)}
                disabled={isSoldStatus(stockStatus)}
                className={`${inputClass} cursor-pointer disabled:cursor-not-allowed disabled:bg-background-200 disabled:text-foreground-600`}
              >
                <option value="Y">Y · 홈페이지 노출</option>
                <option value="N">N · 숨김</option>
              </select>
              <span className="mt-1 block text-[10px] leading-relaxed text-foreground-500">
                {isSoldStatus(stockStatus)
                  ? '판매 완료 상품은 자동으로 숨김(N) 처리됩니다.'
                  : '판매 완료로 바꾸면 자동으로 숨김(N), 판매 가능으로 되돌리면 자동으로 노출(Y)됩니다.'}
              </span>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>보관위치</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass} />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>헤드커버</span>
              <select value={cover} onChange={(event) => setCover(event.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="포함">포함</option>
                <option value="미포함">미포함</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>담당자</span>
              <input value={staff} onChange={(event) => setStaff(event.target.value)} className={inputClass} />
            </label>
          </div>

          <label className="mt-3 block min-w-0">
            <span className={labelClass}>사진 링크 (한 줄에 하나씩)</span>
            <textarea
              value={photoText}
              onChange={(event) => setPhotoText(event.target.value)}
              rows={3}
              placeholder="https://drive.google.com/thumbnail?id=..."
              className={`${inputClass} resize-y font-sans text-[11.5px] leading-relaxed`}
            />
          </label>

          {photoUrls.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {photoUrls.slice(0, 8).map((url, index) => (
                <div key={url} className="h-14 w-11 overflow-hidden rounded bg-background-200">
                  <img
                    src={url}
                    alt={`사진 ${index + 1}`}
                    title={`사진 ${index + 1}`}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 rounded-md border border-background-200 bg-background-100/70 p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2.5">
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-foreground-900">홈페이지 노출 분류</p>
                <p className="mt-1 text-[11px] leading-relaxed text-foreground-600">
                  {isClub
                    ? special
                      ? '특가 상품 페이지로 이동합니다.'
                      : '골프채는 기본적으로 중고 상품 페이지에 노출됩니다.'
                    : '골프채 외 상품은 액세서리 페이지로 자동 분류됩니다.'}
                </p>
              </div>
              {isClub ? (
                <button
                  type="button"
                  onClick={() => setSpecial((prev) => !prev)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-1.5 text-[11.5px] transition-colors ${
                    special
                      ? 'border-accent-500 bg-accent-500 text-background-50 hover:bg-accent-600'
                      : 'border-background-300 bg-background-50 text-foreground-800 hover:border-primary-400'
                  }`}
                >
                  <i className={special ? 'ri-price-tag-3-fill' : 'ri-price-tag-3-line'}></i>
                  {special ? '특가 해제' : '특가 상품으로 설정'}
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary-100 px-2.5 py-1 text-[10.5px] text-secondary-900">
                  <i className="ri-price-tag-2-line"></i>
                  액세서리 자동 분류
                </span>
              )}
            </div>

            {isClub && special && (
              <div className="mt-3 grid grid-cols-1 gap-3 border-t border-background-200 pt-3 sm:grid-cols-2">
                <label className="block min-w-0">
                  <span className={labelClass}>특가 판매가 (THB)</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={specialPrice}
                    onChange={(event) => setSpecialPrice(event.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="예: 7900"
                    className={`${inputClass} text-right`}
                  />
                </label>
                <div className="flex flex-col justify-end gap-1 text-[11px] leading-relaxed">
                  <span className="text-foreground-600">
                    정상가 {formatThb(parsedPrice)} → 특가 {formatThb(parsedSpecialPrice)}
                  </span>
                  <span className="text-accent-800">
                    {specialDiscount > 0 ? `${specialDiscount}% 할인으로 표시됩니다.` : '특가가를 비우면 정상 판매가로 노출됩니다.'}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 rounded-md border border-background-200 bg-background-100/60 px-3.5 py-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-[12px] font-medium text-foreground-900">
                <i className="ri-calculator-line text-[13px] text-foreground-500"></i>
                정산 계산
              </p>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] ${
                  isSold
                    ? 'bg-accent-100 text-accent-900'
                    : 'bg-secondary-100 text-secondary-900'
                }`}
              >
                {isSold
                  ? savedFxRate > 0
                    ? `판매 시점 환율 고정 · ${formatFxRate(savedFxRate, base)}`
                    : '판매 완료 기준'
                  : '판매 시 자동 계산'}
              </span>
            </div>

            <dl className="mt-2.5 flex flex-col gap-1.5 text-[12px]">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">판매가</dt>
                <dd className="text-foreground-900">
                  {formatThb(parsedPrice)}
                  <span className="ml-1 text-[10.5px] text-foreground-500">
                    / {formatKrw(parsedPrice * settlementRate)}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">원가</dt>
                <dd className="text-foreground-900">
                  − {formatThb(costThb)}
                  <span className="ml-1 text-[10.5px] text-foreground-500">
                    / {formatKrw(costKrw)}
                    {savedFxRate > 0 ? ` · ${formatFxRate(savedFxRate, base)} 고정` : ''}
                  </span>
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">VAT ({vatRateValue}%)</dt>
                <dd className={vatRateValue > 0 ? 'text-foreground-900' : 'text-foreground-400'}>
                  {vatRateValue > 0 ? `− ${formatThb(vatAmount)}` : '없음'}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-foreground-600">
                  웹 수수료
                  {feeBahtValue > 0 && (
                    <span className="ml-1 text-[10.5px] text-foreground-500">
                      (판매가의 {feeSharePercent}%)
                    </span>
                  )}
                </dt>
                <dd className={feeBahtValue > 0 ? 'text-foreground-900' : 'text-foreground-400'}>
                  {feeBahtValue > 0 ? `− ${formatThb(feeBahtValue)}` : '없음'}
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
                <span className="ml-1.5 text-[10.5px] text-foreground-500">
                  {formatKrw(netThb * settlementRate)} · 마진 {marginPercent}%
                </span>
              </span>
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-background-300/60 pt-2 text-[12px]">
              <span className="text-foreground-600">노출 분류</span>
              <span className="text-foreground-900">
                {nextCategory === 'events' ? '특가 상품' : nextCategory === 'used' ? '중고 상품' : '액세서리'}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px]">
              <span className="text-foreground-600">판매일</span>
              <span className={saleDate ? 'text-foreground-900' : 'text-foreground-400'}>
                {saleDate || '미기록'}
              </span>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2 text-[12px]">
              <span className="text-foreground-600">웹노출</span>
              <span className="text-foreground-900">
                {effectiveVisible === 'Y' ? '홈페이지에 표시됩니다' : '홈페이지에서 숨겨집니다'}
              </span>
            </div>
            <p className="mt-2 text-[10.5px] leading-relaxed text-foreground-500">
              순수익 = 판매가 − 원가(THB 환산) − VAT(판매가의 %) − 웹 수수료(바트 직접 입력). 금액을
              바꾸면 바로 다시 계산됩니다. 판매 완료로 저장하면 그 시점 환율이 함께 고정되어, 이후
              환율이 올라도 이 상품의 원가는 바뀌지 않습니다. 동시에 시트의 ‘판매 완료’ 탭에도 이
              내용이 한 줄로 기록됩니다.
            </p>
            {isSoldStatus(stockStatus) && (
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-foreground-500">
                <i className="ri-information-line mr-1"></i>
                판매 완료로 저장하면 판매 시점 환율이 고정되고, 시트 ‘판매 완료’ 탭에 한 줄로 기록됩니다.
              </p>
            )}
            {isReverting && (
              <p className="mt-1.5 rounded-md border border-accent-300/70 bg-accent-50 px-2.5 py-2 text-[10.5px] leading-relaxed text-accent-900">
                <i className="ri-arrow-go-back-line mr-1"></i>
                저장하면 이 상품은 판매 가능으로 되돌아가고, 시트 ‘판매 완료’ 탭에 남아 있던 이 상품 기록도 함께 삭제됩니다. 고정됐던 정산 환율도 해제됩니다.
              </p>
            )}
            {isSoldStatus(raw['재고상태'] ?? product.stockStatus ?? '') && (
              <p className="mt-1.5 text-[10.5px] leading-relaxed text-foreground-500">
                <i className="ri-information-line mr-1"></i>
                이미 판매 완료로 기록된 상품입니다. ‘판매 완료’ 탭의 기존 기록은 판매 당시 내용으로
                유지됩니다.
              </p>
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
              <i className={`mr-1 ${state === 'error' ? 'ri-error-warning-line' : 'ri-checkbox-circle-line'}`}></i>
              {state === 'saving' ? '시트로 전송하는 중…' : message}
            </p>
          )}
        </div>

        <div className="sticky bottom-0 border-t border-background-200 bg-background-50 px-5 py-3.5">
          {confirmDelete ? (
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 text-[11.5px] leading-relaxed text-foreground-700">
                <p className="font-medium text-foreground-900">
                  <i className="ri-error-warning-line mr-1 text-accent-600"></i>
                  {product.id} 시트 행을 완전히 삭제할까요?
                </p>
                <p className="mt-0.5 text-foreground-600">삭제하면 되돌릴 수 없습니다.</p>
                {deleteError && (
                  <p className="mt-1 text-accent-800">
                    <i className="ri-error-warning-line mr-1"></i>
                    {deleteError}
                  </p>
                )}
              </div>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmDelete(false);
                    setDeleteError('');
                  }}
                  disabled={deleting}
                  className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={remove}
                  disabled={deleting}
                  className="cursor-pointer whitespace-nowrap rounded-md bg-accent-600 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {deleting ? '삭제하는 중…' : '완전히 삭제'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirmDelete(true);
                  setDeleteError('');
                }}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-accent-300 bg-background-50 px-3.5 py-2 text-[12px] text-accent-800 transition-colors hover:bg-accent-50"
              >
                <i className="ri-delete-bin-line"></i>
                상품 삭제
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
                >
                  닫기
                </button>
                <button
                  type="button"
                  onClick={save}
                  disabled={state === 'saving' || !dirty}
                  className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {state === 'saving' ? '저장 중…' : '시트에 저장'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}