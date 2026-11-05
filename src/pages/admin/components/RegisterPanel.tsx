import { useMemo, useState } from 'react';
import type { Product } from '@/types/product';
import { createSheetRow, isWriterReady } from '@/services/sheetWrite';
import {
  GRADE_OPTIONS,
  SHEET_CATEGORY_OPTIONS,
  STOCK_STATUS_OPTIONS,
  conditionToSheet,
  mergeNotePhotos,
  nextStockNumber,
  numericValue,
  todayIso,
} from '@/pages/admin/utils';

interface Props {
  items: Product[];
  onSaved: () => void;
}

type SaveState = 'idle' | 'saving' | 'done' | 'error';

export default function RegisterPanel({ items, onSaved }: Props) {
  const suggestedId = useMemo(() => nextStockNumber(items.map((item) => item.id)), [items]);

  const [id, setId] = useState(suggestedId);
  const [registered, setRegistered] = useState(todayIso());
  const [box, setBox] = useState('');
  const [category, setCategory] = useState('Driver');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [spec, setSpec] = useState('');
  const [grade, setGrade] = useState('A');
  const [condition, setCondition] = useState('90');
  const [cover, setCover] = useState('포함');
  const [cost, setCost] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('태국 매장');
  const [stockStatus, setStockStatus] = useState('판매 가능');
  const [visible, setVisible] = useState('Y');
  const [staff, setStaff] = useState('');
  const [photoText, setPhotoText] = useState('');
  const [memo, setMemo] = useState('');

  const [state, setState] = useState<SaveState>('idle');
  const [message, setMessage] = useState('');

  const resetForm = () => {
    setId('');
    setRegistered(todayIso());
    setBox('');
    setCategory('Driver');
    setBrand('');
    setName('');
    setSpec('');
    setGrade('A');
    setCondition('90');
    setCover('포함');
    setCost('');
    setPrice('');
    setLocation('태국 매장');
    setStockStatus('판매 가능');
    setVisible('Y');
    setStaff('');
    setPhotoText('');
    setMemo('');
  };

  const submit = async () => {
    if (!id.trim() || !name.trim() || !brand.trim()) {
      setState('error');
      setMessage('재고번호 · 브랜드 · 상품명은 꼭 필요합니다.');
      return;
    }

    setState('saving');
    setMessage('');

    const photos = photoText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const note = mergeNotePhotos(memo.trim(), photos);

    const values: Record<string, string | number> = {
      재고번호: id.trim(),
      등록일: registered,
      '출고차수/박스': box.trim(),
      카테고리: category,
      브랜드: brand.trim().toUpperCase(),
      상품명: name.trim(),
      사양: spec.trim(),
      판매단위: 'PCS',
      중고등급: grade,
      '상태(%)': conditionToSheet(condition),
      헤드커버: cover,
      '한국원가(KRW)': numericValue(cost),
      '판매가격(THB)': numericValue(price),
      보관위치: location.trim(),
      재고상태: stockStatus,
      웹노출: visible,
      담당자: staff.trim(),
      비고: note,
    };

    const result = await createSheetRow(values);
    setMessage(result.message);
    setState(result.ok ? 'done' : 'error');

    if (result.ok) {
      onSaved();
      resetForm();
    }
  };

  const inputClass =
    'w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-500';
  const labelClass = 'mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500';

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl text-foreground-950">상품 등록</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            등록한 상품은 먼저 <strong className="font-medium text-foreground-800">중고 상품</strong>으로
            들어갑니다. 시트에 새 행이 추가되고, 웹노출을 Y로 두면 홈페이지에 바로 노출됩니다.
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] ${
            isWriterReady()
              ? 'bg-secondary-100 text-secondary-900'
              : 'bg-accent-100 text-accent-900'
          }`}
        >
          <i className={isWriterReady() ? 'ri-link' : 'ri-link-unlink'}></i>
          {isWriterReady() ? '시트 쓰기 연결됨' : '시트 쓰기 미연결'}
        </span>
      </div>

      <p className="mt-4 rounded-lg border border-secondary-300/70 bg-secondary-50 px-4 py-3 text-[11.5px] leading-relaxed text-secondary-900">
        <i className="ri-price-tag-3-line mr-1"></i>
        골프채(드라이버·우드·아이언·유틸·웨지·퍼터)는 중고 상품으로, 가방·그립·볼·거리측정기 같은
        골프채 외 상품은 액세서리로 자동 분류됩니다. 등록 후
        <strong className="font-medium"> 현재 재고</strong> 화면에서 <strong className="font-medium">특가</strong>
        버튼을 누르면 특가 상품 페이지로 옮겨집니다.
      </p>

      {!isWriterReady() && (
        <p className="mt-4 rounded-lg border border-accent-300/70 bg-accent-50 px-4 py-3 text-[11.5px] leading-relaxed text-accent-900">
          <i className="ri-information-line mr-1"></i>
          아직 시트 쓰기 연결이 없습니다. “시트 연동” 화면에서 연결하면 이 화면의 저장이 실제
          시트에 반영됩니다.
        </p>
      )}

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_300px]">
        <div className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block min-w-0">
              <span className={labelClass}>재고번호 *</span>
              <input value={id} onChange={(event) => setId(event.target.value)} className={inputClass} />
              <span className="mt-1 block text-[10.5px] text-foreground-500">
                비워 두면 중복 확인이 안 됩니다. 예: {suggestedId}
              </span>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>등록일</span>
              <input
                type="date"
                value={registered}
                onChange={(event) => setRegistered(event.target.value)}
                className={inputClass}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>상품 종류</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                {SHEET_CATEGORY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[10.5px] leading-relaxed text-foreground-500">
                골프채 6종은 중고 상품, Bag·Accessories는 액세서리로 등록됩니다.
              </span>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>브랜드 *</span>
              <input
                value={brand}
                onChange={(event) => setBrand(event.target.value)}
                placeholder="예: TITLEIST"
                className={inputClass}
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={labelClass}>상품명 *</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="예: Titleist GT3 Driver"
                className={inputClass}
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={labelClass}>사양</span>
              <input
                value={spec}
                onChange={(event) => setSpec(event.target.value)}
                placeholder="예: 9° · Tensei 1K · Flex S"
                className={inputClass}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>중고등급</span>
              <select
                value={grade}
                onChange={(event) => setGrade(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
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
              <span className={labelClass}>판매가격 (THB)</span>
              <input
                type="text"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(event.target.value.replace(/[^0-9]/g, ''))}
                placeholder="비우면 가격 문의"
                className={`${inputClass} text-right`}
              />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>헤드커버</span>
              <select
                value={cover}
                onChange={(event) => setCover(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="포함">포함</option>
                <option value="미포함">미포함</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>보관위치</span>
              <input value={location} onChange={(event) => setLocation(event.target.value)} className={inputClass} />
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
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>웹노출</span>
              <select
                value={visible}
                onChange={(event) => setVisible(event.target.value)}
                className={`${inputClass} cursor-pointer`}
              >
                <option value="Y">Y · 홈페이지 노출</option>
                <option value="N">N · 숨김</option>
              </select>
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>담당자</span>
              <input value={staff} onChange={(event) => setStaff(event.target.value)} className={inputClass} />
            </label>
            <label className="block min-w-0">
              <span className={labelClass}>출고차수 / 박스</span>
              <input
                value={box}
                onChange={(event) => setBox(event.target.value)}
                placeholder="예: 3차 #12"
                className={inputClass}
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={labelClass}>사진 링크 (한 줄에 하나씩)</span>
              <textarea
                value={photoText}
                onChange={(event) => setPhotoText(event.target.value)}
                rows={3}
                placeholder="https://drive.google.com/thumbnail?id=..."
                className={`${inputClass} resize-y text-[11.5px] leading-relaxed`}
              />
            </label>
            <label className="block min-w-0 sm:col-span-2">
              <span className={labelClass}>비고</span>
              <input value={memo} onChange={(event) => setMemo(event.target.value)} className={inputClass} />
            </label>
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
              {state === 'saving' ? '시트에 등록하는 중…' : message}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t border-background-200 pt-3.5">
            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-4 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
            >
              입력 초기화
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={state === 'saving'}
              className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {state === 'saving' ? '등록 중…' : '시트에 등록'}
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-background-200 bg-background-50 p-4">
          <h2 className="text-[12.5px] font-medium text-foreground-900">등록 후 흐름</h2>
          <ol className="mt-3 flex flex-col gap-3">
            {[
              '시트에 새 행이 중고 상품으로 추가됩니다. (웹노출 Y)',
              '골프채 외 상품은 액세서리 페이지로 자동 분류됩니다.',
              '특가로 내보낼 상품은 현재 재고 화면에서 “특가”를 누르세요.',
              '한국 출고 → 태국 입고 → 판매 순서로 상태를 바꿉니다.',
            ].map((step, index) => (
              <li key={step} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10.5px] font-medium text-secondary-900">
                  {index + 1}
                </span>
                <span className="text-[11.5px] leading-relaxed text-foreground-700">{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-4 border-t border-background-200 pt-3 text-[10.5px] leading-relaxed text-foreground-500">
            같은 재고번호가 이미 있으면 시트가 등록을 막습니다. 번호를 바꿔 주세요.
          </p>
        </div>
      </div>
    </div>
  );
}