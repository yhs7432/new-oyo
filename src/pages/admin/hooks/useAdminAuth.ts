import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/services/supabase';
import type { AdminIdentity, AdminRole } from '@/config/admin';
import { ROLE_OPTIONS } from '@/config/admin';

export interface AdminUser extends AdminIdentity {
  id: string;
  email: string;
}

export interface AuthResult {
  ok: boolean;
  message?: string;
  /** Sign-up succeeded but the account still needs the email confirmation link. */
  needsConfirm?: boolean;
}

export interface SignInPayload {
  email: string;
  password: string;
}

export interface SignUpPayload extends SignInPayload {
  name: string;
  role: AdminRole;
}

function pickRole(value: unknown): AdminRole {
  return ROLE_OPTIONS.includes(value as AdminRole) ? (value as AdminRole) : 'partner';
}

function toAdminUser(user: User | null): AdminUser | null {
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const metaName = typeof meta.name === 'string' ? meta.name.trim() : '';
  const email = user.email ?? '';
  return {
    id: user.id,
    email,
    name: metaName || email.split('@')[0] || '관리자',
    role: pickRole(meta.role),
  };
}

function describeAuthError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('invalid login credentials')) return '이메일 또는 비밀번호가 맞지 않습니다.';
  if (text.includes('email not confirmed')) {
    return '이메일 확인이 아직 끝나지 않았습니다. 받은 편지함의 확인 링크를 먼저 눌러 주세요.';
  }
  if (text.includes('already registered') || text.includes('already been registered')) {
    return '이미 가입된 이메일입니다. 로그인으로 진행해 주세요.';
  }
  if (text.includes('password should be')) return '비밀번호가 너무 짧습니다. 8자 이상으로 입력해 주세요.';
  if (text.includes('unable to validate email') || text.includes('invalid email')) {
    return '이메일 형식을 다시 확인해 주세요.';
  }
  if (text.includes('for security purposes') || text.includes('rate limit') || text.includes('too many')) {
    return '요청이 너무 많습니다. 잠시 뒤 다시 시도해 주세요.';
  }
  return message;
}

export function useAdminAuth() {
  const [identity, setIdentity] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const readSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active) setIdentity(toAdminUser(data.session?.user ?? null));
      } catch {
        if (active) setIdentity(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    readSession();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setIdentity(toAdminUser(session?.user ?? null));
      setLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async ({ email, password }: SignInPayload): Promise<AuthResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) return { ok: false, message: describeAuthError(error.message) };
      return { ok: true };
    } catch {
      return { ok: false, message: '로그인 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.' };
    }
  }, []);

  const signUp = useCallback(
    async ({ email, password, name, role }: SignUpPayload): Promise<AuthResult> => {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { name: name.trim(), role },
          },
        });
        if (error) return { ok: false, message: describeAuthError(error.message) };
        if (!data.session) {
          return {
            ok: true,
            needsConfirm: true,
            message: '가입 신청이 접수되었습니다. 받은 편지함의 확인 링크를 누른 뒤 로그인해 주세요.',
          };
        }
        return { ok: true };
      } catch {
        return { ok: false, message: '가입 처리 중 문제가 생겼습니다. 잠시 후 다시 시도해 주세요.' };
      }
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setIdentity(null);
    }
  }, []);

  return { identity, loading, signIn, signUp, signOut };
}