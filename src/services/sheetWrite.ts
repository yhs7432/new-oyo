/**
 * Admin → Google Sheet write channel.
 *
 * The browser never holds a Google credential. Instead the spreadsheet runs a
 * small Apps Script web app (see `appsScript.ts`) that performs the actual write,
 * and the admin console only knows that deployment URL.
 */

import { invalidateCatalogue } from '@/services/catalogue';

const SCRIPT_URL_KEY = 'oyogolf.admin.scriptUrl';
const SCRIPT_TOKEN = 'oyogolf-sheet-2026';

export interface SheetWriteResult {
  ok: boolean;
  sent: boolean;
  message: string;
}

export function getScriptUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.localStorage.getItem(SCRIPT_URL_KEY)?.trim() ?? '';
}

export function saveScriptUrl(url: string): boolean {
  const value = url.trim();
  if (!/^https:\/\/script\.google(usercontent)?\.com\//i.test(value)) return false;
  window.localStorage.setItem(SCRIPT_URL_KEY, value);
  return true;
}

export function clearScriptUrl(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(SCRIPT_URL_KEY);
}

export function isWriterReady(): boolean {
  return getScriptUrl().length > 0;
}

export interface SheetTestResult {
  ok: boolean;
  sheet?: string;
  rows?: number;
  message: string;
}

/**
 * Verifies that the pasted Apps Script URL actually answers.
 * Apps Script responses carry no CORS headers, so a normal fetch cannot read
 * them; the deployment is pinged with a JSONP callback instead.
 */
export function testScriptUrl(rawUrl?: string): Promise<SheetTestResult> {
  const url = (rawUrl ?? getScriptUrl()).trim();
  if (!/^https:\/\/script\.google(usercontent)?\.com\//i.test(url)) {
    return Promise.resolve({
      ok: false,
      message: '주소 형식이 올바르지 않습니다. …/exec 로 끝나는 주소를 넣어 주세요.',
    });
  }
  if (typeof document === 'undefined') {
    return Promise.resolve({ ok: false, message: '브라우저에서만 확인할 수 있습니다.' });
  }

  return new Promise<SheetTestResult>((resolve) => {
    const globalWindow = window as unknown as Record<string, unknown>;
    const callbackName = `oyoSchemaPing_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const script = document.createElement('script');
    let settled = false;

    const finish = (result: SheetTestResult) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.onerror = null;
      script.remove();
      delete globalWindow[callbackName];
      resolve(result);
    };

    const timer = window.setTimeout(() => {
      finish({
        ok: false,
        message: '응답이 없습니다. 웹 앱 배포 상태와 주소를 다시 확인해 주세요.',
      });
    }, 12000);

    globalWindow[callbackName] = (payload: { ok?: boolean; sheet?: string; rows?: number; message?: string }) => {
      if (payload && payload.ok) {
        finish({
          ok: true,
          sheet: payload.sheet,
          rows: payload.rows,
          message: '시트에 연결되었습니다.',
        });
        return;
      }
      finish({
        ok: false,
        message: payload?.message ?? '시트가 응답했지만 연결되지 않았습니다.',
      });
    };

    script.onerror = () => {
      finish({
        ok: false,
        message: '스크립트를 불러오지 못했습니다. “모든 사용자” 액세스로 다시 배포해 주세요.',
      });
    };

    script.src = `${url}${url.includes('?') ? '&' : '?'}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function makeRequestId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

async function send(payload: Record<string, unknown>): Promise<SheetWriteResult> {
  const url = getScriptUrl();
  if (!url) {
    return {
      ok: false,
      sent: false,
      message: '관리자 → 시트 연결이 아직 설정되지 않았습니다. “시트 연동” 화면에서 연결해 주세요.',
    };
  }

  const body = JSON.stringify({ token: SCRIPT_TOKEN, requestId: makeRequestId(), ...payload });

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body,
    });
    const text = await response.text();

    let parsed: { ok?: boolean; message?: string } | null = null;
    try {
      parsed = JSON.parse(text) as { ok?: boolean; message?: string };
    } catch {
      parsed = null;
    }

    if (parsed && parsed.ok === false) {
      return { ok: false, sent: true, message: parsed.message ?? '시트가 요청을 거부했습니다.' };
    }
    if (!response.ok) {
      return { ok: false, sent: true, message: `시트 응답 오류 (${response.status})` };
    }
    invalidateCatalogue();
    return { ok: true, sent: true, message: parsed?.message ?? '시트에 저장했습니다.' };
  } catch {
    // Apps Script does not always answer with CORS headers; the write still lands.
    try {
      await fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body,
      });
      invalidateCatalogue();
      return {
        ok: true,
        sent: true,
        message: '시트로 전송했습니다. 구글 반영까지 10~30초 걸릴 수 있습니다.',
      };
    } catch {
      return {
        ok: false,
        sent: false,
        message: '시트로 전송하지 못했습니다. 시트 연동 주소를 확인해 주세요.',
      };
    }
  }
}

export function updateSheetRows(
  rows: { id: string; fields: Record<string, string | number> }[],
): Promise<SheetWriteResult> {
  return send({ action: 'update', rows });
}

export function createSheetRow(
  values: Record<string, string | number>,
): Promise<SheetWriteResult> {
  return send({ action: 'create', values });
}

export function deleteSheetRows(
  rows: { id: string; name?: string }[],
): Promise<SheetWriteResult> {
  return send({
    action: 'delete',
    rows: rows.map((row) => ({ id: row.id, name: row.name ?? '' })),
  });
}

export function appendSheetLog(
  entry: Record<string, string | number>,
): Promise<SheetWriteResult> {
  return send({ action: 'log', entry });
}

/** Sends one sold product to the '판매 완료' archive tab of the spreadsheet. */
export function archiveSaleEntry(
  entry: Record<string, string | number>,
): Promise<SheetWriteResult> {
  return send({ action: 'archive', entry });
}

export const SHEET_CONNECTION_STORAGE_KEY = SCRIPT_URL_KEY;