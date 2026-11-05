import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { updateSheetRows } from '@/services/sheetWrite';
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

interface Props {
  product: Product;
  rate: number;
  onClose: () => void;
  onSaved: () => void;
}

type SaveState = 'idle' | 'saving' | 'done' | 'error';

export default function ItemEditModal({ product, rate, onClose, onSaved }: Props) {
  const raw = useMemo(() => product.raw ?? {}, [product.raw]);
  const originalNote = raw['비고'] ?? '';

  const [brand, setBrand] = useState(raw['브랜드'] ?? product.brand);
  const [name, setName] = useState(raw['상품명'] ?? product.name.en);
  const [spec, setSpec] = useState(raw['사양'] ?? product.spec);
  const [price, setPrice] = useState(raw['판매가격(THB)'] ?? String(product.price || ''));
  const [cost, setCost] = useState(raw['한국원가(KRW)'] ?? '');
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

  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  const photoUrls = photoText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const parsedPrice = Number(String(price).replace(/[^0-9.-]/g, '')) || 0;
  const dirty =
    brand !== (raw['브랜드'] ?? product.brand) ||
    name !== (raw['상품명'] ?? product.name.en) ||
    spec !== (raw['사양'] ?? product.spec) ||
    price !== (raw['판매가격(THB)'] ?? String(product.price || '')) ||
    cost !== (raw['한국원가(KRW)'] ?? '') ||
    grade !== (raw['중고등급'] ?? product.headGrade ?? '') ||
    condition !== (product.conditionPercent ? String(product.conditionPercent) : '') ||
    stockStatus !== (raw['재고상태'] ?? product.stockStatus ?? '판매 가능') ||
    visible !== (raw['웹노출'] ?? 'Y') ||
    location !== (raw['보관위치'] ?? '') ||
    staff !== (raw['담당자'] ?? '') ||
    cover !== (raw['헤드커버'] ?? (product.headCoverIncluded ? '포함' : '미포함')) ||
    mergeNotePhotos(originalNote, photoUrls) !== mergeNotePhotos(originalNote, parsePhotoUrls(originalNote));

  const save = async () => {
    setState('saving');
    setMessage('');

    const nextNote = mergeNotePhotos(originalNote, photoUrls);
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
      웹노출: visible,
      보관위치: location.trim(),
      담당자: staff.trim(),
    };
    if (nextNote !== originalNote) fields['비고'] = nextNote;

    const result = await updateSheetRows([{ id: product.id, fields }]);
    setMessage(result.message);
    setState(result.ok ? 'done' : 'error');
    if (result.ok) onSaved();
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
                onChange={(event) => setStockStatus(event.target.value)}
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
              <span className={labelClass}>웹노출</span>
              <select value={visible} onChange={(event) => setVisible(event.target.value)} className={`${inputClass} cursor-pointer`}>
                <option value="Y">Y · 홈페이지 노출</option>
                <option value="N">N · 숨김</option>
              </select>
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

          <dl className="mt-4 rounded-md border border-background-200 bg-background-100/60 px-3.5 py-3 text-[12px]">
            <div className="flex items-center justify-between gap-2">
              <dt className="text-foreground-600">시트에 저장될 판매가</dt>
              <dd className="text-foreground-900">
                {formatThb(parsedPrice)}{' '}
                <span className="text-foreground-500">/ {formatKrw(parsedPrice * rate)}</span>
              </dd>
            </div>
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <dt className="text-foreground-600">웹노출</dt>
              <dd className="text-foreground-900">
                {visible === 'Y' ? '홈페이지에 표시됩니다' : '홈페이지에서 숨겨집니다'}
              </dd>
            </div>
          </dl>

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

        <div className="sticky bottom-0 flex items-center justify-end gap-2 border-t border-background-200 bg-background-50 px-5 py-3.5">
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
    </div>
  );
}