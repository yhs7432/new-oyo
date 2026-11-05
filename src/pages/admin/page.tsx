import { useCallback, useMemo, useState } from 'react';
import AdminLogin from '@/pages/admin/components/AdminLogin';
import AdminLayout from '@/pages/admin/components/AdminLayout';
import DashboardPanel from '@/pages/admin/components/DashboardPanel';
import InventoryPanel from '@/pages/admin/components/InventoryPanel';
import RegisterPanel from '@/pages/admin/components/RegisterPanel';
import StagePanel from '@/pages/admin/components/StagePanel';
import SheetPanel from '@/pages/admin/components/SheetPanel';
import PartnerPanel from '@/pages/admin/components/PartnerPanel';
import { useCatalogue } from '@/hooks/useCatalogue';
import type { AdminIdentity, AdminTab } from '@/config/admin';
import {
  ADMIN_REMEMBER_KEY,
  ADMIN_SESSION_KEY,
  ROLE_PIN,
  firstTabForRole,
  tabsForRole,
} from '@/config/admin';

function readSession(): AdminIdentity | null {
  if (typeof window === 'undefined') return null;
  const raw =
    window.sessionStorage.getItem(ADMIN_SESSION_KEY) ??
    window.localStorage.getItem(ADMIN_REMEMBER_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as AdminIdentity;
    if (!parsed?.name || !parsed?.role) return null;
    return parsed;
  } catch {
    return null;
  }
}

export default function AdminPage() {
  const [identity, setIdentity] = useState<AdminIdentity | null>(readSession);
  const [tab, setTab] = useState<AdminTab>('dashboard');
  const { items, loading, error, reload } = useCatalogue({ enabled: Boolean(identity) });

  const unlock = useCallback(
    (pin: string, next: AdminIdentity, remember: boolean) => {
      if (pin !== ROLE_PIN[next.role]) return false;
      const payload = JSON.stringify(next);
      window.sessionStorage.setItem(ADMIN_SESSION_KEY, payload);
      if (remember) window.localStorage.setItem(ADMIN_REMEMBER_KEY, payload);
      setIdentity(next);
      setTab(firstTabForRole(next.role));
      return true;
    },
    [],
  );

  const logout = useCallback(() => {
    window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
    window.localStorage.removeItem(ADMIN_REMEMBER_KEY);
    setIdentity(null);
  }, []);

  const allowed = useMemo(
    () => (identity ? tabsForRole(identity.role).map((item) => item.key) : []),
    [identity],
  );

  if (!identity) {
    return <AdminLogin onSubmit={unlock} />;
  }

  const activeTab: AdminTab = allowed.includes(tab) ? tab : firstTabForRole(identity.role);

  const renderPanel = () => {
    switch (activeTab) {
      case 'partner':
        return <PartnerPanel items={items} loading={loading} error={error} onRetry={reload} />;
      case 'register':
        return <RegisterPanel items={items} onSaved={reload} />;
      case 'dispatch':
      case 'receive':
      case 'sale':
      case 'audit':
      case 'history':
        return <StagePanel stage={activeTab} items={items} loading={loading} />;
      case 'stock':
        return (
          <InventoryPanel items={items} loading={loading} error={error} onRetry={reload} />
        );
      case 'sheet':
        return (
          <SheetPanel items={items} loading={loading} error={error} onRetry={reload} />
        );
      default:
        return (
          <DashboardPanel
            items={items}
            loading={loading}
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
      onLogout={logout}
      total={items.length}
    >
      {renderPanel()}
    </AdminLayout>
  );
}