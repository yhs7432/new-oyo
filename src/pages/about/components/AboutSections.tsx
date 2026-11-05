import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const sectionTitle = 'font-heading text-[24px] leading-[1.35] text-foreground-950 md:text-[32px]';

export function Story() {
  const { t } = useTranslation();

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-9 lg:flex-row lg:items-center lg:gap-14">
        <div className="w-full lg:w-[46%]">
          <div className="aspect-[4/5] w-full overflow-hidden rounded-lg bg-background-100">
            <img
              src="https://readdy.ai/api/search-image?query=Warm%20toned%20studio%20table%20with%20a%20row%20of%20used%20golf%20irons%20and%20a%20driver%20head%20laid%20out%20for%20inspection%2C%20craftsman%20hands%20measuring%20a%20club%20with%20a%20gauge%2C%20soft%20natural%20window%20light%2C%20beige%20background%2C%20editorial%20product%20photography%2C%20shallow%20depth%20of%20field%2C%20premium%20quiet%20aesthetic&width=800&height=1000&seq=about-story-2026&orientation=portrait"
              alt={t('aboutPage.storyTitle')}
              title={`${t('aboutPage.storyTitle')} OYO GOLF`}
              className="h-full w-full object-cover object-top"
            />
          </div>
        </div>
        <div className="w-full flex-1">
          <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
            <span className="inline-block h-px w-7 bg-accent-500"></span>
            OYO GOLF
          </p>
          <h2 className={`mt-5 ${sectionTitle}`}>{t('aboutPage.storyTitle')}</h2>
          <p className="mt-6 text-[13.5px] leading-[1.95] text-foreground-700">{t('aboutPage.storyP1')}</p>
          <p className="mt-4 text-[13px] leading-[1.95] text-foreground-600">{t('aboutPage.storyP2')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
            >
              {t('aboutPage.ctaSecondary')}
              <i className="ri-arrow-right-line"></i>
            </Link>
            <Link
              to="/how-to-order"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground-900/20 px-5 py-2.5 text-[12.5px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
            >
              {t('nav.ordering')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Pillars() {
  const { t } = useTranslation();
  const keys: Array<{ key: string; icon: string }> = [
    { key: 'sourcing', icon: 'ri-search-eye-line' },
    { key: 'grading', icon: 'ri-list-check-2' },
    { key: 'supply', icon: 'ri-truck-line' },
  ];

  return (
    <section className="border-y border-background-200 bg-background-100 px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <h2 className={sectionTitle}>{t('aboutPage.pillarsTitle')}</h2>
          <p className="max-w-sm text-[12.5px] leading-relaxed text-foreground-600 sm:text-right">
            {t('aboutPage.pillarsLead')}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
          {keys.map((item, index) => (
            <article
              key={item.key}
              className={`rounded-lg border p-5 md:p-6 ${
                index === 0
                  ? 'border-accent-500 bg-accent-500 text-background-50'
                  : 'border-background-200 bg-background-50'
              }`}
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-[17px] ${
                  index === 0 ? 'bg-background-50/20 text-background-50' : 'bg-secondary-100 text-secondary-900'
                }`}
              >
                <i className={item.icon}></i>
              </span>
              <h3
                className={`mt-5 font-heading text-[17px] leading-snug ${
                  index === 0 ? 'text-background-50' : 'text-foreground-950'
                }`}
              >
                {t(`aboutPage.pillars.${item.key}.title`)}
              </h3>
              <p
                className={`mt-2 text-[12.5px] leading-[1.85] ${
                  index === 0 ? 'text-background-100' : 'text-foreground-600'
                }`}
              >
                {t(`aboutPage.pillars.${item.key}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Numbers() {
  const { t } = useTranslation();
  const stats = [
    { key: 'items', value: t('aboutPage.numbers.itemsValue'), label: t('aboutPage.numbers.items') },
    { key: 'grade', value: t('aboutPage.numbers.gradeValue'), label: t('aboutPage.numbers.grade') },
    { key: 'route', value: t('aboutPage.numbers.routeValue'), label: t('aboutPage.numbers.route') },
  ];

  return (
    <section className="bg-background-50 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className="text-[10px] uppercase tracking-[0.3em] text-foreground-500">
          {t('aboutPage.numbersTitle')}
        </h2>
        <dl className="mt-6 grid grid-cols-1 divide-y divide-background-200 border-y border-background-200 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {stats.map((stat) => (
            <div key={stat.key} className="px-1 py-6 sm:px-6">
              <dt className="text-[11.5px] uppercase tracking-[0.14em] text-foreground-500">{stat.label}</dt>
              <dd className="mt-2 font-heading text-[26px] leading-none text-foreground-950 md:text-[32px]">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export function Grading() {
  const { t } = useTranslation();
  const grades = ['a', 'b', 'c'];

  return (
    <section className="border-y border-background-200 bg-background-100 px-5 py-14 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-accent-600">{t('product.condition')}</p>
            <h2 className={`mt-3 ${sectionTitle}`}>{t('aboutPage.gradingTitle')}</h2>
          </div>
          <p className="max-w-md text-[12.5px] leading-[1.85] text-foreground-600 md:text-right">
            {t('aboutPage.gradingLead')}
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
          {grades.map((grade) => (
            <article key={grade} className="rounded-lg border border-background-200 bg-background-50 p-5">
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-500 font-heading text-[17px] text-background-50">
                  {t(`aboutPage.grading.${grade}.name`)}
                </span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-foreground-400">
                  {t('product.head')} · {t('product.shaft')} · {t('product.grip')}
                </span>
              </div>
              <p className="mt-4 text-[12.5px] leading-[1.85] text-foreground-700">
                {t(`aboutPage.grading.${grade}.desc`)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Offices() {
  const { t } = useTranslation();
  const offices = [
    {
      label: t('aboutPage.offices.bangkokLabel'),
      name: t('aboutPage.offices.bangkokName'),
      address: t('aboutPage.offices.bangkokAddress'),
      phone: '+66 65 513 2007',
      phoneHref: 'tel:+66655132007',
      email: 'dokkaebigolfthailand@gmail.com',
    },
    {
      label: t('aboutPage.offices.koreaLabel'),
      name: t('aboutPage.offices.koreaName'),
      address: t('aboutPage.offices.koreaAddress'),
      phone: '+82 32 285 7735',
      phoneHref: 'tel:+82322857735',
      email: 'hdu@star-logis.com',
    },
  ];

  return (
    <section className="bg-background-50 px-5 py-14 md:px-10 md:py-20">
      <div className="mx-auto w-full max-w-[1320px]">
        <h2 className={sectionTitle}>{t('aboutPage.officesTitle')}</h2>
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {offices.map((office) => (
            <article key={office.label} className="rounded-lg border border-background-200 bg-background-100 p-5 md:p-6">
              <p className="text-[10px] uppercase tracking-[0.24em] text-accent-600">{office.label}</p>
              <h3 className="mt-3 font-heading text-[17px] text-foreground-950">{office.name}</h3>
              <p className="mt-3 text-[12.5px] leading-[1.85] text-foreground-600">{office.address}</p>
              <dl className="mt-5 space-y-2 border-t border-background-200 pt-4 text-[12.5px]">
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-foreground-500">{t('aboutPage.offices.phone')}</dt>
                  <dd>
                    <a href={office.phoneHref} className="text-foreground-800 hover:text-accent-700">
                      {office.phone}
                    </a>
                  </dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-foreground-500">{t('aboutPage.offices.email')}</dt>
                  <dd className="min-w-0">
                    <a href={`mailto:${office.email}`} className="break-all text-foreground-800 hover:text-accent-700">
                      {office.email}
                    </a>
                  </dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AboutCta() {
  const { t } = useTranslation();

  return (
    <section className="border-t border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-heading text-[22px] leading-snug text-foreground-950 md:text-[28px]">
            {t('aboutPage.ctaTitle')}
          </h2>
          <p className="mt-2 max-w-xl text-[12.5px] leading-relaxed text-foreground-600">
            {t('aboutPage.ctaDesc')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/contact"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            {t('aboutPage.ctaPrimary')}
            <i className="ri-arrow-right-line"></i>
          </Link>
          <Link
            to="/products"
            className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md border border-foreground-900/20 px-5 py-2.5 text-[12.5px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
          >
            {t('aboutPage.ctaSecondary')}
          </Link>
        </div>
      </div>
    </section>
  );
}