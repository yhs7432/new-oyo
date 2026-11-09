import { useEffect, useMemo, useState } from 'react';
import AdminLogin from '@/pages/admin/components/AdminLogin';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import DashboardPanel from '@/pages/admin/components/DashboardPanel';
import InventoryPanel from '@/pages/admin/components/InventoryPanel';
import RegisterPanel from '@/pages/admin/components/RegisterPanel';
import StagePanel from '@/pages/admin/components/StagePanel';
import SheetPanel from '@/pages/admin/components/SheetPanel';
import PartnerPanel from '@/pages/admin/components/PartnerPanel';
import { useAdminAuth } from '@/pages/admin/hooks/useAdminAuth';
import { useCatalogue } from '@/hooks/useCatalogue';
import type { AdminTab } from '@/config/admin';
import { firstTabForRole, tabsForRole } from '@/config/admin';

export default function AdminPage() {
  const { identity, loading: authLoading, signIn, signUp, signOut } = useAdminAuth();
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const {
    items,
    loading: catalogueLoading,
    refreshing,
    lastSyncedAt,
    error,
    reload,
  } = useCatalogue({
    enabled: Boolean(identity),
    intervalMs: 60 * 1000,
  });

  const role = identity?.role;

  useEffect(() => {
    if (role) setTab(firstTabForRole(role));
  }, [role]);

  const allowed = useMemo(
    () => (identity ? tabsForRole(identity.role).map((item) => item.key) : []),
    [identity],
  );

  if (authLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background-100">
        <div className="flex items-center gap-2.5 text-[12.5px] text-foreground-600">
          <span className="flex h-5 w-5 items-center justify-center text-[15px]">
            <i className="ri-loader-4-line animate-spin"></i>
          </span>
          계정 확인 중…
        </div>
      </div>
    );
  }

  if (!identity) {
    return <AdminLogin onSignIn={signIn} onSignUp={signUp} />;
  }

  const activeTab: AdminTab = allowed.includes(tab) ? tab : firstTabForRole(identity.role);

  const renderPanel = () => {
    switch (activeTab) {
      case 'partner':
        return (
          <PartnerPanel items={items} loading={catalogueLoading} error={error} onRetry={reload} />
        );
      case 'register':
        return <RegisterPanel items={items} onSaved={reload} />;
      case 'dispatch':
      case 'receive':
      case 'sale':
      case 'audit':
      case 'history':
        return (
          <StagePanel
            stage={activeTab}
            items={items}
            loading={catalogueLoading}
            identity={identity}
            onSaved={reload}
          />
        );
      case 'stock':
        return (
          <InventoryPanel
            items={items}
            loading={catalogueLoading}
            error={error}
            onRetry={reload}
          />
        );
      case 'sheet':
        return (
          <SheetPanel
            items={items}
            loading={catalogueLoading}
            error={error}
            onRetry={reload}
            staffName={identity.name}
          />
        );
      default:
        return (
          <DashboardPanel
            items={items}
            loading={catalogueLoading}
            error={error}
            onRetry={reload}
            onTab={setTab}
          />
        );
    }
  };

  return (
    <AdminLayout
      tab={activeTab}
      identity={identity}
      onTab={setTab}
      onLogout={signOut}
      onRefresh={reload}
      refreshing={refreshing}
      lastSyncedAt={lastSyncedAt}
      total={items.length}
    >
      {renderPanel()}
    </AdminLayout>
  );
}