import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

const noticeKeys = ['n1', 'n2', 'n3', 'n4', 'n5'];
const filters = ['all', 'notice', 'stock'];

export default function NoticeList() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>('all');
  const [active, setActive] = useState<string | null>(null);

  const items = useMemo(
    () =>
      noticeKeys.map((key) => ({
        key,
        title: t(`newsPage.items.${key}.title`),
        date: t(`newsPage.items.${key}.date`),
        tag: t(`newsPage.items.${key}.tag`),
        excerpt: t(`newsPage.items.${key}.excerpt`),
        body: t(`newsPage.items.${key}.body`),
      })),
    [t],
  );

  const visible = items.filter((item) => filter === 'all' || item.tag === filter);
  const current = items.find((item) => item.key === active) ?? null;

  useEffect(() => {
    if (!active) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActive(null);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [active]);

  return (
    <section className="bg-background-50 px-5 py-12 md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex flex-wrap gap-1 rounded-full border border-background-300 bg-background-100 p-1">
            {filters.map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-[12px] transition-colors ${
                  filter === key
                    ? 'bg-foreground-900 text-background-50'
                    : 'text-foreground-700 hover:bg-background-200/70'
                }`}
              >
                {t(`newsPage.filters.${key}`)}
              </button>
            ))}
          </div>
          <p className="text-[11.5px] text-foreground-500">{visible.length}</p>
        </div>

        {visible.length === 0 ? (
          <div className="mt-8 flex flex-col items-center gap-2 rounded-lg border border-dashed border-background-300 px-6 py-14 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background-100 text-[17px] text-foreground-500">
              <i className="ri-information-line"></i>
            </span>
            <p className="text-[13px] text-foreground-600">{t('newsPage.empty')}</p>
          </div>
        ) : (
          <ul className="mt-7 divide-y divide-background-200 border-y border-background-200">
            {visible.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={() => setActive(item.key)}
                  className="group flex w-full cursor-pointer flex-col gap-3 py-5 text-left md:flex-row md:items-center md:gap-7"
                >
                  <div className="flex shrink-0 items-center gap-3 md:w-[190px]">
                    <span className="font-heading text-[13px] text-foreground-500">{item.date}</span>
                    <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] tracking-wide text-secondary-900">
                      {t(`newsPage.filters.${item.tag}`)}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-[14px] font-medium leading-snug text-foreground-950 transition-colors group-hover:text-primary-700">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-foreground-600">
                      {item.excerpt}
                    </p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-background-300 text-[13px] text-foreground-600 transition-colors group-hover:border-primary-500 group-hover:text-primary-600">
                    <i className="ri-arrow-right-line"></i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {current && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-foreground-950/50 px-4 pb-4 pt-16 md:items-center md:p-6">
          <div
            role="dialog"
            aria-modal="true"
            aria-label={current.title}
            className="w-full max-w-[580px] overflow-hidden rounded-lg border border-background-200 bg-background-50"
          >
            <div className="flex items-start justify-between gap-4 border-b border-background-200 px-5 py-4 md:px-6">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-foreground-500">
                  <span className="rounded-full bg-secondary-100 px-2.5 py-1 text-[10px] tracking-wide text-secondary-900">
                    {t(`newsPage.filters.${current.tag}`)}
                  </span>
                  <span className="font-heading">{current.date}</span>
                </div>
                <h3 className="mt-2.5 font-heading text-[18px] leading-snug text-foreground-950">
                  {current.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label={t('newsPage.close')}
                className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-background-300 text-[15px] text-foreground-600 transition-colors hover:border-foreground-900 hover:text-foreground-950"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="max-h-[62vh] overflow-y-auto px-5 py-5 md:px-6">
              <p className="text-[13px] leading-[1.95] text-foreground-700">{current.body}</p>
            </div>
            <div className="border-t border-background-200 px-5 py-3 text-right md:px-6">
              <button
                type="button"
                onClick={() => setActive(null)}
                className="cursor-pointer whitespace-nowrap rounded-md border border-foreground-900/20 px-4 py-2 text-[12px] text-foreground-800 transition-colors hover:border-foreground-900 hover:text-foreground-950"
              >
                {t('newsPage.close')}
              </button>
            </div>
          </div>
          <button
            type="button"
            aria-label={t('newsPage.close')}
            onClick={() => setActive(null)}
            className="absolute inset-0 -z-10 cursor-default"
          ></button>
        </div>
      )}
    </section>
  );
}