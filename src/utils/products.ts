import type { CategoryKey, Flex, LocalizedName, Product, ProductType } from '@/types/product';
import { products } from '@/mocks/products';
import { isSoldItem } from '@/utils/settlement';

export const PAGE_SIZE = 20;

export const categoryRoute: Record<CategoryKey, string> = {
  events: '/special-offers',
  used: '/used-clubs',
  accessories: '/accessories',
};

export const categoryKey: Record<CategoryKey, string> = {
  events: 'special',
  used: 'used',
  accessories: 'accessories',
};

export const categoryFromPath: Record<string, CategoryKey> = {
  '/special-offers': 'events',
  '/used-clubs': 'used',
  '/accessories': 'accessories',
};

export const typeOptions: ProductType[] = [
  'driver',
  'wood',
  'iron',
  'utility',
  'wedge',
  'putter',
  'fullset',
  'bag',
  'accessory',
];

export const flexOptions: Flex[] = ['L', 'R', 'SR', 'S', 'X', 'A'];

export type SortKey = 'newest' | 'price-asc' | 'price-desc';

export interface FilterState {
  type: ProductType | 'all';
  brand: string;
  flex: Flex | 'all';
  query: string;
  sort: SortKey;
}

export const emptyFilters: FilterState = {
  type: 'all',
  brand: 'all',
  flex: 'all',
  query: '',
  sort: 'newest',
};

export function localizedName(name: LocalizedName, lang: string): string {
  if (lang.startsWith('ko')) return name.ko;
  if (lang.startsWith('th')) return name.th;
  return name.en;
}

export function discountPercent(product: Product): number {
  if (product.priceOnRequest) return 0;
  if (!product.originalPrice || product.originalPrice <= product.price) return 0;
  return Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100);
}

export function hasPrice(product: Product): boolean {
  return !product.priceOnRequest && product.price > 0;
}

/** 사진이 등록된 상품인지 확인합니다. 시트에 사진 링크가 없으면 대체 이미지를 씁니다. */
export function hasPhoto(product: Product): boolean {
  if (product.photoMissing) return false;
  if (product.images && product.images.length > 0) return true;
  return Boolean(product.image);
}

/** Items without a price are always pushed to the end of price sorting. */
function priceValue(product: Product): number {
  return hasPrice(product) ? product.price : Number.POSITIVE_INFINITY;
}

export function productsOf(category?: CategoryKey): Product[] {
  return category ? products.filter((p) => p.category === category) : [...products];
}

/**
 * 시트의 “웹노출”이 N 인 행은 관리자 화면에서만 다루고, 홈페이지에는 내보내지 않습니다.
 * 재고상태가 판매 완료인 상품도 시트 값과 무관하게 항상 제외합니다.
 * mock 상품처럼 visible 값이 없는 경우는 노출로 봅니다.
 */
export function visibleOnly(list: Product[]): Product[] {
  return list.filter((product) => product.visible !== false && !isSoldItem(product));
}

export function brandsOf(list: Product[]): string[] {
  return Array.from(new Set(list.map((p) => p.brand))).sort();
}

export function typesOf(list: Product[]): ProductType[] {
  return typeOptions.filter((type) => list.some((p) => p.type === type));
}

export function filterProducts(list: Product[], filters: FilterState): Product[] {
  const query = filters.query.trim().toLowerCase();
  const filtered = list.filter((p) => {
    if (filters.type !== 'all' && p.type !== filters.type) return false;
    if (filters.brand !== 'all' && p.brand !== filters.brand) return false;
    if (filters.flex !== 'all' && p.flex !== filters.flex) return false;
    if (query) {
      const haystack = [p.name.en, p.name.ko, p.name.th, p.brand, p.spec, p.id].join(' ').toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      return filtered.sort((a, b) => priceValue(a) - priceValue(b));
    case 'price-desc':
      return filtered.sort((a, b) => {
        const aValue = hasPrice(a) ? a.price : -1;
        const bValue = hasPrice(b) ? b.price : -1;
        return bValue - aValue;
      });
    default:
      return filtered.sort((a, b) => {
        /* 사진이 아직 없는 상품은 목록 뒤쪽으로 보냅니다. */
        const aPhotoFirst = hasPhoto(a) ? 0 : 1;
        const bPhotoFirst = hasPhoto(b) ? 0 : 1;
        if (aPhotoFirst !== bPhotoFirst) return aPhotoFirst - bPhotoFirst;
        if (a.addedAt === b.addedAt) return 0;
        if (!a.addedAt) return 1;
        if (!b.addedAt) return -1;
        return a.addedAt < b.addedAt ? 1 : -1;
      });
  }
}

export function paginate<T>(items: T[], page: number): T[] {
  const start = (page - 1) * PAGE_SIZE;
  return items.slice(start, start + PAGE_SIZE);
}

export function totalPages(count: number): number {
  return Math.max(1, Math.ceil(count / PAGE_SIZE));
}