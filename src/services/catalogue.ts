import { SHEET_ARCHIVE_URL, SHEET_CSV_URL } from '@/config/sheet';
import type { Flex, Grade, Product, ProductType, SaleRecord } from '@/types/product';
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
  fullset:
    'https://readdy.ai/api/search-image?query=Studio%20product%20photograph%20of%20a%20complete%20golf%20club%20set%20arranged%20in%20a%20row%2C%20driver%2C%20fairway%20wood%2C%20irons%20and%20putter%20with%20matching%20bag%2C%20soft%20warm%20beige%20seamless%20background%2C%20soft%20diffused%20studio%20light%2C%20gentle%20shadow%2C%20minimal%20editorial%20catalogue%20style%2C%20high%20detail&width=800&height=1000&seq=oyogolf-fallback-fullset&orientation=portrait',
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
  fullset: 'fullset',
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
  const segments = note
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);

  /* "사진:" 처럼 이름표가 붙은 칸이 있으면 그것만 사진으로 봅니다.
     (인보이스·배송 링크처럼 사진이 아닌 주소를 잘못 집어오지 않도록) */
  const labelled = segments.filter((segment) => /^(사진|사진링크|이미지|이미지링크|photo|photos|image|images)\s*[:：]/i.test(segment));
  const source = labelled.length > 0 ? labelled : segments;

  return collectPhotoUrls(source.join(' '));
}

/** 한 셀 안의 주소들 중에서 "사진으로 쓸 수 있는 주소"만 골라 표준 썸네일 주소로 바꿉니다. */
function collectPhotoUrls(text: string): string[] {
  const urls = text.match(/https?:\/\/[^\s|"'<>]+/g) ?? [];
  const driveIds: string[] = [];
  const direct: string[] = [];

  urls.forEach((raw) => {
    const url = raw.replace(/[),.;]+$/, '');
    const id = googleFileId(url);
    if (id) {
      driveIds.push(id);
      return;
    }
    /* 드라이브가 아닌 일반 이미지 주소(jpg·png·webp 등)도 그대로 사용합니다. */
    if (
      /\.(jpe?g|png|webp|gif|avif)(\?|$)/i.test(url) ||
      /(res\.cloudinary\.com|images\.unsplash\.com|i\.imgur\.com|cdn\.shopify\.com)/i.test(url)
    ) {
      direct.push(url);
    }
  });

  const fromDrive = Array.from(new Set(driveIds)).map(
    (id) => `https://drive.google.com/thumbnail?id=${id}&sz=w1000`,
  );
  return Array.from(new Set([...fromDrive, ...direct]));
}

/**
 * 구글 드라이브 주소에서 파일 ID만 뽑습니다.
 * - 썸네일 주소: https://drive.google.com/thumbnail?id=XXXX
 * - 공유 주소:   https://drive.google.com/file/d/XXXX/view?usp=drive_link
 * - 열기 주소:   https://drive.google.com/open?id=XXXX
 */
function googleFileId(url: string): string | undefined {
  if (!/google\.com|googleusercontent\.com/i.test(url)) return undefined;
  const byPath = url.match(/\/d\/([A-Za-z0-9_-]{10,})/);
  if (byPath) return byPath[1];
  const byQuery = url.match(/[?&]id=([A-Za-z0-9_-]{10,})/);
  if (byQuery) return byQuery[1];
  return undefined;
}

/** 시트에 사진 전용 칸이 따로 생겨도 읽을 수 있도록 이름을 모아 둡니다. */
const PHOTO_COLUMNS = ['사진', '사진링크', '사진 링크', '이미지', '이미지링크', 'photo', 'photos', 'image', 'images'];

/** 기존 넘버·기존 시트 행처럼 직원만 보면 되는 메모인지 판별합니다. */
const INTERNAL_REF_PATTERN = /(기존\s*넘버|기존\s*번호|기존\s*시트|이전\s*시트|구\s*넘버|과거\s*시트)/i;

function noteSegments(note: string): string[] {
  return note
    .split('|')
    .map((segment) => segment.trim())
    .filter((segment) => segment.length > 0);
}

/** 홈페이지에 내보내지 않고 관리자 화면에서만 쓰는 내부 참조 메모를 모옵니다. */
function extractInternalRef(note: string): string {
  return noteSegments(note)
    .filter((segment) => INTERNAL_REF_PATTERN.test(segment))
    .join(' · ')
    .trim();
}

function cleanDescription(note: string): string {
  return noteSegments(note)
    .filter((segment) => !/^(사진|박스|태국입고|한국판매가|웹노출|특가|특가가격)\s*:/.test(segment))
    .filter((segment) => !segment.startsWith('http'))
    .filter((segment) => !INTERNAL_REF_PATTERN.test(segment))
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
  const columnPhotoText = PHOTO_COLUMNS.map((key) => values[key] ?? '')
    .filter((value) => value.trim().length > 0)
    .join(' | ');
  const photos = Array.from(
    new Set([...collectPhotoUrls(columnPhotoText), ...parsePhotos(note)]),
  );
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
    photoMissing: photos.length === 0,
    addedAt: (values[COLUMN.registered] ?? '').trim(),
    conditionPercent,
    visible: (values[COLUMN.visible] ?? '').trim().toUpperCase() === 'Y',
    stockStatus: (values[COLUMN.stockStatus] ?? '').trim() || undefined,
    headCoverIncluded: (values[COLUMN.headCover] ?? '').trim() === '포함',
    description: cleanDescription(note) || undefined,
    internalRef: extractInternalRef(note) || undefined,
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

/** ‘판매 완료’ 탭의 열 이름입니다. */
const ARCHIVE_COLUMN = {
  id: '재고번호',
  soldAt: '기록시각',
  saleDate: '판매일',
  revenue: '판매가(THB)',
  costKrw: '원가(KRW)',
  vat: 'VAT(THB)',
  fee: '웹수수료(THB)',
  rate: '환율',
  channel: '판매채널',
  staff: '담당자',
  memo: '메모',
} as const;

/** 판매 완료 탭의 한 줄을 판매 기록으로 바꿉니다. 재고번호가 없으면 건너뜁니다. */
function mapArchiveRows(csv: string): Map<string, SaleRecord> {
  const records = new Map<string, SaleRecord>();
  const rows = parseCsv(csv);
  if (rows.length < 2) return records;

  const header = rows[0].map((cell) => cell.trim());

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    const record: Record<string, string> = {};
    header.forEach((key, columnIndex) => {
      record[key] = cells[columnIndex] ?? '';
    });

    const id = (record[ARCHIVE_COLUMN.id] ?? '').trim();
    if (!id) continue;

    records.set(id, {
      saleDate: (record[ARCHIVE_COLUMN.saleDate] ?? '').trim(),
      soldAt: (record[ARCHIVE_COLUMN.soldAt] ?? '').trim() || undefined,
      revenue: toNumber(record[ARCHIVE_COLUMN.revenue]),
      costKrw: toNumber(record[ARCHIVE_COLUMN.costKrw]),
      vat: toNumber(record[ARCHIVE_COLUMN.vat]),
      fee: toNumber(record[ARCHIVE_COLUMN.fee]),
      rate: toNumber(record[ARCHIVE_COLUMN.rate]),
      channel: (record[ARCHIVE_COLUMN.channel] ?? '').trim() || undefined,
      staff: (record[ARCHIVE_COLUMN.staff] ?? '').trim() || undefined,
      memo: (record[ARCHIVE_COLUMN.memo] ?? '').trim() || undefined,
    });
  }

  return records;
}

/**
 * ‘판매 완료’ 탭에 기록이 있으면, 메인 시트 상태가 어떻든 판매 완료로 되살립니다.
 * (시트 오류로 재입력하면서 상태·비고가 초기화된 경우를 복구합니다)
 */
function applySaleRecords(items: Product[], records: Map<string, SaleRecord>): Product[] {
  if (records.size === 0) return items;

  return items.map((item) => {
    const record = records.get(item.id);
    if (!record) return item;

    if ((item.stockStatus ?? '').includes('완료') && item.visible === false) {
      return { ...item, saleRecord: record };
    }

    return {
      ...item,
      stockStatus: '판매 완료',
      visible: false,
      saleRecord: record,
      raw: { ...(item.raw ?? {}), 재고상태: '판매 완료', 웹노출: 'N' },
    };
  });
}

/** 판매 완료 탭을 읽습니다. 실패해도 메인 목록은 그대로 보여 줍니다. */
async function fetchSaleRecords(): Promise<Map<string, SaleRecord>> {
  try {
    const response = await fetch(`${SHEET_ARCHIVE_URL}&_=${Date.now()}`, {
      headers: { Accept: 'text/csv' },
      cache: 'no-store',
    });
    if (!response.ok) return new Map();
    const text = await response.text();
    return mapArchiveRows(text);
  } catch {
    return new Map();
  }
}

let cache: Product[] | null = null;
let cacheAt = 0;
let pending: Promise<Product[]> | null = null;

/** 한 번 읽은 시트를 이 시간 동안은 다시 부르지 않습니다(탭 하나 기준). */
const CACHE_TTL_MS = 45 * 1000;
/** 강제 새로고침이라도 이 간격 안의 중복 요청은 하나로 합칩니다. */
const MIN_GAP_MS = 3000;

/** 마지막으로 시트를 읽어 온 시각(ms). 아직 읽지 않았으면 0. */
export function catalogueSyncedAt(): number {
  return cacheAt;
}

/** Drops the in-memory sheet cache so the next read picks up freshly written rows. */
export function invalidateCatalogue(): void {
  cache = null;
  cacheAt = 0;
  pending = null;
}

export async function fetchCatalogue(force = false): Promise<Product[]> {
  if (cache) {
    const age = Date.now() - cacheAt;
    if (age < (force ? MIN_GAP_MS : CACHE_TTL_MS)) return cache;
  }
  if (pending) return pending;

  pending = (async () => {
    // 구글 CSV 응답도 브라우저·구글 쪽에 잠시 캐시되므로 매번 주소를 다르게 만듭니다.
    const url = `${SHEET_CSV_URL}&_=${Date.now()}`;
    const [response, records] = await Promise.all([
      fetch(url, { headers: { Accept: 'text/csv' }, cache: 'no-store' }),
      fetchSaleRecords(),
    ]);
    if (!response.ok) {
      throw new Error(`Sheet request failed (${response.status})`);
    }
    const text = await response.text();
    const items = applySaleRecords(mapSheetToProducts(text), records);
    if (items.length === 0) {
      throw new Error('Sheet returned no products');
    }
    cache = items;
    cacheAt = Date.now();
    return items;
  })();

  try {
    return await pending;
  } finally {
    pending = null;
  }
}