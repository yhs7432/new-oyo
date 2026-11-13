import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import useIsThai from '@/hooks/useIsThai';
import { categories, benefits } from '@/mocks/home';

export default function Hero() {
  const { t } = useTranslation();
  const isThai = useIsThai();

  return (
    <section id="home" className="relative bg-foreground-950">
      <div className="absolute inset-0 h-full w-full">
        <img
          src="https://oyogolftest.netlify.app/assets/home-background-v2.webp"
          alt="Vintage clubhouse, leather golf bag and golf course at sunset"
          title="OYO GOLF premium golf clubs"
          className="h-full w-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/15"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-5 pb-14 pt-32 md:px-10 md:pb-20 md:pt-48">
        <div className="max-w-2xl fade-up">
          <p
            className={`mb-6 flex items-center gap-3 text-[10px] uppercase text-primary-300 md:text-[11px] ${
              isThai ? 'tracking-[0.04em] leading-[1.7]' : 'tracking-[0.32em]'
            }`}
          >
            <span className="inline-block h-px w-8 shrink-0 bg-primary-400"></span>
            {t('hero.eyebrow')}
          </p>
          <h1
            className={`break-words font-heading text-background-50 ${
              isThai
                ? 'text-[29px] leading-[1.5] tracking-[0] md:text-[46px] md:leading-[1.42]'
                : 'text-[34px] leading-[1.18] md:text-6xl md:leading-[1.14]'
            }`}
          >
            {t('hero.title1')}
            <br />
            <span className="text-primary-400">{t('hero.title2')}</span>
          </h1>
          <p
            className={`max-w-xl text-background-200 ${
              isThai
                ? 'mt-7 text-[13.5px] leading-[2] md:text-[15px] md:leading-[1.95]'
                : 'mt-6 text-[13.5px] leading-[1.85] md:text-[15px]'
            }`}
          >
            {t('hero.desc')}
          </p>
          <div
            className={`flex flex-col items-start gap-4 sm:flex-row sm:items-center ${
              isThai ? 'mt-10' : 'mt-9'
            }`}
          >
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center gap-2.5 whitespace-nowrap rounded-full bg-primary-500 px-6 py-3 text-[13px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
            >
              {t('hero.cta')}
              <i className="ri-arrow-right-line"></i>
            </Link>
            <a
              href="#ordering"
              className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap text-[13px] text-background-100 underline-offset-4 transition-colors hover:text-primary-300 hover:underline"
            >
              {t('hero.secondary')}
              <i className="ri-arrow-down-line"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-[1320px] px-5 md:px-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-5">
          {categories.map((c, i) => (
            <Link
              key={c.key}
              to={c.route}
              className="group block cursor-pointer overflow-hidden rounded-lg border border-background-50/15 bg-foreground-950/70 backdrop-blur-sm transition-colors hover:border-primary-500/60 fade-up"
              style={{ animationDelay: `${0.25 + i * 0.12}s` }}
            >
              <div className="h-40 w-full overflow-hidden md:h-52">
                <img
                  src={c.img}
                  alt={t(`categories.${c.key}.title`)}
                  title={`${t(`categories.${c.key}.title`)} OYO GOLF`}
                  className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex items-start justify-between gap-3 px-5 py-5">
                <div className="min-w-0">
                  <h2
                    className={`break-words font-heading text-[17px] text-background-50 md:text-lg ${
                      isThai ? 'leading-[1.6] tracking-[0]' : ''
                    }`}
                  >
                    {t(`categories.${c.key}.title`)}
                  </h2>
                  <p
                    className={`mt-1.5 break-words text-[11.5px] text-background-300 ${
                      isThai ? 'leading-[1.9]' : 'leading-relaxed'
                    }`}
                  >
                    {t(`categories.${c.key}.desc`)}
                  </p>
                </div>
                <span className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-primary-500/70 text-[13px] text-primary-400 transition-colors group-hover:bg-primary-500 group-hover:text-foreground-950">
                  <i className="ri-arrow-right-line"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="relative mx-auto mt-12 w-full max-w-[1320px] px-5 md:mt-16 md:px-10">
        <div className="grid grid-cols-1 gap-6 border-t border-background-50/10 py-8 sm:grid-cols-3 sm:gap-0">
          {benefits.map((b, i) => (
            <div
              key={b.key}
              className={`flex items-start gap-3.5 ${i > 0 ? 'sm:border-l sm:border-background-50/10 sm:pl-8' : ''}`}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-primary-500/40 text-[15px] text-primary-400">
                <i className={b.icon}></i>
              </span>
              <div>
                <strong
                  className={`block break-words text-[13px] font-medium text-background-50 ${
                    isThai ? 'leading-[1.75]' : ''
                  }`}
                >
                  {t(`benefits.${b.key}.title`)}
                </strong>
                <p
                  className={`mt-0.5 break-words text-[11.5px] text-background-400 ${
                    isThai ? 'leading-[1.85]' : ''
                  }`}
                >
                  {t(`benefits.${b.key}.desc`)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}