import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { lineChannel } from '@/config/channels';

const benefits = [
  { key: 'price', icon: 'ri-price-tag-3-line' },
  { key: 'stock', icon: 'ri-stack-line' },
  { key: 'grade', icon: 'ri-list-check-2' },
  { key: 'ship', icon: 'ri-truck-line' },
];

const steps = [
  { key: 'one', icon: 'ri-store-2-line', num: '01' },
  { key: 'two', icon: 'ri-search-line', num: '02' },
  { key: 'three', icon: 'ri-price-tag-3-line', num: '03' },
  { key: 'four', icon: 'ri-truck-line', num: '04' },
];

const applyKeys = ['store', 'contact', 'focus'];

const LINE_FALLBACK = 'https://line.me/R/ti/p/@908feqyl';

export function PartnerBenefits() {
  const { t } = useTranslation();

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="font-heading text-[24px] leading-[1.35] text-foreground-950 md:text-[32px]">
            {t('partnerPage.benefitsTitle')}
          </h2>
          <p className="max-w-md text-[12.5px] leading-[1.8] text-foreground-600 sm:text-right">
            <span className="block break-keep">{t('partnerPage.benefitsLead')}</span>
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {benefits.map((item, index) => {
            const highlight = index === 0;
            return (
              <article
                key={item.key}
                className={`rounded-lg border p-5 ${
                  highlight
                    ? 'border-accent-500 bg-accent-500 text-background-50'
                    : 'border-background-200 bg-background-100'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-[16px] ${
                    highlight
                      ? 'bg-background-50/20 text-background-50'
                      : 'bg-secondary-100 text-secondary-900'
                  }`}
                >
                  <i className={item.icon}></i>
                </span>
                <h3
                  className={`mt-5 font-heading text-[16px] leading-snug ${
                    highlight ? 'text-background-50' : 'text-foreground-950'
                  }`}
                >
                  {t(`partnerPage.benefits.${item.key}.title`)}
                </h3>
                <p
                  className={`mt-2 text-[12.5px] leading-[1.85] ${
                    highlight ? 'text-background-100' : 'text-foreground-600'
                  }`}
                >
                  {t(`partnerPage.benefits.${item.key}.desc`)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function PartnerSteps() {
  const { t } = useTranslation();

  return (
    <section className="border-y border-background-200 bg-background-100 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
              <span className="inline-block h-px w-7 bg-accent-500"></span>
              {t('partnerPage.eyebrow')}
            </p>
            <h2 className="mt-4 font-heading text-[24px] leading-[1.35] text-foreground-950 md:text-[32px]">
              {t('partnerPage.stepsTitle')}
            </h2>
          </div>
          <p className="max-w-md text-[12.5px] leading-[1.8] text-foreground-600 sm:text-right">
            <span className="block break-keep">{t('partnerPage.stepsLead')}</span>
          </p>
        </div>

        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          {steps.map((step, index) => {
            const highlight = index === 0;
            return (
              <li
                key={step.key}
                className={`rounded-lg border p-5 transition-transform duration-300 hover:-translate-y-1 md:p-6 ${
                  highlight
                    ? 'border-accent-500 bg-accent-500 text-background-50'
                    : 'border-background-200 bg-background-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-[15px] ${
                      highlight
                        ? 'bg-background-50/20 text-background-50'
                        : 'bg-secondary-500 text-background-50'
                    }`}
                  >
                    <i className={step.icon}></i>
                  </span>
                  <span
                    className={`font-heading text-[22px] ${
                      highlight ? 'text-background-100' : 'text-primary-500'
                    }`}
                  >
                    {step.num}
                  </span>
                </div>
                <h3
                  className={`mt-6 font-heading text-[16px] leading-snug ${
                    highlight ? 'text-background-50' : 'text-foreground-950'
                  }`}
                >
                  {t(`partnerPage.steps.${step.key}.title`)}
                </h3>
                <p
                  className={`mt-2.5 text-[12.5px] leading-[1.8] ${
                    highlight ? 'text-background-100' : 'text-foreground-600'
                  }`}
                >
                  {t(`partnerPage.steps.${step.key}.desc`)}
                </p>
                <p
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] ${
                    highlight
                      ? 'bg-background-50/15 text-background-50'
                      : 'bg-background-200/70 text-foreground-700'
                  }`}
                >
                  <i className="ri-information-line text-[12px]"></i>
                  {t(`partnerPage.steps.${step.key}.note`)}
                </p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

export function PartnerApply() {
  const { t } = useTranslation();

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
          <div className="w-full lg:w-[40%]">
            <h2 className="font-heading text-[24px] leading-[1.35] text-foreground-950 md:text-[32px]">
              {t('partnerPage.applyTitle')}
            </h2>
            <p className="mt-4 text-[13px] leading-[1.9] text-foreground-600">
              {t('partnerPage.applyLead')}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
              >
                {t('partnerPage.applyCtaPrimary')}
                <i className="ri-arrow-right-line"></i>
              </Link>
              <a
                href={lineChannel?.href ?? LINE_FALLBACK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground-900/20 px-5 py-2.5 text-[12.5px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
              >
                <i className="ri-chat-3-line text-[14px]"></i>
                {t('partnerPage.lineCta')}
              </a>
            </div>
          </div>

          <div className="w-full flex-1">
            <ul className="divide-y divide-background-200 border-y border-background-200">
              {applyKeys.map((key, index) => (
                <li key={key} className="flex items-start gap-4 py-4">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-100 font-heading text-[13px] text-secondary-900">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 text-[13.5px] leading-[1.7] text-foreground-900">
                    {t(`partnerPage.apply.${key}`)}
                  </span>
                </li>
              ))}
              <li className="flex items-start gap-4 py-4">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background-200/70 text-[13px] text-foreground-600">
                  <i className="ri-add-line"></i>
                </span>
                <span className="min-w-0 flex-1 break-keep text-[12.5px] leading-[1.8] text-foreground-600">
                  {t('partnerPage.applyExtra')}
                </span>
              </li>
            </ul>
            <div className="mt-4 space-y-2">
              <p className="flex items-start gap-2 text-[12px] leading-[1.8] text-foreground-500">
                <i className="ri-information-line mt-0.5 text-[13px]"></i>
                <span className="break-keep">{t('partnerPage.applyNote')}</span>
              </p>
              <p className="flex items-start gap-2 text-[12px] leading-[1.8] text-foreground-500">
                <i className="ri-time-line mt-0.5 text-[13px]"></i>
                <span className="break-keep">{t('partnerPage.applyNoteTime')}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function PartnerCta() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-[22px] leading-snug text-foreground-950 md:text-[28px]">
            {t('partnerPage.ctaTitle')}
          </h2>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-foreground-600">
            {t('partnerPage.ctaDesc')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            {t('partnerPage.ctaPrimary')}
            <i className="ri-arrow-right-line"></i>
          </Link>
          <Link
            to="/products"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground-900/20 px-5 py-2.5 text-[12.5px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
          >
            {t('partnerPage.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}