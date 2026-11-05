import type { Product } from '@/types/product';

/**
 * Duplicate sheet rows (same brand, same title, same price) are merged into one
 * card on the website. The sheet itself is never modified — every row stays a
 * separate stock unit there.
 */

function normalize(value: string | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');
}

/** Category, type, brand, title and price must all match to be treated as the same product. */
export function groupKeyOf(product: Product): string {
  return [
    product.category,
    product.type,
    normalize(product.brand),
    normalize(product.name.en),
    product.priceOnRequest ? 'request' : String(product.price),
  ].join('|');
}

/** Higher score wins when picking which row represents the merged card. */
function representativeScore(product: Product): number {
  let score = 0;
  if (product.images && product.images.length > 1) score += 3;
  else if (product.images && product.images.length === 1) score += 2;
  if (product.stockStatus && product.stockStatus !== '예약') score += 1;
  if (product.conditionPercent && product.conditionPercent > 0) score += 1;
  if (product.description) score += 1;
  return score;
}

function unitCount(product: Product): number {
  return Number.isFinite(product.stock) && product.stock > 0 ? Math.floor(product.stock) : 1;
}

/**
 * Collapses duplicates into a single representative product.
 * The representative keeps the total quantity in `stock` and lists merged rows
 * in `groupedIds`, so the detail page can still trace back to real sheet rows.
 */
export function groupProducts(list: Product[]): Product[] {
  const order: string[] = [];
  const groups = new Map<string, Product>();

  list.forEach((product) => {
    const key = groupKeyOf(product);
    const existing = groups.get(key);

    if (!existing) {
      groups.set(key, {
        ...product,
        stock: unitCount(product),
        groupedIds: [product.id],
      });
      order.push(key);
      return;
    }

    const ids = [...(existing.groupedIds ?? [existing.id]), product.id];
    const total = unitCount(existing) + unitCount(product);
    const base = representativeScore(product) > representativeScore(existing) ? product : existing;

    groups.set(key, {
      ...base,
      stock: total,
      groupedIds: ids,
    });
  });

  return order
    .map((key) => groups.get(key))
    .filter((product): product is Product => Boolean(product));
}

/** Total quantity of the group that a single sheet row belongs to. */
export function groupStockOf(list: Product[], productId: string): number {
  return (
    groupProducts(list).find((product) => product.id === productId || product.groupedIds?.includes(productId))
      ?.stock ?? 1
  );
}