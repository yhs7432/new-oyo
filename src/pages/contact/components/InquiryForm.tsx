import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';

const FORM_URL = 'https://readdy.ai/api/form/dblva1j8gii9quct5bmg';

const fieldClass =
  'w-full box-border rounded-md border border-background-300 bg-background-50 px-3.5 py-2.5 text-[13px] text-foreground-900 outline-none transition-colors placeholder:text-foreground-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100';
const labelClass = 'mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-foreground-500';

type Status = 'idle' | 'sending' | 'success' | 'error';

export default function InquiryForm() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>('idle');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const trap = String(data.get('company_alt') ?? '').trim();
    if (trap) {
      setStatus('success');
      form.reset();
      return;
    }

    const name = String(data.get('name') ?? '').trim();
    const email = String(data.get('email') ?? '').trim();
    const message = String(data.get('message') ?? '').trim();
    if (!name || !email || !message) {
      setFormError(t('contactPage.form.required'));
      setStatus('error');
      return;
    }

    setStatus('sending');
    setFormError('');

    const body = new URLSearchParams();
    data.forEach((value, key) => {
      if (key === 'company_alt') return;
      body.append(key, String(value));
    });

    try {
      const response = await fetch(FORM_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      const responseText = await response.text();

      let parsed: unknown = null;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = null;
      }

      const payload = parsed as
        | { code?: string; meta?: { message?: string; detail?: string }; message?: string }
        | null;
      const serverMsg = payload?.meta?.message || payload?.message || payload?.meta?.detail || responseText || '';
      const code = payload?.code;
      const isSpam = typeof serverMsg === 'string' && serverMsg.toLowerCase().includes('spam');

      if (!response.ok || isSpam || (code && code !== 'OK')) {
        setFormError(
          typeof serverMsg === 'string' && serverMsg.trim()
            ? serverMsg
            : t('contactPage.form.error'),
        );
        setStatus('error');
        return;
      }

      setStatus('success');
      form.reset();
    } catch {
      setFormError(t('contactPage.form.error'));
      setStatus('error');
    }
  };

  return (
    <div className="rounded-lg border border-background-200 bg-background-50 p-5 md:p-7">
      <h2 className="font-heading text-[20px] leading-snug text-foreground-950 md:text-[24px]">
        {t('contactPage.formTitle')}
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">{t('contactPage.formDesc')}</p>

      {status === 'success' && (
        <p className="mt-5 flex items-start gap-2 rounded-md bg-accent-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-accent-900">
          <i className="ri-checkbox-circle-line mt-0.5 text-[15px]"></i>
          {t('contactPage.form.success')}
        </p>
      )}

      {status === 'error' && formError && (
        <p className="mt-5 flex items-start gap-2 rounded-md bg-foreground-100 px-3.5 py-3 text-[12.5px] leading-relaxed text-foreground-800">
          <i className="ri-error-warning-line mt-0.5 text-[15px]"></i>
          {formError}
        </p>
      )}

      <form data-readdy-form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="min-w-0">
            <label className={labelClass} htmlFor="inquiry-name">
              {t('contactPage.form.name')} *
            </label>
            <input
              id="inquiry-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder={t('contactPage.form.namePlaceholder')}
              className={fieldClass}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass} htmlFor="inquiry-company">
              {t('contactPage.form.company')}
            </label>
            <input
              id="inquiry-company"
              name="company"
              type="text"
              autoComplete="organization"
              placeholder={t('contactPage.form.companyPlaceholder')}
              className={fieldClass}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass} htmlFor="inquiry-email">
              {t('contactPage.form.email')} *
            </label>
            <input
              id="inquiry-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder={t('contactPage.form.emailPlaceholder')}
              className={fieldClass}
            />
          </div>
          <div className="min-w-0">
            <label className={labelClass} htmlFor="inquiry-phone">
              {t('contactPage.form.phone')}
            </label>
            <input
              id="inquiry-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder={t('contactPage.form.phonePlaceholder')}
              className={fieldClass}
            />
          </div>
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="inquiry-country">
            {t('contactPage.form.country')}
          </label>
          <input
            id="inquiry-country"
            name="country"
            type="text"
            autoComplete="country-name"
            placeholder={t('contactPage.form.countryPlaceholder')}
            className={fieldClass}
          />
        </div>

        <div className="min-w-0">
          <label className={labelClass} htmlFor="inquiry-message">
            {t('contactPage.form.message')} *
          </label>
          <textarea
            id="inquiry-message"
            name="message"
            required
            rows={5}
            maxLength={500}
            placeholder={t('contactPage.form.messagePlaceholder')}
            className={`${fieldClass} resize-none leading-relaxed`}
          ></textarea>
          <p className="mt-1.5 text-right text-[10.5px] text-foreground-400">{t('contactPage.form.messageHint')}</p>
        </div>

        <div className="form-hp">
          <label htmlFor="inquiry-company-alt">company</label>
          <input
            id="inquiry-company-alt"
            name="company_alt"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            readOnly
          />
        </div>

        <button
          type="submit"
          disabled={status === 'sending'}
          className="inline-flex w-full cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-3 text-[13px] font-medium text-foreground-950 transition-colors hover:bg-primary-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <i className={status === 'sending' ? 'ri-loader-4-line animate-spin' : 'ri-send-plane-line'}></i>
          {status === 'sending' ? t('contactPage.form.sending') : t('contactPage.form.submit')}
        </button>
      </form>
    </div>
  );
}