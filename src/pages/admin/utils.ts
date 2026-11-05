export function formatThb(value: number): string {
  return `฿ ${Math.round(value).toLocaleString('en-US')}`;
}

export function formatKrw(value: number): string {
  return `₩ ${Math.round(value).toLocaleString('en-US')}`;
}

/** Wholesale price for partners, derived from the listed THB price. */
export function wholesalePrice(price: number, rate: number): number {
  if (!Number.isFinite(price) || price <= 0) return 0;
  return Math.round((price * rate) / 10) * 10;
}

/** Badge styling for a sheet stock status label. */
export function statusClass(status?: string): string {
  const value = status ?? '';
  if (value.includes('예약')) return 'bg-accent-100 text-accent-900';
  if (value.includes('완료') || value.includes('판매됨')) return 'bg-foreground-200 text-foreground-700';
  if (value.includes('가능')) return 'bg-secondary-100 text-secondary-900';
  if (value.includes('대기')) return 'bg-primary-100 text-primary-800';
  return 'bg-background-200 text-foreground-700';
}

export function countStatus(items: { stockStatus?: string }[], keyword: string): number {
  return items.filter((item) => (item.stockStatus ?? '').includes(keyword)).length;
}

/** Sheet category values are capitalised words; the app uses lowercase type keys. */
export const CATEGORY_TO_SHEET: Record<string, string> = {
  driver: 'Driver',
  wood: 'Wood',
  iron: 'Iron',
  utility: 'Utility',
  wedge: 'Wedge',
  putter: 'Putter',
  bag: 'Bag',
  accessory: 'Accessories',
};

export const SHEET_CATEGORY_OPTIONS = Object.values(CATEGORY_TO_SHEET);

export const GRADE_OPTIONS = ['S', 'A+', 'A', 'B', 'C'];

export const STOCK_STATUS_OPTIONS = [
  '판매 가능',
  '예약',
  '한국 출고',
  '운송 중',
  '태국 입고',
  '판매 완료',
  '보류',
];

/** Pull the Drive thumbnail links that live inside the 비고 column. */
export function parsePhotoUrls(note: string): string[] {
  const found = note.match(/https:\/\/drive\.google\.com\/thumbnail\?[^|\s]+/g) ?? [];
  return Array.from(new Set(found.map((url) => url.trim())));
}

/**
 * Rebuild the 비고 column, keeping every non-photo segment untouched and
 * re-appending the photo links in the given order.
 */
export function mergeNotePhotos(note: string, urls: string[]): string {
  const kept = note
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .filter((segment) => !segment.startsWith('사진:'))
    .filter((segment) => !segment.startsWith('http'));

  const photos = urls
    .map((url) => url.trim())
    .filter((url) => url.length > 0)
    .map((url) => `사진:${url}`);

  return [...kept, ...photos].join(' | ');
}

/** The sheet stores condition as a 0~1 ratio (0.9 = 90%). */
export function conditionToSheet(percentInput: string): number | string {
  const value = Number(percentInput);
  if (!percentInput.trim() || !Number.isFinite(value)) return '';
  const clamped = Math.max(0, Math.min(100, value));
  return Math.round(clamped) / 100;
}

export function numericValue(input: string): number | string {
  const digits = input.replace(/[^0-9.-]/g, '');
  if (!digits) return '';
  const value = Number(digits);
  return Number.isFinite(value) ? value : '';
}

/** Stock-number prefixes: OYO = newly shipped stock, TH = stock that was already in Thailand. */
export const STOCK_PREFIX_OPTIONS = ['OYO', 'TH'] as const;
export type StockPrefix = (typeof STOCK_PREFIX_OPTIONS)[number];

interface IdShape {
  separator: string;
  value: number;
  width: number;
}

function readIdShape(id: string, prefix: string): IdShape | null {
  const escaped = prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = id.trim().match(new RegExp(`^${escaped}([\\s._-]*)(\\d+)$`, 'i'));
  if (!match) return null;
  return { separator: match[1], value: Number(match[2]), width: match[2].length };
}

/**
 * Next free stock number for the given prefix.
 * The separator and digit width follow the latest existing id in sheet order,
 * so OYO-40 continues as OYO-41 and OYO-100 continues as OYO-101.
 */
export function nextStockNumber(ids: string[], prefix: StockPrefix = 'OYO'): string {
  const matches = ids
    .map((id) => readIdShape(id, prefix))
    .filter((shape): shape is IdShape => shape !== null);

  if (matches.length === 0) {
    const other = ids
      .map((id) => readIdShape(id, prefix === 'OYO' ? 'TH' : 'OYO'))
      .filter((shape): shape is IdShape => shape !== null);
    const fallback = other[other.length - 1];
    const next = '1';
    return `${prefix}${fallback?.separator ?? '-'}${next.padStart(fallback?.width ?? 3, '0')}`;
  }

  const latest = matches[matches.length - 1];
  const max = matches.reduce((acc, shape) => Math.max(acc, shape.value), 0);
  const nextNumber = `${max + 1}`.padStart(Math.max(latest.width, `${max + 1}`.length), '0');
  return `${prefix}${latest.separator}${nextNumber}`;
}

export function todayIso(): string {
  const now = new Date();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}