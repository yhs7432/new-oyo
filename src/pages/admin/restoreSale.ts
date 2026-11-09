import { removeSaleArchiveEntries, updateSheetRows } from '@/services/sheetWrite';
import type { Product } from '@/types/product';
import { FX_RATE, SALE_DATE, writeNoteValue } from '@/utils/sheetNote';

export interface RestoreSaleResult {
  ok: boolean;
  message: string;
}

/**
 * 판매 완료 상품을 다시 판매 목록으로 돌립니다.
 *
 * 1) 메인 시트의 재고상태를 원하는 상태(기본 판매 가능)로 되돌리고 웹노출을 Y로 바꿉니다.
 * 2) 비고에 고정해 둔 판매일·판매 시점 환율을 지웁니다.
 * 3) ‘판매 완료’ 탭의 기록을 삭제해, 다시 판매 완료로 되살아나지 않게 합니다.
 *
 * 판매가는 판매 당시 금액이 시트에 남아 있을 수 있으므로 건드리지 않습니다.
 */
export async function restoreSoldProduct(
  product: Product,
  targetStatus = '판매 가능',
): Promise<RestoreSaleResult> {
  const note = product.raw?.['비고'] ?? '';
  const withoutDate = writeNoteValue(note, SALE_DATE, null);
  const cleanedNote = writeNoteValue(withoutDate, FX_RATE, null);

  const fields: Record<string, string | number> = {
    재고상태: targetStatus,
    웹노출: 'Y',
  };
  if (cleanedNote !== note) fields['비고'] = cleanedNote;

  const update = await updateSheetRows([{ id: product.id, fields }]);
  if (!update.ok) return { ok: false, message: update.message };

  const cleanup = await removeSaleArchiveEntries([{ id: product.id, name: product.name.en }]);
  if (!cleanup.ok) {
    return {
      ok: false,
      message: `${update.message} 다만 ‘판매 완료’ 탭 기록은 지우지 못했습니다 — ${cleanup.message} 「시트 연동」 화면에서 스크립트를 최신 버전으로 다시 배포한 뒤 다시 시도해 주세요.`,
    };
  }

  return {
    ok: true,
    message: `${product.id} · ${product.name.en} 판매 목록으로 되돌렸습니다. ${cleanup.message}`,
  };
}