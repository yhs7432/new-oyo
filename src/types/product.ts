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

/**
 * ‘판매 완료’ 탭에 남아 있는 판매 기록.
 * 메인 시트의 상태·비고가 사라져도 이 기록으로 판매 여부와 정산 금액을 되살립니다.
 */
export interface SaleRecord {
  saleDate: string;
  soldAt?: string;
  /** 실제 판매가(THB) */
  revenue: number;
  /** 원가(KRW) */
  costKrw: number;
  /** VAT(THB) 금액 */
  vat: number;
  /** 웹 수수료(THB) 금액 */
  fee: number;
  /** 판매 시점에 고정된 환율(1바트 = ?원). 0이면 기록 없음. */
  rate: number;
  channel?: string;
  staff?: string;
  memo?: string;
}

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
  /** 시트에 사진이 아직 등록되지 않아 대체 이미지를 쓰는 상품입니다. */
  photoMissing?: boolean;
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
  /**
   * 시트 비고에 적힌 내부 참조 정보(기존 넘버·기존 시트 행 등).
   * 관리자 화면에서만 보여 주고 홈페이지에는 내보내지 않습니다.
   */
  internalRef?: string;
  /** Raw sheet row keyed by column name, used by the admin console when writing back. */
  raw?: Record<string, string>;
  /**
   * ‘판매 완료’ 탭에서 읽어 온 판매 기록.
   * 값이 있으면 메인 시트 상태와 상관없이 판매 완료 상품으로 취급합니다.
   */
  saleRecord?: SaleRecord;
  /**
   * Sheet row ids merged into this card on the website.
   * The sheet keeps every row separately; this is display-only.
   */
  groupedIds?: string[];
}