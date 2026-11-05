export type CategoryKey = 'events' | 'used' | 'accessories';

export type ProductType =
  | 'driver'
  | 'wood'
  | 'iron'
  | 'utility'
  | 'wedge'
  | 'putter'
  | 'bag'
  | 'accessory';

export type Grade = 'S' | 'A+' | 'A' | 'B' | 'C';

export type Flex = 'L' | 'A' | 'R' | 'SR' | 'S' | 'X';

export type StockLocation = 'KR' | 'TH';

export interface LocalizedName {
  en: string;
  ko: string;
  th: string;
}

export interface Product {
  id: string;
  category: CategoryKey;
  type: ProductType;
  brand: string;
  name: LocalizedName;
  price: number;
  originalPrice?: number;
  headGrade?: Grade;
  shaftGrade?: Grade;
  gripGrade?: Grade;
  flex?: Flex;
  spec: string;
  location: StockLocation;
  stock: number;
  image: string;
  addedAt: string;
  /** True when the sheet has no THB price yet, so the item must be quoted on request. */
  priceOnRequest?: boolean;
  /** Additional photos from the sheet (first one equals `image`). */
  images?: string[];
  /** Condition ratio from the sheet, e.g. 90 for 90%. */
  conditionPercent?: number;
  /**
   * 시트의 “웹노출” 값. false 인 행은 관리자 화면에서만 보이고 사이트에는 나오지 않습니다.
   * 시트에서 읽은 상품에만 채워지며, mock 상품은 값을 갖지 않습니다.
   */
  visible?: boolean;
  /** Raw stock status label from the sheet, e.g. 판매 가능 / 예약. */
  stockStatus?: string;
  headCoverIncluded?: boolean;
  description?: string;
  /** Raw sheet row keyed by column name, used by the admin console when writing back. */
  raw?: Record<string, string>;
  /**
   * Sheet row ids merged into this card on the website.
   * The sheet keeps every row separately; this is display-only.
   */
  groupedIds?: string[];
}