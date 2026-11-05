import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { AdminIdentity, AdminTab } from '@/config/admin';
import { ADMIN_TABS, ROLE_LABEL, isInternalRole, tabsForRole } from '@/config/admin';

interface Props {
  tab: AdminTab;
  identity: AdminIdentity;
  onTab: (tab: AdminTab) => void;
  onLogout: () => void;
  total: number;
  children: ReactNode;
}

export default function AdminLayout({ tab, identity, onTab, onLogout, total, children }: Props) {
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
            Korea → Thailand Admin
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-2.5 py-4">
          <p className="px-3 pb-2 text-[9px] uppercase tracking-[0.24em] text-background-500">
            Operations
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
            도매몰로 이동
          </Link>
        </nav>

        <div className="border-t border-background-50/10 px-3 py-3.5">
          <div className="rounded-md bg-background-50/5 px-3 py-2.5">
            <p className="truncate text-[12px] font-medium text-background-50">{identity.name}</p>
            <p className="mt-0.5 text-[10.5px] text-primary-400">{ROLE_LABEL[identity.role]}</p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex w-full cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-[12px] text-background-300 transition-colors hover:bg-background-50/10 hover:text-background-50"
          >
            <span className="flex h-4 w-4 items-center justify-center text-[14px]">
              <i className="ri-lock-line"></i>
            </span>
            화면 잠금
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
                {active?.label ?? '관리자'}
              </span>
              <span className="hidden rounded-full bg-secondary-100 px-2.5 py-0.5 text-[10.5px] font-medium text-secondary-900 sm:inline">
                {internal ? '시트 연동' : '도매 카탈로그'} · {total.toLocaleString('en-US')}개
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden whitespace-nowrap text-[11.5px] text-foreground-500 md:inline">
                {identity.name} · {ROLE_LABEL[identity.role]}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="cursor-pointer whitespace-nowrap rounded-md border border-foreground-900 px-3 py-1.5 text-[11.5px] text-foreground-900 transition-colors hover:bg-foreground-900 hover:text-background-50"
              >
                화면 잠금
              </button>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto px-4 pb-2.5 lg:hidden">
            {tabs.map((item) => {
              const isActive = item.key === tab;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => onTab(item.key)}
                  className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11.5px] transition-colors ${
                    isActive
                      ? 'bg-foreground-900 text-background-50'
                      : 'border border-background-300 text-foreground-700'
                  }`}
                >
                  <i className={item.icon}></i>
                  {item.label}
                </button>
              );
            })}
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 md:px-7 md:py-8">{children}</main>

        <footer className="mx-auto w-full max-w-[1400px] px-4 pb-8 text-[11px] leading-relaxed text-foreground-500 md:px-7">
          {internal
            ? 'OYO GOLF 운영 관리자 · 재고·가격 데이터는 구글시트에서 읽어 오고, 여기서 저장한 내용은 같은 시트에 기록됩니다.'
            : 'OYO GOLF 도매 파트너 전용 화면 · 도매가는 판매가 기준으로 계산되며, 매입 원가와 주문 내역은 표시되지 않습니다.'}
        </footer>
      </div>
    </div>
  );
}