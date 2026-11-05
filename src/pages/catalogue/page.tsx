import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import ProductCard from '@/components/feature/ProductCard';
import CatalogueFilters from './components/CatalogueFilters';
import Pagination from './components/Pagination';
import type { CategoryKey } from '@/types/product';
import { useCatalogue } from '@/hooks/useCatalogue';
import {
  brandsOf,
  categoryKey,
  categoryRoute,
  emptyFilters,
  filterProducts,
  paginate,
  productsOf,
  totalPages,
  typesOf,
  type FilterState,
} from '@/utils/products';

const tabs: { label: string; to: string; category?: CategoryKey }[] = [
  { label: 'catalogue.tabs.all', to: '/products' },
  { label: 'catalogue.tabs.events', to: categoryRoute.events, category: 'events' },
  { label: 'catalogue.tabs.used', to: categoryRoute.used, category: 'used' },
  { label: 'catalogue.tabs.accessories', to: categoryRoute.accessories, category: 'accessories' },
];

export default function CataloguePage({ category }: { category?: CategoryKey }) {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [page, setPage] = useState(1);

  const live = !category;
  const { items: sheetItems, loading, error, reload } = useCatalogue({ enabled: live });

  useEffect(() => {
    setFilters(emptyFilters);
    setPage(1);
  }, [category]);

  const base = useMemo(
    () => (live ? sheetItems : productsOf(category)),
    [live, sheetItems, category],
  );
  const filtered = useMemo(() => filterProducts(base, filters), [base, filters]);
  const pages = totalPages(filtered.length);
  const currentPage = Math.min(page, pages);
  const visible = paginate(filtered, currentPage);

  const update = (patch: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };

  const reset = () => {
    setFilters(emptyFilters);
    setPage(1);
  };

  const title = category ? t(`categories.${categoryKey[category]}.title`) : t('catalogue.all');
  const description = category
    ? t(`categories.${categoryKey[category]}.desc`)
    : t('catalogue.allDesc');

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <section className="border-b border-background-200 bg-background-100 px-5 pb-8 pt-10 md:px-10 md:pb-10 md:pt-14">
          <div className="mx-auto w-full max-w-[1320px]">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-foreground-500">
              <Link to="/" className="hover:text-primary-700">{t('catalogue.breadcrumbHome')}</Link>
              <i className="ri-arrow-right-s-line text-[12px]"></i>
              <Link to="/products" className="hover:text-primary-700">{t('nav.shop')}</Link>
              {category && (
                <>
                  <i className="ri-arrow-right-s-line text-[12px]"></i>
                  <span className="text-foreground-700">{title}</span>
                </>
              )}
            </nav>

            <div className="mt-5 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
                  <span className="inline-block h-px w-7 bg-accent-500"></span>
                  OYO GOLF Wholesale
                </p>
                <h1 className="mt-4 font-heading text-[28px] leading-[1.3] text-foreground-950 md:text-[38px]">
                  {title}
                </h1>
                <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-foreground-600">
                  {description}
                </p>
              </div>
              <div className="flex flex-col items-start gap-1.5 md:items-end">
                <p className="text-[12px] text-foreground-500">
                  {loading && live ? t('catalogue.loading') : t('catalogue.count', { total: filtered.length })}
                </p>
                {live && !loading && !error && (
                  <p className="inline-flex items-center gap-1.5 text-[11px] text-foreground-400">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-500"></span>
                    {t('catalogue.liveSheet')}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 inline-flex max-w-full flex-wrap gap-1 rounded-full border border-background-300 bg-background-50 p-1">
              {tabs.map((tab) => {
                const active = tab.category === category || (!tab.category && !category);
                return (
                  <Link
                    key={tab.to}
                    to={tab.to}
                    className={`whitespace-nowrap rounded-full px-4 py-2 text-[12px] transition-colors ${
                      active
                        ? 'bg-foreground-900 text-background-50'
                        : 'text-foreground-700 hover:bg-background-100'
                    }`}
                  >
                    {t(tab.label)}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="px-5 py-10 md:px-10 md:py-14">
          <div className="mx-auto w-full max-w-[1320px]">
            <CatalogueFilters
              filters={filters}
              types={typesOf(base)}
              brands={brandsOf(base)}
              onChange={update}
              onReset={reset}
            />

            {loading && live ? (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="overflow-hidden rounded-lg border border-background-200 bg-background-50"
                  >
                    <div className="aspect-[4/5] w-full animate-pulse bg-background-200/70"></div>
                    <div className="space-y-2.5 p-4">
                      <div className="h-2.5 w-24 animate-pulse rounded-full bg-background-200/70"></div>
                      <div className="h-3.5 w-3/4 animate-pulse rounded-full bg-background-200/70"></div>
                      <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-background-200/60"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error && live ? (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-background-300 bg-background-100 px-6 py-16 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-200 text-[18px] text-foreground-600">
                  <i className="ri-wifi-off-line"></i>
                </span>
                <p className="text-[14px] font-medium text-foreground-800">{t('catalogue.errorTitle')}</p>
                <p className="max-w-md text-[12px] leading-relaxed text-foreground-500">
                  {t('catalogue.errorHelp')}
                </p>
                <button
                  type="button"
                  onClick={reload}
                  className="mt-2 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-foreground-900 px-4 py-2 text-[12px] text-background-50 transition-colors hover:bg-foreground-800"
                >
                  <i className="ri-refresh-line"></i>
                  {t('catalogue.retry')}
                </button>
              </div>
            ) : visible.length > 0 ? (
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="mt-8 flex flex-col items-center gap-3 rounded-lg border border-dashed border-background-300 px-6 py-16 text-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-background-100 text-[18px] text-foreground-500">
                  <i className="ri-search-line"></i>
                </span>
                <p className="text-[14px] font-medium text-foreground-800">{t('catalogue.empty')}</p>
                <p className="text-[12px] text-foreground-500">{t('catalogue.emptyHelp')}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-2 cursor-pointer whitespace-nowrap rounded-md border border-foreground-900 px-4 py-2 text-[12px] text-foreground-900 transition-colors hover:bg-foreground-900 hover:text-background-50"
                >
                  {t('catalogue.reset')}
                </button>
              </div>
            )}

            {!(loading && live) && !(error && live) && (
              <Pagination page={currentPage} total={pages} onChange={setPage} />
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
      <Link
        to="/contact"
        className="fixed bottom-5 right-5 z-40 inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-full border border-primary-500 bg-foreground-950 px-5 py-3 text-[12.5px] text-primary-400 transition-colors hover:bg-primary-500 hover:text-foreground-950"
      >
        <i className="ri-chat-3-line"></i>
        {t('line.chat')}
      </Link>
    </div>
  );
}