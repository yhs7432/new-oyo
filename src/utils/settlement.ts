import type { Product } from '@/types/product';
import {
  FEE_RATE,
  FEE_RATE_LEGACY,
  SALE_DATE,
  VAT_RATE,
  noteAmount,
  noteFxRate,
  noteRate,
  readNoteValue,
} from '@/utils/sheetNote';

export interface SettlementTotals {
  count: number;
  revenue: number;
  cost: number;
  charges: number;
  net: number;
  marginPercent: number;
}

export interface MonthlySettlement extends SettlementTotals {
  key: string;
  label: string;
  /** Month with no recorded sale date — always rendered last. */
  undated: boolean;
}

export interface DateRange {
  from: string;
  to: string;
}

export interface SettledItem {
  saleDate: string;
  monthKey: string;
  revenue: number;
  cost: number;
  charges: number;
  net: number;
  marginPercent: number;
  /** 이 판매 건에 실제로 적용된 환율(1바트 = ?원). */
  rate: number;
  /** 판매 완료 시점 환율이 고정 저장된 건이면 true. */
  rateLocked: boolean;
}

interface Row {
  saleThb: number;
  cost: number;
  charges: number;
}

function noteOf(item: Product): string {
  return item.raw?.['비고'] ?? '';
}

/** `2026-11-05`, `2026.11.05`, `2026/11/5` → `2026-11-05`, unreadable → ''. */
export function normalizeDate(dateText: string): string {
  const match = dateText.match(/(\d{4})\D+(\d{1,2})\D+(\d{1,2})/);
  if (!match) return '';
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return '';
  if (!Number.isFinite(day) || day < 1 || day > 31) return '';
  return `${match[1]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isRangeActive(range: DateRange | null): boolean {
  return Boolean(range && (range.from || range.to));
}

/** True when the sale date falls inside the range (always true without a range). */
export function inDateRange(dateText: string, range: DateRange | null): boolean {
  if (!isRangeActive(range) || !range) return true;
  const iso = normalizeDate(dateText);
  if (!iso) return false;
  if (range.from && iso < range.from) return false;
  if (range.to && iso > range.to) return false;
  return true;
}

/** `2026-11-05`, `2026.11.05`, `2026/11/5` → `2026-11`. */
export function monthKeyOf(dateText: string): string {
  const match = dateText.match(/(\d{4})\D+(\d{1,2})/);
  if (!match) return '';
  const month = Number(match[2]);
  if (!Number.isFinite(month) || month < 1 || month > 12) return '';
  return `${match[1]}-${String(month).padStart(2, '0')}`;
}

function toTotals(rows: Row[]): SettlementTotals {
  let revenue = 0;
  let cost = 0;
  let charges = 0;
  rows.forEach((row) => {
    revenue += row.saleThb;
    cost += row.cost;
    charges += row.charges;
  });
  const net = revenue - cost - charges;
  const marginPercent = revenue > 0 ? Math.round((net / revenue) * 1000) / 10 : 0;
  return { count: rows.length, revenue, cost, charges, net, marginPercent };
}

export function isSoldItem(item: Product): boolean {
  return (item.stockStatus ?? '').includes('완료');
}

/** Revenue, cost (KRW → THB) and VAT/fee charges for one sold product. */
export function settlementOf(item: Product, rate: number): SettledItem {
  const note = noteOf(item);
  const saleThb = item.priceOnRequest ? 0 : item.price;
  const costKrw = Number(String(item.raw?.['한국원가(KRW)'] ?? '').replace(/[^0-9]/g, '')) || 0;
  // 판매 완료 시점에 저장된 환율이 있으면 그 값으로만 환산합니다.
  const lockedRate = noteFxRate(note);
  const appliedRate = lockedRate > 0 ? lockedRate : rate;
  const cost = appliedRate > 0 ? costKrw / appliedRate : 0;
  const vat = (saleThb * noteRate(note, VAT_RATE)) / 100;
  const fee = noteAmount(note, FEE_RATE, FEE_RATE_LEGACY);
  const charges = vat + fee;
  const net = saleThb - cost - charges;
  const saleDate = readNoteValue(note, SALE_DATE);

  return {
    saleDate,
    monthKey: monthKeyOf(saleDate),
    revenue: saleThb,
    cost,
    charges,
    net,
    marginPercent: saleThb > 0 ? Math.round((net / saleThb) * 1000) / 10 : 0,
    rate: appliedRate,
    rateLocked: lockedRate > 0,
  };
}

/** 판매 완료 시점 환율이 고정된 판매 건 수(선택 기간 기준). */
export function lockedRateCount(items: Product[], range: DateRange | null = null): number {
  return items.filter(
    (item) =>
      isSoldItem(item) &&
      inDateRange(readNoteValue(noteOf(item), SALE_DATE), range) &&
      noteFxRate(noteOf(item)) > 0,
  ).length;
}

/** Sold products with no readable sale date. */
export function undatedSoldCount(items: Product[]): number {
  return items.filter(
    (item) => isSoldItem(item) && !normalizeDate(readNoteValue(noteOf(item), SALE_DATE)),
  ).length;
}

/** Sold products excluded because their sale date is outside the selected range. */
export function outOfRangeCount(items: Product[], range: DateRange | null): number {
  if (!isRangeActive(range)) return 0;
  return items.filter((item) => {
    if (!isSoldItem(item)) return false;
    return !inDateRange(readNoteValue(noteOf(item), SALE_DATE), range);
  }).length;
}

function soldRows(items: Product[], rate: number, range: DateRange | null = null): Row[] {
  return items
    .filter(isSoldItem)
    .filter((item) => inDateRange(readNoteValue(noteOf(item), SALE_DATE), range))
    .map((item) => {
      const settled = settlementOf(item, rate);
      return { saleThb: settled.revenue, cost: settled.cost, charges: settled.charges };
    });
}

/** Totals across sold products inside the range (all sold when no range). */
export function totalSettlement(
  items: Product[],
  rate: number,
  range: DateRange | null = null,
): SettlementTotals {
  return toTotals(soldRows(items, rate, range));
}

/** Monthly totals, newest month first, undated sales at the end. */
export function monthlySettlement(
  items: Product[],
  rate: number,
  range: DateRange | null = null,
): MonthlySettlement[] {
  const buckets = new Map<string, Row[]>();
  const sold = items.filter(isSoldItem);

  sold.forEach((item) => {
    const settled = settlementOf(item, rate);
    if (!inDateRange(settled.saleDate, range)) return;
    const key = settled.monthKey || 'unknown';
    const bucket = buckets.get(key) ?? [];
    bucket.push({ saleThb: settled.revenue, cost: settled.cost, charges: settled.charges });
    buckets.set(key, bucket);
  });

  return [...buckets.entries()]
    .map(([key, rows]) => ({
      ...toTotals(rows),
      key,
      label: key === 'unknown' ? '날짜 미기록' : `${key.slice(0, 4)}년 ${Number(key.slice(5, 7))}월`,
      undated: key === 'unknown',
    }))
    .sort((a, b) => {
      if (a.undated) return 1;
      if (b.undated) return -1;
      return a.key < b.key ? 1 : -1;
    });
}