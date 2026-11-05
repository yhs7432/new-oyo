import { useCallback, useEffect, useState } from 'react';
import { APPS_SCRIPT_CODE, APPS_SCRIPT_STEPS } from '@/pages/admin/appsScript';
import { clearScriptUrl, getScriptUrl, saveScriptUrl, testScriptUrl } from '@/services/sheetWrite';

type TestState =
  | { kind: 'idle' }
  | { kind: 'checking' }
  | { kind: 'ok'; sheet?: string; rows?: number }
  | { kind: 'fail'; message: string };

export default function SheetConnectionCard() {
  const [url, setUrl] = useState(getScriptUrl);
  const [status, setStatus] = useState<'idle' | 'saved' | 'invalid' | 'removed'>('idle');
  const [copied, setCopied] = useState(false);
  const [test, setTest] = useState<TestState>({ kind: 'idle' });

  const connected = url.trim().length > 0;

  const runTest = useCallback(async (target?: string) => {
    setTest({ kind: 'checking' });
    const result = await testScriptUrl(target);
    if (result.ok) {
      setTest({ kind: 'ok', sheet: result.sheet, rows: result.rows });
    } else {
      setTest({ kind: 'fail', message: result.message });
    }
  }, []);

  useEffect(() => {
    if (connected) void runTest(getScriptUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    if (saveScriptUrl(url)) {
      const saved = getScriptUrl();
      setUrl(saved);
      setStatus('saved');
      await runTest(saved);
    } else {
      setStatus('invalid');
      setTest({ kind: 'idle' });
    }
  };

  const disconnect = () => {
    clearScriptUrl();
    setUrl('');
    setStatus('removed');
    setTest({ kind: 'idle' });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(APPS_SCRIPT_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mt-5 rounded-lg border border-background-200 bg-background-50">
      <div className="flex flex-col justify-between gap-2 border-b border-background-200 px-4 py-3.5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-[12.5px] font-medium text-foreground-900">관리자 → 시트 쓰기 연결</h2>
          <p className="mt-1 max-w-xl text-[11px] leading-relaxed text-foreground-600">
            이 연결을 하면 관리자 화면의 등록·수정이 실제 구글시트에 저장되고, 저장된 값이 홈페이지에
            그대로 나타납니다. 구글 인증 정보는 브라우저에 저장되지 않습니다.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] ${
              connected ? 'bg-secondary-100 text-secondary-900' : 'bg-accent-100 text-accent-900'
            }`}
          >
            <i className={connected ? 'ri-link' : 'ri-link-unlink'}></i>
            {connected ? '주소 저장됨' : '미연결'}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] ${
              test.kind === 'ok'
                ? 'bg-primary-100 text-primary-700'
                : test.kind === 'fail'
                  ? 'bg-accent-100 text-accent-900'
                  : 'bg-background-200 text-foreground-600'
            }`}
          >
            <i
              className={
                test.kind === 'checking'
                  ? 'ri-loader-4-line animate-spin'
                  : test.kind === 'ok'
                    ? 'ri-checkbox-circle-line'
                    : test.kind === 'fail'
                      ? 'ri-error-warning-line'
                      : 'ri-question-line'
              }
            ></i>
            {test.kind === 'checking' && '확인 중'}
            {test.kind === 'ok' && '연결 정상'}
            {test.kind === 'fail' && '응답 없음'}
            {test.kind === 'idle' && '확인 전'}
          </span>
        </div>
      </div>

      <div className="px-4 py-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
          <div>
            <label className="block min-w-0">
              <span className="mb-1.5 block text-[10px] uppercase tracking-[0.16em] text-foreground-500">
                Apps Script 웹 앱 주소 (…/exec)
              </span>
              <input
                value={url}
                onChange={(event) => {
                  setUrl(event.target.value);
                  setStatus('idle');
                }}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors placeholder:text-foreground-500 focus:border-primary-500"
              />
            </label>

            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={connect}
                className="cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 px-4 py-2 text-[12px] font-medium text-background-50 transition-colors hover:bg-foreground-800"
              >
                연결 저장
              </button>
              <button
                type="button"
                onClick={() => void runTest(url)}
                disabled={test.kind === 'checking'}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-secondary-300 bg-secondary-50 px-3.5 py-2 text-[12px] text-secondary-900 transition-colors hover:bg-secondary-100 disabled:cursor-default disabled:opacity-70"
              >
                <i className={test.kind === 'checking' ? 'ri-loader-4-line animate-spin' : 'ri-pulse-line'}></i>
                연결 확인
              </button>
              <button
                type="button"
                onClick={copy}
                className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border border-background-300 px-3.5 py-2 text-[12px] text-foreground-700 transition-colors hover:border-foreground-400"
              >
                <i className={copied ? 'ri-check-line' : 'ri-file-copy-line'}></i>
                {copied ? '복사됨' : '스크립트 코드 복사'}
              </button>
              {connected && (
                <button
                  type="button"
                  onClick={disconnect}
                  className="cursor-pointer whitespace-nowrap rounded-md px-2.5 py-2 text-[11.5px] text-foreground-500 transition-colors hover:text-accent-700"
                >
                  연결 해제
                </button>
              )}
            </div>

            {test.kind === 'ok' && (
              <p className="mt-2.5 rounded-md border border-secondary-300/70 bg-secondary-50 px-3 py-2 text-[11px] leading-relaxed text-secondary-900">
                연결이 확인되었습니다. 시트 <strong className="font-medium">{test.sheet ?? '기본 시트'}</strong>
                {' · '}상품 {test.rows ?? 0}행. 이제 관리자에서 등록·수정하면 시트에 바로 기록됩니다.
              </p>
            )}
            {test.kind === 'fail' && (
              <p className="mt-2.5 rounded-md border border-accent-300/70 bg-accent-50 px-3 py-2 text-[11px] leading-relaxed text-accent-900">
                {test.message}
                <span className="mt-1 block text-accent-800/80">
                  이미 배포한 스크립트라면, 아래 코드를 다시 붙여 넣고 “새 배포”로 한 번 더 배포해 주세요.
                </span>
              </p>
            )}

            {status !== 'idle' && (
              <p
                className={`mt-2.5 rounded-md px-3 py-2 text-[11px] leading-relaxed ${
                  status === 'invalid'
                    ? 'border border-accent-300/70 bg-accent-50 text-accent-900'
                    : 'border border-secondary-300/70 bg-secondary-50 text-secondary-900'
                }`}
              >
                {status === 'saved' && '연결 주소를 저장했습니다. 이제 등록·수정이 시트에 기록됩니다.'}
                {status === 'invalid' && '주소 형식이 올바르지 않습니다. …/exec 로 끝나는 주소를 넣어 주세요.'}
                {status === 'removed' && '연결을 해제했습니다.'}
              </p>
            )}

            <p className="mt-3 rounded-md bg-background-100 px-3 py-2.5 text-[10.5px] leading-relaxed text-foreground-600">
              이 주소는 시트에 값을 쓸 수 있는 열쇠입니다. 외부에 공유하거나 게시하지 마세요.
              직원별로는 시트 공유 권한으로 접근을 나누시면 됩니다.
            </p>
          </div>

          <ol className="flex flex-col gap-2.5 rounded-md border border-background-200 bg-background-100/60 p-3.5">
            {APPS_SCRIPT_STEPS.map((step, index) => (
              <li key={step} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[10.5px] font-medium text-secondary-900">
                  {index + 1}
                </span>
                <span className="text-[11px] leading-relaxed text-foreground-700">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <details className="mt-4 rounded-md border border-background-200 bg-background-100/60">
          <summary className="cursor-pointer px-3.5 py-2.5 text-[11.5px] text-foreground-700">
            붙여 넣을 스크립트 코드 보기
          </summary>
          <pre className="max-h-72 overflow-auto border-t border-background-200 px-3.5 py-3 text-[10.5px] leading-relaxed text-foreground-700">
            {APPS_SCRIPT_CODE}
          </pre>
        </details>
      </div>
    </section>
  );
}