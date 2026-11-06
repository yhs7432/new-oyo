/**
 * Admin console configuration.
 * The original site unlocks its admin screens in two steps
 * (name + role, then a 4-digit PIN), so the same pattern is reproduced here.
 */
export const ADMIN_SESSION_KEY = 'oyogolf.admin.session';
export const ADMIN_REMEMBER_KEY = 'oyogolf.admin.remember';
export const ADMIN_FX_KEY = 'oyogolf.admin.fx';

export const SHEET_EDIT_URL =
  'https://docs.google.com/spreadsheets/d/1iIvop4UcnSs7U_WJjvb2qLKeRWH9BbA9fb0FebsVgdw/edit#gid=1243559779';

export type AdminRole = 'owner' | 'manager' | 'kr_staff' | 'th_staff' | 'partner';

export interface AdminIdentity {
  name: string;
  role: AdminRole;
}

export const ROLE_LABEL: Record<AdminRole, string> = {
  owner: '최고 관리자',
  manager: '운영 관리자',
  kr_staff: '한국 직원',
  th_staff: '태국 직원',
  partner: '도매 파트너',
};

export const ROLE_OPTIONS: AdminRole[] = ['owner', 'manager', 'kr_staff', 'th_staff', 'partner'];

/**
 * Each grade has its own 4-digit key, so a wholesale partner cannot unlock
 * the owner screens just by picking the owner role in the first step.
 * Change the numbers here to rotate access.
 */
export const ROLE_PIN: Record<AdminRole, string> = {
  owner: '2580',
  manager: '2581',
  kr_staff: '2582',
  th_staff: '2583',
  partner: '2584',
};

/**
 * Sign-up codes decide the grade automatically, so the join form never asks
 * which role someone wants. Partners use the partner code only.
 */
export function roleFromCode(code: string): AdminRole | null {
  const value = code.trim();
  if (!value) return null;
  const match = (Object.keys(ROLE_PIN) as AdminRole[]).find((role) => ROLE_PIN[role] === value);
  return match ?? null;
}

/** Everything the internal console gates behind a login. */
export function isPartnerRole(role: AdminRole): boolean {
  return role === 'partner';
}

/** Grades that may see purchase cost (한국원가 KRW) and sheet write tools. */
export const INTERNAL_ROLES: AdminRole[] = ['owner', 'manager', 'kr_staff', 'th_staff'];

/** Wholesale price ratio applied to the listed THB price. */
export const WHOLESALE_RATE = 0.7;

export function isInternalRole(role: AdminRole): boolean {
  return INTERNAL_ROLES.includes(role);
}

/** Cost columns and sheet links are hidden from partners. */
export function canSeeCost(role: AdminRole): boolean {
  return isInternalRole(role);
}

export type AdminTab =
  | 'dashboard'
  | 'register'
  | 'dispatch'
  | 'receive'
  | 'stock'
  | 'sale'
  | 'audit'
  | 'history'
  | 'sheet'
  | 'partner';

export const ADMIN_TABS: { key: AdminTab; label: string; icon: string; roles: AdminRole[] }[] = [
  {
    key: 'dashboard',
    label: '처음 화면',
    icon: 'ri-dashboard-line',
    roles: ['owner', 'manager', 'kr_staff', 'th_staff'],
  },
  {
    key: 'register',
    label: '상품 등록',
    icon: 'ri-add-box-line',
    roles: ['owner', 'manager', 'kr_staff'],
  },
  {
    key: 'dispatch',
    label: '한국 출고',
    icon: 'ri-truck-line',
    roles: ['owner', 'manager', 'kr_staff'],
  },
  {
    key: 'receive',
    label: '태국 입고',
    icon: 'ri-inbox-archive-line',
    roles: ['owner', 'manager', 'th_staff'],
  },
  {
    key: 'stock',
    label: '현재 재고',
    icon: 'ri-archive-2-line',
    roles: ['owner', 'manager', 'kr_staff', 'th_staff'],
  },
  {
    key: 'sale',
    label: '판매·출고',
    icon: 'ri-shopping-bag-3-line',
    roles: ['owner', 'manager', 'th_staff', 'kr_staff'],
  },
  {
    key: 'audit',
    label: '재고실사',
    icon: 'ri-survey-line',
    roles: ['owner', 'manager'],
  },
  {
    key: 'history',
    label: '이력·증빙',
    icon: 'ri-file-history-line',
    roles: ['owner', 'manager'],
  },
  {
    key: 'sheet',
    label: '시트 연동',
    icon: 'ri-google-fill',
    roles: ['owner', 'manager', 'kr_staff', 'th_staff'],
  },
  {
    key: 'partner',
    label: '도매 카탈로그',
    icon: 'ri-price-tag-3-line',
    roles: ['partner'],
  },
];

export function tabsForRole(role: AdminRole) {
  return ADMIN_TABS.filter((tab) => tab.roles.includes(role));
}

export function firstTabForRole(role: AdminRole): AdminTab {
  return tabsForRole(role)[0]?.key ?? 'dashboard';
}