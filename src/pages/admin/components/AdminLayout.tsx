import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AdminIdentity, AdminTab } from '@/config/admin';
import { ADMIN_TABS, ADMIN_UI_VERSION, ROLE_LABEL, isInternalRole, tabsForRole } from '@/config/admin';
import SheetSyncBadge from '@/pages/admin/components/SheetSyncBadge';
import FxRateControl from '@/pages/admin/components/FxRateControl';

interface Props {
  tab: AdminTab;
  identity: AdminIdentity;
  onTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  lastSyncedAt: number | null;
  total: number;
  children: ReactNode;
}

export default function AdminLayout({
  tab,
  identity,
  onTab,
  onLogout,
  onRefresh,
  refreshing,
  lastSyncedAt,
  total,
  children,
}: Props) {
  const tabs = tabsForRole(identity.role);
  const active = ADMIN_TABS.find((item) => item.key === tab);
  const internal = isInternalRole(identity.role);

  return (
    <div className="min-h-screen w-full bg-background-100">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-60 flex-col border-r border-background-50/10 bg-foreground-950 lg:flex">
        <div className="border-b border-background-50/10 px-5 py-5">
          <strong className="block font-heading text-[16px] tracking-[0.05em] text-background-50">
            OYO GOLF
          </strong>
          <span className="mt-1 block text-[8px] uppercase tracking-[0.24em] text-primary-400">
            Korea → Thailand Wholesale
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4">
          <p className="px-3 pb-2 text-[9px] uppercase tracking-[0.24em] text-background-500">
            {internal ? 'Operations' : 'Wholesale'}
          </p>
          <div className="flex flex-col gap-0.5">
            {tabs.map((item) => {
              const isActive = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTab(item.key)}
                  className={`flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-[12.5px] transition-colors ${
                    isActive
                      ? 'bg-primary-500 font-medium text-foreground-950'
                      : 'text-background-300 hover:bg-background-50/10 hover:text-background-50'
                  }`}
                >
                  <span className="flex h-4 w-4 items-center justify-center text-[14px]">
                    <i className={item.icon}></i>
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>

          <Link
            to="/"
            className="mt-5 flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-[12px] text-background-400 transition-colors hover:text-background-50"
          >
            <span className="flex h-4 w-4 items-center justify-center text-[14px]">
              <i className="ri-external-link-line"></i>
            </span>
            {internal ? '도매몰로 이동' : '홈페이지로 이동'}
          </Link>
        </nav>

        <div className="border-t border-background-50/10 px-3 py-3.5">
          <div className="rounded-md bg-background-50/5 px-3 py-2.5">
            <p className="truncate text-[12px] font-medium text-background-50">{identity.name}</p>
            <p className="mt-0.5 text-[10.5px] text-primary-400">{ROLE_LABEL[identity.role]}</p>
          </div>
          <p className="mt-2 px-3 text-[9.5px] uppercase tracking-[0.14em] text-background-500">
            화면 버전 {ADMIN_UI_VERSION}
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-[12px] text-background-300 transition-colors hover:bg-background-50/10 hover:text-background-50"
          >
            <span className="flex h-4 w-4 items-center justify-center text-[14px]">
              <i className="ri-logout-box-r-line"></i>
            </span>
            로그아웃
          </button>
        </div>
      </aside>

      <div className="lg:pl-60">
        <header className="sticky top-0 z-30 border-b border-background-200 bg-background-50/95 backdrop-blur">
          <div className="flex h-14 items-center justify-between gap-4 px-4 md:px-7">
            <div className="flex min-w-0 items-center gap-2.5">
              <Link to="/" className="cursor-pointer font-heading text-[15px] text-foreground-950 lg:hidden">
                OYO GOLF
              </Link>
              <span className="hidden font-heading text-[15px] text-foreground-950 lg:block">
                {active?.label ?? '파트너 센터'}
              </span>
              <span className="hidden rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10.5px] font-medium text-secondary-900 xl:inline">
                {internal ? '운영 콘솔' : '도매 파트너'} · {total.toLocaleString('en-US')}개
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden lg:block">
                <FxRateControl caption={false} />
              </div>
              <SheetSyncBadge
                lastSyncedAt={lastSyncedAt}
                refreshing={refreshing}
                onRefresh={onRefresh}
                intervalSeconds={60}
              />
              <span className="hidden whitespace-nowrap text-[11.5px] text-foreground-500 xl:inline">
                {identity.name} · {ROLE_LABEL[identity.role]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="cursor-pointer whitespace-nowrap rounded-md border border-foreground-900 px-3 py-1.5 text-[11.5px] text-foreground-900 transition-colors hover:bg-foreground-900 hover:text-background-50"
              >
                로그아웃
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-background-200 px-4 py-1.5 md:px-7 lg:hidden">
            <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-foreground-500">
              <span className="flex h-3.5 w-3.5 items-center justify-center text-[11px]">
                <i className="ri-exchange-dollar-line"></i>
              </span>
              정산 환율
            </p>
            <FxRateControl />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 px-4 pb-2.5 pt-0.5 lg:hidden">
            {tabs.map((item) => {
              const isActive = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTab(item.key)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex shrink-0 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-[5px] text-[12px] leading-none transition-colors ${
                    isActive
                      ? 'bg-foreground-900 font-medium text-background-50'
                      : 'border border-background-300 bg-background-50 text-foreground-700'
                  }`}
                >
                  <span className="flex h-3.5 w-3.5 items-center justify-center text-[12.5px]">
                    <i className={item.icon}></i>
                  </span>
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-7 md:py-8">{children}</main>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 text-[11px] leading-relaxed text-foreground-500 md:px-7">
          {internal
            ? 'OYO GOLF 운영 콘솔 · 재고·가격 데이터는 구글시트에서 읽어 오고, 여기서 저장한 내용은 같은 시트에 기록됩니다. 시트에서 직접 고친 내용도 60초 안에 이 화면과 홈페이지에 자동 반영됩니다.'
            : 'OYO GOLF 도매 파트너 전용 화면 · 도매가는 판매가 기준으로 계산되며, 매입 원가와 내부 재고 수치는 표시되지 않습니다.'}
        </footer>
      </div>
    </div>
  );
}