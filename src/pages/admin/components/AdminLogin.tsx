import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { AdminIdentity, AdminRole } from '@/config/admin';
import { ROLE_LABEL, ROLE_OPTIONS } from '@/config/admin';

const ROLE_HINT: Record<AdminRole, string> = {
  owner: '모든 메뉴와 시트 편집',
  manager: '전체 운영 메뉴',
  kr_staff: '상품 등록 · 한국 출고 · 재고',
  th_staff: '태국 입고 · 판매 · 재고',
  partner: '도매 카탈로그 조회 전용 (원가 비공개)',
};

interface Props {
  onSubmit: (pin: string, identity: AdminIdentity, remember: boolean) => boolean;
}

export default function AdminLogin({ onSubmit }: Props) {
  const [step, setStep] = useState<'identity' | 'pin'>('identity');
  const [name, setName] = useState('');
  const [role, setRole] = useState<AdminRole>('manager');
  const [pin, setPin] = useState('');
  const [remember, setRemember] = useState(true);
  const [failed, setFailed] = useState(false);

  const attempt = (value: string) => {
    const ok = onSubmit(value, { name: name.trim(), role }, remember);
    if (ok) return;
    setFailed(true);
    setPin('');
  };

  const press = (key: string) => {
    setFailed(false);
    if (key === 'clear') {
      setPin('');
      return;
    }
    if (key === 'back') {
      setPin((prev) => prev.slice(0, -1));
      return;
    }
    if (pin.length >= 4) return;
    const next = pin + key;
    setPin(next);
    if (next.length === 4) {
      window.setTimeout(() => attempt(next), 140);
    }
  };

  const handleIdentity = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) return;
    setStep('pin');
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-foreground-950 px-5 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-accent-500/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[420px] fade-up">
        <div className="mb-7 text-center">
          <strong className="block font-heading text-[23px] tracking-[0.06em] text-background-50">
            OYO GOLF
          </strong>
          <span className="mt-1.5 block text-[9px] uppercase tracking-[0.3em] text-primary-400">
            Korea → Thailand Admin
          </span>
        </div>

        <div className="rounded-lg border border-background-50/10 bg-background-50 p-7">
          {step === 'identity' ? (
            <form onSubmit={handleIdentity}>
              <h1 className="font-heading text-lg text-foreground-950">운영 관리자 로그인</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">
                내부 확인용 화면입니다. 실제 비밀번호를 입력하지 마세요.
              </p>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="block min-w-0 flex-1">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-foreground-500">
                    이름
                  </span>
                  <input
                    name="name"
                    required
                    maxLength={40}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="홍길동"
                    className="w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-500"
                  />
                </label>
                <label className="block min-w-0 flex-1">
                  <span className="mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-foreground-500">
                    권한
                  </span>
                  <select
                    name="role"
                    value={role}
                    onChange={(event) => setRole(event.target.value as AdminRole)}
                    className="w-full box-border cursor-pointer rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-500"
                  >
                    {ROLE_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {ROLE_LABEL[option]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <p className="mt-2.5 rounded-md bg-background-100 px-3 py-2 text-[11px] leading-relaxed text-foreground-600">
                <i className="ri-shield-keyhole-line mr-1"></i>
                {ROLE_LABEL[role]} · {ROLE_HINT[role]}
              </p>

              <p className="mt-3.5 text-[11px] leading-relaxed text-foreground-500">
                등급마다 전용 4자리 비밀번호가 따로 있습니다. 선택한 등급의 비밀번호로만 열립니다.
              </p>

              <button
                type="submit"
                className="mt-5 w-full cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 py-2.5 text-[13px] font-medium text-background-50 transition-colors hover:bg-foreground-800"
              >
                다음 단계
              </button>
            </form>
          ) : (
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="font-heading text-lg text-foreground-950">OYO GOLF 관리자 잠금</h1>
                  <p className="mt-1.5 text-[11.5px] leading-relaxed text-foreground-600">
                    {name} · {ROLE_LABEL[role]}
                  </p>
                </div>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-background-100 text-[15px] text-foreground-700">
                  <i className="ri-lock-2-line"></i>
                </span>
              </div>

              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  attempt(pin);
                }}
              >
                <div className="mt-5">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={4}
                    value={pin}
                    onChange={(event) => {
                      const next = event.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                      setFailed(false);
                      setPin(next);
                      if (next.length === 4) {
                        window.setTimeout(() => attempt(next), 140);
                      }
                    }}
                    aria-label="관리자 비밀번호 4자리"
                    placeholder="••••"
                    className={`w-full box-border rounded-md border bg-background-100 px-4 py-3 text-center text-xl tracking-[0.6em] outline-none transition-colors placeholder:tracking-[0.4em] placeholder:text-foreground-400 ${
                      failed ? 'border-accent-500 text-accent-700' : 'border-background-300'
                    }`}
                  />
                  <p
                    className={`mt-2 min-h-[16px] text-[11.5px] ${failed ? 'text-accent-700' : 'text-foreground-500'}`}
                  >
                    {failed
                      ? '이 등급의 비밀번호가 아닙니다. 다시 입력해 주세요.'
                      : '선택한 등급의 4자리 비밀번호를 입력해 주세요.'}
                  </p>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'].map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => press(key)}
                      className={`cursor-pointer rounded-md border py-2.5 text-center text-[14px] transition-colors ${
                        key === 'clear' || key === 'back'
                          ? 'border-background-300 bg-background-100 text-[11.5px] text-foreground-600 hover:bg-background-200'
                          : 'border-background-300 bg-background-50 text-foreground-900 hover:border-primary-500 hover:bg-primary-50'
                      }`}
                    >
                      {key === 'clear' ? '초기화' : key === 'back' ? '⌫' : key}
                    </button>
                  ))}
                </div>

                <label className="mt-4 flex cursor-pointer items-center gap-2 text-[12px] text-foreground-700">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                    className="h-3.5 w-3.5 cursor-pointer accent-primary-600"
                  />
                  이 기기에서 로그인 유지
                </label>

                <button
                  type="submit"
                  className="mt-5 w-full cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 py-2.5 text-[13px] font-medium text-background-50 transition-colors hover:bg-foreground-800"
                >
                  잠금 해제
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-center gap-4 text-[12px]">
          {step === 'pin' && (
            <button
              type="button"
              onClick={() => {
                setStep('identity');
                setPin('');
                setFailed(false);
              }}
              className="cursor-pointer text-background-300 transition-colors hover:text-primary-400"
            >
              이전
            </button>
          )}
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center gap-1.5 text-background-300 transition-colors hover:text-primary-400"
          >
            <i className="ri-arrow-left-line"></i>
            사이트로
          </Link>
        </div>
      </div>
    </div>
  );
}