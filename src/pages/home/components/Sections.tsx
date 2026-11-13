import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useIsThai from '@/hooks/useIsThai';
import { highlights, steps } from '@/mocks/home';

export function About() {
  const { t } = useTranslation();
  const isThai = useIsThai();

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

        <div className="w-full min-w-0 flex-1">
          <p
            className={`flex items-center gap-3 text-[10px] uppercase text-accent-600 ${
              isThai ? 'tracking-[0.04em] leading-[1.7]' : 'tracking-[0.3em]'
            }`}
          >
            <span className="inline-block h-px w-7 shrink-0 bg-accent-500"></span>
            {t('about.tag')}
          </p>
          <h2
            className={`mt-5 break-words font-heading text-foreground-950 ${
              isThai
                ? 'text-[23px] leading-[1.55] md:text-[32px] md:leading-[1.5]'
                : 'text-[26px] leading-[1.35] md:text-[36px] md:leading-[1.3]'
            }`}
          >
            {t('about.title')}
          </h2>
          <p
            className={`mt-6 break-words text-foreground-700 ${
              isThai
                ? 'text-[13.5px] leading-[2] md:text-[14.5px] md:leading-[1.95]'
                : 'text-[13.5px] leading-[1.9] md:text-[14.5px]'
            }`}
          >
            {t('about.desc')}
          </p>
          <p
            className={`break-words text-[13px] text-foreground-600 ${
              isThai ? 'mt-5 leading-[1.95]' : 'mt-4 leading-[1.9]'
            }`}
          >
            {t('about.desc2')}
          </p>

          <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${isThai ? 'mt-10' : 'mt-9'}`}>
            {highlights.map((h, i) => (
              <div
                key={h.key}
                className={`rounded-lg border px-4 ${
                  isThai ? 'py-6' : 'py-5'
                } ${
                  i === 0
                    ? 'border-accent-500 bg-accent-500 text-background-50'
                    : 'border-background-200 bg-background-100'
                }`}
              >
                <strong
                  className={`block break-words font-heading text-[15px] font-normal ${
                    isThai ? 'leading-[1.65]' : 'leading-snug'
                  }`}
                >
                  {t(`about.${h.key}.title`)}
                </strong>
                <p
                  className={`mt-2 break-words text-[11px] ${isThai ? 'leading-[1.9]' : 'leading-relaxed'} ${
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
            className={`inline-flex cursor-pointer items-center gap-2 text-[13px] text-accent-700 underline-offset-4 hover:underline ${
              isThai ? 'mt-10' : 'mt-9'
            }`}
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
  const isThai = useIsThai();

  return (
    <section id="ordering" className="bg-background-100 px-5 py-16 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-8">
          <div className="min-w-0">
            <p
              className={`flex items-center gap-3 text-[10px] uppercase text-accent-600 ${
                isThai ? 'tracking-[0.04em] leading-[1.7]' : 'tracking-[0.3em]'
              }`}
            >
              <span className="inline-block h-px w-7 shrink-0 bg-accent-500"></span>
              {t('ordering.eyebrow')}
            </p>
            <h2
              className={`mt-5 break-words font-heading text-foreground-950 ${
                isThai
                  ? 'text-[23px] leading-[1.55] md:text-[32px] md:leading-[1.5]'
                  : 'text-[26px] leading-[1.35] md:text-[36px]'
              }`}
            >
              {t('ordering.title')}
            </h2>
          </div>
          <p
            className={`w-full break-words text-[13px] text-foreground-600 md:w-auto md:text-right ${
              isThai ? 'max-w-md leading-[1.95]' : 'max-w-sm leading-[1.85]'
            }`}
          >
            <span className={`block ${isThai ? '' : 'break-keep'}`}>{t('ordering.descLine1')}</span>
            <span className={`mt-1 block text-foreground-500 ${isThai ? '' : 'break-keep'}`}>
              {t('ordering.descLine2')}
            </span>
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
              <h3
                className={`mt-6 break-words font-heading text-[16px] text-foreground-950 ${
                  isThai ? 'leading-[1.65]' : 'leading-snug'
                }`}
              >
                {t(`ordering.steps.${s.key}.title`)}
              </h3>
              <p
                className={`mt-2.5 break-words text-[12.5px] text-foreground-600 ${
                  isThai ? 'leading-[1.9]' : 'leading-[1.8]'
                }`}
              >
                {t(`ordering.steps.${s.key}.desc`)}
              </p>
              <Link
                to="/how-to-order"
                className={`inline-flex cursor-pointer items-center gap-1.5 text-[12px] text-accent-700 underline-offset-4 hover:underline ${
                  isThai ? 'mt-6' : 'mt-5'
                }`}
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
  const isThai = useIsThai();

  return (
    <section id="news" className="bg-background-50 px-5 py-16 md:px-10 md:py-28">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 border-b border-background-300 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p
              className={`text-[10px] uppercase text-accent-600 ${
                isThai ? 'tracking-[0.04em] leading-[1.7]' : 'tracking-[0.3em]'
              }`}
            >
              {t('news.subtitle')}
            </p>
            <h2
              className={`mt-3 font-heading text-foreground-950 ${
                isThai ? 'text-[23px] leading-[1.55] md:text-[32px]' : 'text-[26px] leading-[1.35] md:text-[36px]'
              }`}
            >
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
              className={`group flex cursor-pointer flex-col gap-1.5 py-4 sm:flex-row sm:items-center sm:gap-6 ${
                isThai ? 'sm:py-5' : ''
              }`}
            >
              <span className="shrink-0 font-heading text-[12px] text-foreground-500 sm:w-[104px]">
                {t(`newsPage.items.${key}.date`)}
              </span>
              <span
                className={`min-w-0 flex-1 break-words text-[13px] text-foreground-900 transition-colors group-hover:text-primary-700 ${
                  isThai ? 'leading-[1.8]' : 'leading-snug'
                }`}
              >
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