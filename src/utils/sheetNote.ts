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