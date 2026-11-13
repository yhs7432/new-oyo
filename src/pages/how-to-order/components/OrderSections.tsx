import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { lineChannel } from '@/config/channels';
import useIsThai from '@/hooks/useIsThai';

const stepsByPath = {
  partner: [
    { key: 'one', icon: 'ri-store-2-line', num: '01' },
    { key: 'two', icon: 'ri-search-line', num: '02' },
    { key: 'three', icon: 'ri-price-tag-3-line', num: '03' },
    { key: 'four', icon: 'ri-truck-line', num: '04' },
  ],
  retail: [
    { key: 'one', icon: 'ri-search-line', num: '01' },
    { key: 'two', icon: 'ri-chat-3-line', num: '02' },
    { key: 'three', icon: 'ri-bank-card-line', num: '03' },
    { key: 'four', icon: 'ri-truck-line', num: '04' },
  ],
} as const;

type PathKey = keyof typeof stepsByPath;

const paths: { key: PathKey; icon: string }[] = [
  { key: 'partner', icon: 'ri-store-2-line' },
  { key: 'retail', icon: 'ri-user-line' },
];

const LINE_FALLBACK = 'https://line.me/R/ti/p/@908feqyl';

const terms = [
  { key: 'min', icon: 'ri-stack-line' },
  { key: 'price', icon: 'ri-price-tag-3-line' },
  { key: 'pay', icon: 'ri-bank-card-line' },
  { key: 'ship', icon: 'ri-truck-line' },
];

const faqKeys = ['q1', 'q2', 'q3', 'q4', 'q5'];

export function OrderSteps() {
  const { t } = useTranslation();
  const isThai = useIsThai();
  const [path, setPath] = useState<PathKey>('partner');
  const steps = stepsByPath[path];
  const lineStepKey = path === 'partner' ? 'three' : 'two';

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2
            className={`break-words font-heading text-foreground-950 md:text-[32px] ${
              isThai ? 'text-[23px] leading-[1.55]' : 'text-[24px] leading-[1.35]'
            }`}
          >
            {t('orderPage.stepsTitle')}
          </h2>
          <p className="max-w-md break-words text-[12.5px] leading-[1.8] text-foreground-600 sm:text-right">
            <span className={`block ${isThai ? '' : 'break-keep'}`}>{t('orderPage.leadLine1')}</span>
            <span className={`mt-1 block text-foreground-500 ${isThai ? '' : 'break-keep'}`}>
              {t('orderPage.leadLine2')}
            </span>
          </p>
        </div>

        <div className="mt-7 flex flex-col gap-3 border-y border-background-200 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-background-300 bg-background-100 p-1" role="tablist" aria-label={t('orderPage.stepsTitle')}>
            {paths.map((item) => {
              const active = path === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setPath(item.key)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-[12px] transition-colors ${
                    active
                      ? 'bg-foreground-900 text-background-50'
                      : 'text-foreground-700 hover:bg-background-200/70'
                  }`}
                >
                  <i className={`${item.icon} text-[13px]`}></i>
                  {t(`orderPage.paths.${item.key}`)}
                </button>
              );
            })}
          </div>
          <p className="break-words text-[11.5px] leading-relaxed text-foreground-500">
            {t(`orderPage.pathNotes.${path}`)}
          </p>
        </div>

        <ol key={path} className="mt-7 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {steps.map((step, index) => (
            <li
              key={step.key}
              className={`relative rounded-lg border p-5 md:p-6 ${
                index === 0
                  ? 'border-accent-500 bg-accent-500 text-background-50'
                  : 'border-background-200 bg-background-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[16px] ${
                    index === 0 ? 'bg-background-50/20 text-background-50' : 'bg-secondary-500 text-background-50'
                  }`}
                >
                  <i className={step.icon}></i>
                </span>
                <span
                  className={`font-heading text-[26px] leading-none ${
                    index === 0 ? 'text-background-100' : 'text-primary-500'
                  }`}
                >
                  {step.num}
                </span>
              </div>
              <h3
                className={`mt-5 break-words font-heading text-[17px] ${
                  isThai ? 'leading-[1.65]' : 'leading-snug'
                } ${index === 0 ? 'text-background-50' : 'text-foreground-950'}`}
              >
                {t(`orderPage.steps.${path}.${step.key}.title`)}
              </h3>
              <p
                className={`mt-2 break-words text-[12.5px] ${
                  isThai ? 'leading-[1.95]' : 'leading-[1.85]'
                } ${index === 0 ? 'text-background-100' : 'text-foreground-600'}`}
              >
                {t(`orderPage.steps.${path}.${step.key}.desc`)}
              </p>
              {step.key === lineStepKey ? (
                <a
                  href={lineChannel?.href ?? LINE_FALLBACK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`mt-4 inline-flex max-w-full cursor-pointer items-start gap-1.5 rounded-full px-3 py-1.5 text-left text-[10.5px] leading-[1.6] transition-colors ${
                    index === 0
                      ? 'bg-background-50/15 text-background-50 hover:bg-background-50/25'
                      : 'bg-background-200/70 text-foreground-700 hover:bg-background-200'
                  }`}
                >
                  <i className="ri-information-line mt-0.5 shrink-0 text-[12px]"></i>
                  <span className="min-w-0 break-words">{t(`orderPage.steps.${path}.${step.key}.note`)}</span>
                  <i className="ri-arrow-right-up-line mt-0.5 shrink-0 text-[11px]"></i>
                </a>
              ) : (
                <p
                  className={`mt-4 inline-flex max-w-full items-start gap-1.5 rounded-full px-3 py-1.5 text-[10.5px] leading-[1.6] ${
                    index === 0
                      ? 'bg-background-50/15 text-background-50'
                      : 'bg-background-200/70 text-foreground-700'
                  }`}
                >
                  <i className="ri-information-line mt-0.5 shrink-0 text-[12px]"></i>
                  <span className="min-w-0 break-words">{t(`orderPage.steps.${path}.${step.key}.note`)}</span>
                </p>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export function OrderTerms() {
  const { t } = useTranslation();
  const isThai = useIsThai();

  return (
    <section className="border-y border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2
          className={`text-[10px] uppercase text-foreground-500 ${
            isThai ? 'leading-[1.7] tracking-[0.04em]' : 'tracking-[0.3em]'
          }`}
        >
          {t('orderPage.termsTitle')}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {terms.map((term) => (
            <article key={term.key} className="rounded-lg border border-background-200 bg-background-50 p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-100 text-[15px] text-accent-900">
                <i className={term.icon}></i>
              </span>
              <h3
                className={`mt-4 break-words font-heading text-[15px] text-foreground-950 ${
                  isThai ? 'leading-[1.65]' : ''
                }`}
              >
                {t(`orderPage.terms.${term.key}.title`)}
              </h3>
              <p
                className={`mt-2 break-words text-[12px] text-foreground-600 ${
                  isThai ? 'leading-[1.95]' : 'leading-[1.85]'
                }`}
              >
                {t(`orderPage.terms.${term.key}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function OrderFaq() {
  const { t } = useTranslation();
  const isThai = useIsThai();
  const [open, setOpen] = useState<string | null>('q1');

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1000px]">
        <h2
          className={`break-words font-heading text-foreground-950 md:text-[32px] ${
            isThai ? 'text-[23px] leading-[1.55]' : 'text-[24px] leading-[1.35]'
          }`}
        >
          {t('orderPage.faqTitle')}
        </h2>
        <div className="mt-7 divide-y divide-background-200 border-y border-background-200">
          {faqKeys.map((key) => {
            const isOpen = open === key;
            return (
              <div key={key}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : key)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left"
                >
                  <span className={`min-w-0 flex-1 break-words text-[13.5px] font-medium text-foreground-900 ${isThai ? 'leading-[1.7]' : ''}`}>
                    {t(`orderPage.faq.${key}.q`)}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-background-300 text-[13px] text-foreground-600">
                    <i className={isOpen ? 'ri-subtract-line' : 'ri-add-line'}></i>
                  </span>
                </button>
                {isOpen && (
                  <p className="break-words pb-4 pr-10 text-[12.5px] leading-[1.9] text-foreground-600">
                    {t(`orderPage.faq.${key}.a`)}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function OrderCta() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-[22px] leading-snug text-foreground-950 md:text-[28px]">
            {t('orderPage.ctaTitle')}
          </h2>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-foreground-600">{t('orderPage.ctaDesc')}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            {t('orderPage.ctaPrimary')}
            <i className="ri-arrow-right-line"></i>
          </Link>
          <Link
            to="/products"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground-900/20 px-5 py-2.5 text-[12.5px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
          >
            {t('orderPage.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}