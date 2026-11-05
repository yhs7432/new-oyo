import { SHEET_CSV_URL } from '@/config/sheet';
import type { Flex, Grade, Product, ProductType } from '@/types/product';
import { noteSpecialPrice, resolveCategory } from '@/utils/sheetNote';

const FALLBACK_IMAGES: Record<ProductType, string> = {
  driver:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20single%20golf%20driver%20club%20standing%20upright%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-driver&orientation=portrait',
  wood:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20single%20fairway%20wood%20golf%20club%20standing%20upright%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-wood&orientation=portrait',
  iron:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20row%20of%20polished%20steel%20golf%20irons%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-iron&orientation=portrait',
  utility:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20single%20golf%20utility%20hybrid%20club%20standing%20upright%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-utility&orientation=portrait',
  wedge:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20single%20satin%20steel%20golf%20wedge%20club%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-wedge&orientation=portrait',
  putter:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20silver%20blade%20golf%20putter%20lying%20diagonally%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-putter&orientation=portrait',
  bag:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20golf%20caddie%20bag%20standing%20upright%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-bag&orientation=portrait',
  accessory:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20golf%20accessories%20arranged%20neatly%20on%20a%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-accessory&orientation=portrait',
};

export function fallbackImage(type: ProductType): string {
  return FALLBACK_IMAGES[type] ?? FALLBACK_IMAGES.accessory;
}

const COLUMN = {
  id: '재고번호',
  registered: '등록일',
  category: '카테고리',
  brand: '브랜드',
  name: '상품명',
  spec: '사양',
  unit: '판매단위',
  grade: '중고등급',
  condition: '상태(%)',
  headCover: '헤드커버',
  priceThb: '판매가격(THB)',
  location: '보관위치',
  stockStatus: '재고상태',
  visible: '웹노출',
  note: '비고',
} as const;

const TYPE_MAP: Record<string, ProductType> = {
  driver: 'driver',
  wood: 'wood',
  iron: 'iron',
  utility: 'utility',
  wedge: 'wedge',
  putter: 'putter',
  bag: 'bag',
  accessories: 'accessory',
  accessory: 'accessory',
};

const GRADES: Grade[] = ['A+', 'A', 'B', 'C'];

/** RFC4180-ish CSV parser: supports quoted fields, embedded commas and escaped quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (char !== '\r') {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

function toNumber(value: string | undefined): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '');
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseFlex(spec: string): Flex | undefined {
  const match = spec.match(/Flex\s*([A-Za-z0-9+/]+)/i);
  if (!match) return undefined;

  const raw = match[1].toUpperCase();
  if (/^(S|S\d+|\d+S)$/.test(raw)) return 'S';
  if (/^(R|R\d+|\d+R)$/.test(raw)) return 'R';
  if (raw === 'SR') return 'SR';
  if (raw === 'L' || raw === 'LS') return 'L';
  if (raw === 'X' || raw === 'TX') return 'X';
  if (raw === 'A') return 'A';
  return undefined;
}

function parsePhotos(note: string): string[] {
  const found = note.match(/https:\/\/drive\.google\.com\/thumbnail\?[^|\s]+/g) ?? [];
  const ids = found
    .map((url) => url.match(/[?&]id=([A-Za-z0-9_-]+)/)?.[1])
    .filter((id): id is string => Boolean(id));

  return Array.from(new Set(ids)).map(
    (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
  );
}

function cleanDescription(note: string): string {
  return note
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0)
    .filter((segment) => !/^(사진|박스|태국입고|한국판매가|웹노출|특가|특가가격)\s*:/.test(segment))
    .filter((segment) => !segment.startsWith('http'))
    .join(' · ')
    .trim();
}

function mapRow(values: Record<string, string>, index: number): Product | null {
  const rawName = (values[COLUMN.name] ?? '').trim();
  if (!rawName) return null;

  const rawType = (values[COLUMN.category] ?? '').trim();
  const type = TYPE_MAP[rawType.toLowerCase()] ?? 'accessory';
  const spec = (values[COLUMN.spec] ?? '').trim();
  const note = values[COLUMN.note] ?? '';
  const photos = parsePhotos(note);
  const gradeRaw = (values[COLUMN.grade] ?? '').trim().toUpperCase();
  const grade = GRADES.includes(gradeRaw as Grade) ? (gradeRaw as Grade) : undefined;
  const thb = toNumber(values[COLUMN.priceThb]);
  const specialPrice = noteSpecialPrice(note);
  const hasSpecialPrice = specialPrice > 0;
  const price = hasSpecialPrice && resolveCategory(type, note) === 'events' ? specialPrice : thb;
  const conditionRaw = toNumber(values[COLUMN.condition]);
  const conditionPercent = conditionRaw > 0 && conditionRaw <= 1 ? Math.round(conditionRaw * 100) : undefined;
  const id = (values[COLUMN.id] ?? '').trim() || `SHEET-${index + 1}`;
  const brand = (values[COLUMN.brand] ?? '').trim() || 'OTHER';

  return {
    id,
    category: resolveCategory(type, note),
    type,
    brand,
    name: { en: rawName, ko: rawName, th: rawName },
    price,
    originalPrice: price < thb ? thb : undefined,
    priceOnRequest: price <= 0,
    headGrade: grade,
    flex: parseFlex(spec),
    spec: spec || '—',
    location: 'TH',
    stock: 1,
    image: photos[0] ?? fallbackImage(type),
    images: photos,
    addedAt: (values[COLUMN.registered] ?? '').trim(),
    conditionPercent,
    visible: (values[COLUMN.visible] ?? '').trim().toUpperCase() === 'Y',
    stockStatus: (values[COLUMN.stockStatus] ?? '').trim() || undefined,
    headCoverIncluded: (values[COLUMN.headCover] ?? '').trim() === '포함',
    description: cleanDescription(note) || undefined,
    raw: values,
  };
}

export function mapSheetToProducts(csv: string): Product[] {
  const rows = parseCsv(csv);
  if (rows.length < 2) return [];

  const header = rows[0].map((cell) => cell.trim());
  const products: Product[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const record: Record<string, string> = {};
    header.forEach((key, columnIndex) => {
      record[key] = cells[columnIndex] ?? '';
    });

    const product = mapRow(record, i - 1);
    if (product) products.push(product);
  }

  return products;
}

let cache: Product[] | null = null;
let pending: Promise<Product[]> | null = null;

/** Drops the in-memory sheet cache so the next read picks up freshly written rows. */
export function invalidateCatalogue(): void {
  cache = null;
  pending = null;
}

export async function fetchCatalogue(force = false): Promise<Product[]> {
  if (!force && cache) return cache;
  if (!force && pending) return pending;

  pending = (async () => {
    const url = force ? `${SHEET_CSV_URL}&_=${Date.now()}` : SHEET_CSV_URL;
    const response = await fetch(url, {
      headers: { Accept: 'text/csv' },
      cache: force ? 'no-store' : 'default',
    });
    if (!response.ok) {
      throw new Error(`Sheet request failed (${response.status})`);
    }
    const text = await response.text();
    const items = mapSheetToProducts(text);
    if (items.length === 0) {
      throw new Error('Sheet returned no products');
    }
    cache = items;
    return items;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}