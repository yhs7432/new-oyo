export const SHEET_ID = '1iIvop4UcnSs7U_WJjvb2qLKeRWH9BbA9fb0FebsVgdw';
export const SHEET_GID = '1243559779';

export const SHEET_CSV_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;

/**
 * 판매 완료 탭 이름. 관리자 화면과 Apps Script가 쓰는 이름과 같아야 합니다.
 * 메인 시트의 재고상태가 사라져도 이 탭의 기록으로 판매 여부를 되살립니다.
 */
export const SHEET_ARCHIVE_NAME = '판매 완료';

export const SHEET_ARCHIVE_URL =
  `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_ARCHIVE_NAME)}`;