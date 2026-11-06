import { useEffect, useState } from 'react';

interface Props {
  lastSyncedAt: number | null;
  refreshing: boolean;
  onRefresh: () => void;
  /** 자동 동기화 주기(초). 0 이면 자동 안 함. */
  intervalSeconds?: number;
}

function relativeLabel(at: number | null): string {
  if (!at) return '대기 중';
  const diff = Math.max(0, Date.now() - at);
  if (diff < 20 * 1000) return '방금';
  if (diff < 60 * 1000) return `${Math.floor(diff / 1000)}초 전`;
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)}분 전`;
  return `${Math.floor(diff / 3600000)}시간 전`;
}

/**
 * 관리자 화면 상단에 붙는 시트 동기화 표시.
 * 시트를 고친 뒤 “지금 불러오기”로 바로 반영하거나, 자동 반영 상태를 확인합니다.
 */
export default function SheetSyncBadge({
  lastSyncedAt,
  refreshing,
  onRefresh,
  intervalSeconds = 60,
}: Props) {
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 15000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      <span
        title={
          intervalSeconds > 0
            ? `구글시트를 ${intervalSeconds}초마다 자동으로 다시 읽습니다.`
            : '자동 동기화가 꺼져 있습니다.'
        }
        className="hidden items-center gap-1.5 whitespace-nowrap rounded-full border border-background-200 bg-background-100 px-2.5 py-1 text-[10.5px] text-foreground-600 sm:inline-flex"
      >
        <span
          className={`flex h-3 w-3 items-center justify-center text-[11px] ${
            refreshing ? 'text-primary-600' : 'text-secondary-700'
          }`}
        >
          <i className={refreshing ? 'ri-loader-4-line animate-spin' : 'ri-database-2-line'}></i>
        </span>
        시트 {refreshing ? '확인 중' : relativeLabel(lastSyncedAt)}
      </span>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        title="구글시트에서 지금 바로 다시 불러옵니다"
        className="inline-flex cursor-pointer items-center gap-1 whitespace-nowrap rounded-md border border-background-300 bg-background-50 px-2.5 py-1.5 text-[11px] text-foreground-700 transition-colors hover:border-foreground-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <span className="flex h-3.5 w-3.5 items-center justify-center text-[12px]">
          <i className={refreshing ? 'ri-loader-4-line animate-spin' : 'ri-refresh-line'}></i>
        </span>
        지금 불러오기
      </button>
    </div>
  );
}