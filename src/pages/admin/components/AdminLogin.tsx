import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ADMIN_UI_VERSION, roleFromCode } from '@/config/admin';
import type { AuthResult, SignInPayload, SignUpPayload } from '@/pages/admin/hooks/useAdminAuth';

interface Props {
  onSignIn: (payload: SignInPayload) => Promise<AuthResult>;
  onSignUp: (payload: SignUpPayload) => Promise<AuthResult>;
}

type Mode = 'signin' | 'signup';

const inputClass =
  'w-full box-border rounded-md border border-background-300 bg-background-100 px-3 py-2 text-sm text-foreground-900 outline-none transition-colors focus:border-primary-500';

const labelClass = 'mb-1.5 block text-[10px] uppercase tracking-[0.18em] text-foreground-500';

export default function AdminLogin({ onSignIn, onSignUp }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [showCode, setShowCode] = useState(false);

  const passwordFilled = password.length > 0;
  const confirmFilled = password2.length > 0;
  const passwordMatch = passwordFilled && confirmFilled && password === password2;
  const passwordMismatch = confirmFilled && password !== password2;

  const switchMode = (next: Mode) => {
    setMode(next);
    setError('');
    setNotice('');
    setPassword('');
    setPassword2('');
    setShowPassword(false);
    setShowPassword2(false);
    setShowCode(false);
  };

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 모두 입력해 주세요.');
      return;
    }
    setBusy(true);
    const result = await onSignIn({ email, password });
    setBusy(false);
    if (!result.ok) setError(result.message ?? '로그인하지 못했습니다.');
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setNotice('');

    if (!name.trim()) {
      setError('이름을 입력해 주세요.');
      return;
    }
    if (!email.trim()) {
      setError('이메일을 입력해 주세요.');
      return;
    }
    if (password.length < 8) {
      setError('비밀번호는 8자 이상으로 정해 주세요.');
      return;
    }
    if (password !== password2) {
      setError('비밀번호가 서로 다릅니다. 다시 확인해 주세요.');
      return;
    }
    const matchedRole = roleFromCode(code);
    if (!matchedRole) {
      setError('가입 코드가 맞지 않습니다. 담당자에게 받은 4자리 코드를 확인해 주세요.');
      return;
    }

    setBusy(true);
    const result = await onSignUp({ email, password, name, role: matchedRole });
    setBusy(false);

    if (!result.ok) {
      setError(result.message ?? '가입하지 못했습니다.');
      return;
    }
    if (result.needsConfirm) {
      setMode('signin');
      setNotice(result.message ?? '확인 메일을 보냈습니다. 메일의 링크를 누른 뒤 로그인해 주세요.');
      setPassword('');
      setPassword2('');
      setCode('');
      return;
    }
    setNotice('가입이 완료되었습니다. 잠시 후 화면이 열립니다.');
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-foreground-950 px-5 py-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-primary-500/10 blur-3xl"></div>
        <div className="absolute -right-24 bottom-0 h-[380px] w-[380px] rounded-full bg-accent-500/10 blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-[440px] fade-up">
        <div className="mb-7 text-center">
          <strong className="block font-heading text-[23px] tracking-[0.06em] text-background-50">
            OYO GOLF
          </strong>
          <span className="mt-1.5 block text-[9px] uppercase tracking-[0.3em] text-primary-400">
            Wholesale Partner Center
          </span>
        </div>

        <div className="rounded-lg border border-background-50/10 bg-background-50 p-7">
          <div className="mb-5 flex rounded-full bg-background-100 p-1">
            {(['signin', 'signup'] as Mode[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => switchMode(item)}
                className={`flex-1 cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] transition-colors ${
                  mode === item
                    ? 'bg-foreground-950 font-medium text-background-50'
                    : 'text-foreground-600 hover:text-foreground-900'
                }`}
              >
                {item === 'signin' ? '로그인' : '회원가입'}
              </button>
            ))}
          </div>

          {mode === 'signin' ? (
            <form onSubmit={handleSignIn}>
              <h1 className="font-heading text-lg text-foreground-950">도매 파트너 로그인</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">
                도매가 확인과 주문을 위해 로그인해 주세요.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <label className="block min-w-0">
                  <span className={labelClass}>이메일</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    className={inputClass}
                  />
                </label>

                <label className="block min-w-0">
                  <span className={labelClass}>비밀번호</span>
                  <span className="relative block">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••"
                      className={`${inputClass} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label="비밀번호 표시 전환"
                      className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[14px] text-foreground-500 transition-colors hover:text-foreground-900"
                    >
                      <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                    </button>
                  </span>
                </label>
              </div>

              {error && (
                <p className="mt-3 rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-[11.5px] leading-relaxed text-accent-800">
                  {error}
                </p>
              )}
              {notice && (
                <p className="mt-3 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-2 text-[11.5px] leading-relaxed text-secondary-900">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-5 w-full cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 py-2.5 text-[13px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? '확인 중…' : '로그인'}
              </button>

              <p className="mt-3.5 text-center text-[11.5px] text-foreground-500">
                아직 계정이 없으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signup')}
                  className="cursor-pointer font-medium text-foreground-900 underline decoration-primary-400 underline-offset-2"
                >
                  회원가입
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignUp}>
              <h1 className="font-heading text-lg text-foreground-950">도매 파트너 가입</h1>
              <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">
                담당자에게 받은 가입 코드를 입력하시면 됩니다.
              </p>

              <div className="mt-5 flex flex-col gap-3">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="block min-w-0 flex-1">
                    <span className={labelClass}>담당자 이름</span>
                    <input
                      name="name"
                      required
                      maxLength={40}
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder="홍길동"
                      className={inputClass}
                    />
                  </label>
                  <label className="block min-w-0 flex-1">
                    <span className={labelClass}>가입 코드 (4자리)</span>
                    <span className="relative block">
                      <input
                        type={showCode ? 'text' : 'password'}
                        name="invite_code"
                        inputMode="numeric"
                        maxLength={4}
                        required
                        value={code}
                        onChange={(event) =>
                          setCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 4))
                        }
                        placeholder="••••"
                        className={`${inputClass} pr-10 tracking-[0.4em]`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCode((prev) => !prev)}
                        aria-label="가입 코드 표시 전환"
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[14px] text-foreground-500 transition-colors hover:text-foreground-900"
                      >
                        <i className={showCode ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </button>
                    </span>
                  </label>
                </div>

                <p className="rounded-md bg-background-100 px-3 py-2 text-[11px] leading-relaxed text-foreground-600">
                  <i className="ri-shield-keyhole-line mr-1"></i>
                  가입 코드로 계정 등급이 정해집니다. 파트너 코드로 가입하면 도매 카탈로그 화면이
                  열립니다.
                </p>

                <label className="block min-w-0">
                  <span className={labelClass}>이메일</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@company.com"
                    className={inputClass}
                  />
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="block min-w-0 flex-1">
                    <span className={labelClass}>비밀번호 (8자 이상)</span>
                    <span className="relative block">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pr-10`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label="비밀번호 표시 전환"
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[14px] text-foreground-500 transition-colors hover:text-foreground-900"
                      >
                        <i className={showPassword ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </button>
                    </span>
                  </label>
                  <label className="block min-w-0 flex-1">
                    <span className={labelClass}>비밀번호 확인</span>
                    <span className="relative block">
                      <input
                        type={showPassword2 ? 'text' : 'password'}
                        name="password_confirm"
                        autoComplete="new-password"
                        required
                        value={password2}
                        onChange={(event) => setPassword2(event.target.value)}
                        placeholder="••••••••"
                        className={`${inputClass} pr-10 ${
                          passwordMatch
                            ? 'border-emerald-500 focus:border-emerald-500'
                            : passwordMismatch
                              ? 'border-accent-400'
                              : ''
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword2((prev) => !prev)}
                        aria-label="비밀번호 확인 표시 전환"
                        className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-[14px] text-foreground-500 transition-colors hover:text-foreground-900"
                      >
                        <i className={showPassword2 ? 'ri-eye-off-line' : 'ri-eye-line'}></i>
                      </button>
                    </span>
                    {passwordMatch && (
                      <span className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                        <i className="ri-check-line"></i>
                        비밀번호가 일치합니다
                      </span>
                    )}
                    {passwordMismatch && (
                      <span className="mt-1.5 flex items-center gap-1 text-[11px] text-accent-700">
                        <i className="ri-error-warning-line"></i>
                        두 비밀번호가 아직 다릅니다
                      </span>
                    )}
                  </label>
                </div>
                {passwordFilled && password.length < 8 && (
                  <span className="flex items-center gap-1 text-[11px] text-foreground-500">
                    <i className="ri-information-line"></i>
                    비밀번호는 8자 이상이어야 합니다
                  </span>
                )}
              </div>

              {error && (
                <p className="mt-3 rounded-md border border-accent-300 bg-accent-50 px-3 py-2 text-[11.5px] leading-relaxed text-accent-800">
                  {error}
                </p>
              )}
              {notice && (
                <p className="mt-3 rounded-md border border-secondary-200 bg-secondary-50 px-3 py-2 text-[11.5px] leading-relaxed text-secondary-900">
                  {notice}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="mt-5 w-full cursor-pointer whitespace-nowrap rounded-md bg-foreground-950 py-2.5 text-[13px] font-medium text-background-50 transition-colors hover:bg-foreground-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy ? '가입 중…' : '가입하고 시작하기'}
              </button>

              <p className="mt-3.5 text-center text-[11.5px] text-foreground-500">
                이미 계정이 있으신가요?{' '}
                <button
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="cursor-pointer font-medium text-foreground-900 underline decoration-primary-400 underline-offset-2"
                >
                  로그인
                </button>
              </p>
            </form>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 text-[12px]">
          <Link
            to="/"
            className="inline-flex cursor-pointer items-center gap-1.5 text-background-300 transition-colors hover:text-primary-400"
          >
            <i className="ri-arrow-left-line"></i>
            사이트로
          </Link>
          <p className="rounded-full bg-background-50/10 px-3 py-1 text-[9.5px] uppercase tracking-[0.16em] text-background-400">
            화면 버전 {ADMIN_UI_VERSION}
          </p>
        </div>
      </div>
    </div>
  );
}