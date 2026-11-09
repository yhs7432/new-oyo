import type { CategoryKey, ProductType } from '@/types/product';

/**
 * The sheet has no dedicated columns for "special offer" or "accessory", so the
 * console stores both markers inside the 비고 (note) column:
 *
 *   특가:Y | 특가가격:7900 | 사진:https://...
 *
 * These helpers read and rewrite those segments without touching free text.
 */
export const SPECIAL_FLAG = '특가';
export const SPECIAL_PRICE = '특가가격';
/**
 * Per-product payment costs the shop absorbs, stored in 비고:
 *   VAT:7        → 7% of 판매가
 *   웹수수료:250  → 250 THB fixed amount
 */
export const VAT_RATE = 'VAT';
export const FEE_RATE = '웹수수료';
/** Older rows may still carry the legacy key name; read it as a fallback. */
export const FEE_RATE_LEGACY = '바트 직접 입력';
/** Sale date, stored in 비고 as `판매일:2026-11-05`. */
export const SALE_DATE = '판매일';
/**
 * 한국 중고거래(당근마켓 등)에 올릴 때 쓰는 원화 판매가를 상품별로 보관합니다.
 *   한국판매가:132000
 * 시트에 별도 칸이 없어 비고 안에 함께 남깁니다.
 */
export const KR_PRICE = '한국판매가';
/**
 * 정산 환율(1바트 = ?원)은 판매 완료를 저장한 그 시점 값으로 고정해서 비고에 남깁니다.
 *   환율:40.2
 * 나중에 환율이 올라도 이미 판매한 건은 이 값으로만 원가를 환산합니다.
 */
export const FX_RATE = '환율';

/** Club types — everything else (bag, accessories) belongs to 액세서리. */
const CLUB_TYPES: ProductType[] = ['driver', 'wood', 'iron', 'utility', 'wedge', 'putter'];

export function isClubType(type: ProductType): boolean {
  return CLUB_TYPES.includes(type);
}

function splitNote(note: string): string[] {
  return note
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

function segmentKey(segment: string): string {
  const index = segment.indexOf(':');
  return (index === -1 ? segment : segment.slice(0, index)).trim();
}

/** Value of a `key:value` segment. A bare `key` segment reads back as `Y`. */
export function readNoteValue(note: string, key: string): string {
  const found = splitNote(note).find((segment) => segmentKey(segment) === key);
  if (!found) return '';
  const index = found.indexOf(':');
  if (index === -1) return 'Y';
  return found.slice(index + 1).trim();
}

/** Replaces (or removes when value is null/empty) one segment, keeping the rest intact. */
export function writeNoteValue(note: string, key: string, value: string | null): string {
  const kept = splitNote(note).filter((segment) => segmentKey(segment) !== key);
  const nextValue = (value ?? '').trim();
  if (nextValue) kept.push(`${key}:${nextValue}`);
  return kept.join(' | ');
}

export function isSpecial(note: string): boolean {
  const flag = readNoteValue(note, SPECIAL_FLAG).toUpperCase();
  return flag.startsWith('Y') || flag.startsWith('T') || flag === '특가';
}

export function noteSpecialPrice(note: string): number {
  const raw = readNoteValue(note, SPECIAL_PRICE).replace(/[^0-9.]/g, '');
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** Percentage rate (0~100) stored in a note segment, e.g. `VAT:7`. */
export function noteRate(note: string, key: string): number {
  const raw = readNoteValue(note, key).replace(/[^0-9.]/g, '');
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return Math.min(100, value);
}

/** Fixed amount in THB stored in a note segment, e.g. `웹수수료:250`. */
export function noteAmount(note: string, key: string, legacyKey?: string): number {
  const source = readNoteValue(note, key) || (legacyKey ? readNoteValue(note, legacyKey) : '');
  const raw = source.replace(/[^0-9.]/g, '');
  if (!raw) return 0;
  const value = Number(raw);
  if (!Number.isFinite(value) || value <= 0) return 0;
  return value;
}

/** 상품별로 정해 둔 한국 판매가(원). 기록이 없으면 0. */
export function noteKrPrice(note: string): number {
  const raw = readNoteValue(note, KR_PRICE).replace(/[^0-9]/g, '');
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/** 판매 완료 시점에 고정된 정산 환율. 기록이 없으면 0. */
export function noteFxRate(note: string): number {
  const raw = readNoteValue(note, FX_RATE).replace(/[^0-9.]/g, '');
  if (!raw) return 0;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

/**
 * Where a row should appear on the website.
 * - Golf clubs → 중고 상품, unless marked 특가 → 특가 상품
 * - Bags and accessories → 액세서리
 */
export function resolveCategory(type: ProductType, note: string): CategoryKey {
  if (!isClubType(type)) return 'accessories';
  return isSpecial(note) ? 'events' : 'used';
}

export const CATEGORY_LABEL: Record<CategoryKey, string> = {
  events: '특가 상품',
  used: '중고 상품',
  accessories: '액세서리',
};

export function categoryBadgeClass(category: CategoryKey): string {
  if (category === 'events') return 'bg-accent-100 text-accent-900';
  if (category === 'accessories') return 'bg-secondary-100 text-secondary-900';
  return 'bg-background-200 text-foreground-700';
}