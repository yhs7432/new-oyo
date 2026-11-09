import type { Product } from '@/types/product';
import { SHEET_EDIT_URL } from '@/config/admin';
import SheetConnectionCard from '@/pages/admin/components/SheetConnectionCard';
import SaleRecoveryPanel from '@/pages/admin/components/SaleRecoveryPanel';

interface Props {
  items: Product[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  staffName: string;
}

const COLUMNS = [
  { name: '재고번호', desc: '상품 고유 코드 (예: OYO-40, TH-39). 상세 페이지 주소로 사용됩니다.' },
  { name: '등록일', desc: '시트에 입력한 날짜 그대로 표시됩니다.' },
  { name: '카테고리', desc: 'driver / wood / iron / utility / wedge / putter / bag / accessories' },
  { name: '브랜드', desc: '상품 목록의 브랜드 필터에 사용됩니다.' },
  { name: '상품명', desc: '상세 페이지 제목으로 표시됩니다.' },
  { name: '사양', desc: '로프트·샤프트·플렉스 정보를 함께 적으면 필터가 정확해집니다.' },
  { name: '중고등급', desc: 'A+ / A / B / C 중 하나.' },
  { name: '상태(%)', desc: '0~100 사이 숫자. 0.9처럼 입력해도 90%로 변환됩니다.' },
  { name: '헤드커버', desc: '“포함”으로 적으면 포함으로 표시됩니다.' },
  { name: '판매가격(THB)', desc: '비워 두면 “가격 문의”로 표시됩니다.' },
  { name: '재고상태', desc: '판매 가능 / 예약 / 판매 완료 등 자유 입력. 관리자 화면 집계에 사용됩니다.' },
  { name: '웹노출', desc: 'Y인 행만 홈페이지와 관리자 화면에 나타납니다.' },
  { name: '비고', desc: '사진 링크(drive.google.com/thumbnail?id=...)를 넣으면 사진이 표시됩니다.' },
];

export default function SheetPanel({ items, loading, error, onRetry, staffName }: Props) {
  const withPhoto = items.filter((item) => (item.images?.length ?? 0) > 0).length;
  const noPrice = items.filter((item) => item.priceOnRequest).length;

  return (
    <div>
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <h1 className="font-heading text-2xl text-foreground-950">시트 연동</h1>
          <p className="mt-1.5 max-w-2xl text-[12.5px] leading-relaxed text-foreground-600">
            홈페이지와 관리자 화면은 같은 구글시트를 씁니다. 관리자에서 저장하면 시트에 기록되고,
            시트에서 직접 고친 값도 1분 안에 홈페이지와 관리자 화면에 자동으로 다시 반영됩니다.
          </p>
        </div>
        <a
          href={SHEET_EDIT_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-[12px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
        >
          <i className="ri-google-fill"></i>
          Google 시트 열기 ↗
        </a>
      </div>

      <SheetConnectionCard />

      <SaleRecoveryPanel items={items} staffName={staffName} onDone={onRetry} />

      <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: '연동 상품', value: items.length.toLocaleString('en-US') },
          { label: '사진 있음', value: withPhoto.toLocaleString('en-US') },
          { label: '가격 미정', value: noPrice.toLocaleString('en-US') },
          { label: '불러오기 상태', value: error ? '오류' : loading ? '불러오는 중' : '정상' },
        ].map((card) => (
          <div key={card.label} className="rounded-lg border border-background-200 bg-background-50 px-4 py-3.5">
            <p className="text-[10.5px] uppercase tracking-[0.12em] text-foreground-500">{card.label}</p>
            <strong className="mt-1.5 block font-heading text-xl font-normal text-foreground-950">
              {card.value}
            </strong>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 rounded-lg border border-background-200 bg-background-50 px-4 py-3">
        <span className="text-[11.5px] text-foreground-600">
          현재 시트는 “링크가 있는 모든 사용자” 공유 상태여야 합니다.
        </span>
        <button
          type="button"
          onClick={onRetry}
          className="ml-auto cursor-pointer whitespace-nowrap rounded-md border border-background-300 px-3 py-1.5 text-[11.5px] text-foreground-700 transition-colors hover:border-foreground-400"
        >
          <i className="ri-refresh-line mr-1"></i>
          시트 새로고침
        </button>
      </div>

      <div className="mt-5 rounded-lg border border-secondary-300/70 bg-secondary-50 px-4 py-3.5">
        <p className="flex flex-wrap items-center gap-1.5 text-[12px] font-medium text-secondary-900">
          <i className="ri-price-tag-3-line"></i>
          ‘판매 완료’ 탭이 자동으로 만들어집니다
        </p>
        <p className="mt-1.5 text-[11px] leading-relaxed text-secondary-800">
          판매·출고 화면에서 “판매 완료”를 누르면 같은 스프레드시트 안에 <strong className="font-medium">판매 완료</strong> 탭이
          생기고, 판매일·재고번호·상품명·판매가·원가·VAT·웹 수수료·순수익·판매채널·담당자·메모가 한 줄씩
          쌓입니다. 같은 재고번호를 다시 저장하면 새 줄을 만들지 않고 그 줄만 갱신합니다. 메인 시트의 행은
          지우지 않으므로 정산 숫자는 그대로 유지됩니다.
        </p>
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-background-200 bg-background-50">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-background-200 bg-background-100/70">
              <th className="whitespace-nowrap px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-500">
                열 이름
              </th>
              <th className="whitespace-nowrap px-4 py-2.5 text-[10px] font-medium uppercase tracking-[0.12em] text-foreground-500">
                사용 방식
              </th>
            </tr>
          </thead>
          <tbody>
            {COLUMNS.map((column) => (
              <tr key={column.name} className="border-b border-background-200/70 last:border-0">
                <td className="whitespace-nowrap px-4 py-2.5 text-[12px] font-medium text-foreground-900">
                  {column.name}
                </td>
                <td className="px-4 py-2.5 text-[11.5px] leading-relaxed text-foreground-600">
                  {column.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 rounded-lg bg-background-200/50 px-4 py-3 text-[11px] leading-relaxed text-foreground-600">
        여러 장의 사진은 비고 칸에 링크를 여러 개 적으면 순서대로 표시됩니다. 사진은 구글 드라이브
        링크를 그대로 사용합니다.
      </p>
    </div>
  );
}