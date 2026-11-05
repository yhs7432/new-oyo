import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { highlights, steps } from '@/mocks/home';

export function About() {
  const { t } = useTranslation();

  return (
    <section id="about" className="bg-background-50 px-5 py-16 md:px-10 md:py-28">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col items-center gap-10 lg:flex-row lg:gap-16">
        <div className="w-full lg:w-[44%]">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-background-100">
            <img
              src="https://oyogolftest.netlify.app/assets/about-inspection-v1.webp"
              alt="Golf equipment inspection in a workshop"
              title="Golf club inspection OYO GOLF"
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>

        <div className="w-full flex-1">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
            <span className="inline-block h-px w-7 bg-accent-500"></span>
            {t('about.tag')}
          </p>
          <h2 className="mt-5 font-heading text-[26px] leading-[1.35] text-foreground-950 md:text-[36px] md:leading-[1.3]">
            {t('about.title')}
          </h2>
          <p className="mt-6 text-[13.5px] leading-[1.9] text-foreground-700 md:text-[14.5px]">
            {t('about.desc')}
          </p>
          <p className="mt-4 text-[13px] leading-[1.9] text-foreground-600">
            {t('about.desc2')}
          </p>

          <div className="mt-9 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {highlights.map((h, i) => (
              <div
                key={h.key}
                className={`rounded-lg border px-4 py-5 ${
                  i === 0
                    ? 'border-accent-500 bg-accent-500 text-background-50'
                    : 'border-background-200 bg-background-100'
                }`}
              >
                <strong className="block font-heading text-[15px] font-normal leading-snug">
                  {t(`about.${h.key}.title`)}
                </strong>
                <p
                  className={`mt-2 text-[11px] leading-relaxed ${
                    i === 0 ? 'text-background-100' : 'text-foreground-600'
                  }`}
                >
                  {t(`about.${h.key}.desc`)}
                </p>
              </div>
            ))}
          </div>

          <Link
            to="/about"
            className="mt-9 inline-flex cursor-pointer items-center gap-2 text-[13px] text-accent-700 underline-offset-4 hover:underline"
          >
            {t('about.more')}
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>
      </div>
    </section>
  );
}

export function Ordering() {
  const { t } = useTranslation();

  return (
    <section id="ordering" className="bg-background-100 px-5 py-16 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
              <span className="inline-block h-px w-7 bg-accent-500"></span>
              {t('ordering.eyebrow')}
            </p>
            <h2 className="mt-5 font-heading text-[26px] leading-[1.35] text-foreground-950 md:text-[36px]">
              {t('ordering.title')}
            </h2>
          </div>
          <p className="max-w-sm text-[13px] leading-[1.85] text-foreground-600 md:text-right">
            <span className="block break-keep">{t('ordering.descLine1')}</span>
            <span className="mt-1 block break-keep text-foreground-500">{t('ordering.descLine2')}</span>
          </p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:mt-14 md:gap-5">
          {steps.map((s) => (
            <article
              key={s.num}
              className="group rounded-lg border border-background-200 bg-background-50 p-5 transition-transform duration-300 hover:-translate-y-1 md:p-6"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-500 text-[15px] text-background-50">
                  <i className={s.icon}></i>
                </span>
                <span className="font-heading text-[22px] text-primary-500">{s.num}</span>
              </div>
              <h3 className="mt-6 font-heading text-[16px] leading-snug text-foreground-950">{t(`ordering.steps.${s.key}.title`)}</h3>
              <p className="mt-2.5 text-[12.5px] leading-[1.8] text-foreground-600">
                {t(`ordering.steps.${s.key}.desc`)}
              </p>
              <Link
                to="/how-to-order"
                className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-accent-700 underline-offset-4 hover:underline"
              >
                {t('ordering.view')}
                <i className="ri-arrow-right-line"></i>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function News() {
  const { t } = useTranslation();

  return (
    <section id="news" className="bg-background-50 px-5 py-16 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 border-b border-background-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent-600">{t('news.subtitle')}</p>
            <h2 className="mt-3 font-heading text-[26px] leading-[1.35] text-foreground-950 md:text-[36px]">
              {t('news.title')}
            </h2>
          </div>
          <Link
            to="/news"
            className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[12.5px] text-foreground-600 underline-offset-4 hover:text-accent-700 hover:underline"
          >
            {t('news.viewAll')}
            <i className="ri-arrow-right-line"></i>
          </Link>
        </div>

        <div className="mt-2 divide-y divide-background-200 border-b border-background-200">
          {['n1', 'n2', 'n3'].map((key) => (
            <Link
              key={key}
              to="/news"
              className="group flex cursor-pointer flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="shrink-0 font-heading text-[12px] text-foreground-500 sm:w-[104px]">
                {t(`newsPage.items.${key}.date`)}
              </span>
              <span className="min-w-0 flex-1 text-[13px] leading-snug text-foreground-900 transition-colors group-hover:text-primary-700">
                {t(`newsPage.items.${key}.title`)}
              </span>
              <i className="ri-arrow-right-line text-[14px] text-foreground-400 transition-colors group-hover:text-primary-600"></i>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}