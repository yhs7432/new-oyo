import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import ProductCard from '@/components/feature/ProductCard';
import { products } from '@/mocks/products';
import { useCatalogue } from '@/hooks/useCatalogue';
import { fallbackImage } from '@/services/catalogue';
import {
  categoryRoute,
  discountPercent,
  hasPhoto,
  hasPrice,
  localizedName,
  visibleOnly,
} from '@/utils/products';
import { groupProducts } from '@/utils/grouping';
import { lineChannel } from '@/config/channels';

export default function ProductDetailPage() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const lang = i18n.resolvedLanguage || 'en';

  const demo = products.find((p) => p.id === id);
  const { items, loading, error, reload } = useCatalogue({ enabled: !demo });
  const shopItems = useMemo(() => visibleOnly(items), [items]);
  const product = demo ?? shopItems.find((p) => p.id === id);

  const [activePhoto, setActivePhoto] = useState(0);

  useEffect(() => {
    setActivePhoto(0);
  }, [id]);

  const photos = useMemo(() => {
    if (!product) return [];
    const list = product.images && product.images.length > 0 ? product.images : [product.image];
    return list.slice(0, 8);
  }, [product]);

  const related = useMemo(() => {
    if (!product) return [];
    if (demo) {
      return groupProducts(products.filter((p) => p.category === product.category && p.id !== product.id)).slice(0, 5);
    }
    return groupProducts(shopItems.filter((p) => p.type === product.type && p.id !== product.id)).slice(0, 5);
  }, [product, demo, shopItems]);

  const stockTotal = useMemo(() => {
    if (!product) return 1;
    const source = demo ? products : shopItems;
    const group = groupProducts(source).find(
      (item) => item.id === product.id || item.groupedIds?.includes(product.id),
    );
    return group?.stock ?? product.stock;
  }, [product, demo, shopItems]);

  if (!product) {
    return (
      <div className="min-h-screen bg-background-50">
        <SiteHeader />
        <main className="mx-auto flex min-h-[60vh] w-full max-w-[1320px] flex-col items-center justify-center gap-4 px-5 pt-20">
          {loading ? (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-[20px] text-foreground-500">
                <i className="ri-loader-4-line animate-spin"></i>
              </span>
              <p className="text-[13px] text-foreground-600">{t('product.loading')}</p>
            </>
          ) : error ? (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-background-100 text-[20px] text-foreground-500">
                <i className="ri-wifi-off-line"></i>
              </span>
              <p className="font-heading text-[20px] text-foreground-950">{t('catalogue.errorTitle')}</p>
              <p className="max-w-md text-center text-[12.5px] text-foreground-500">{t('catalogue.errorHelp')}</p>
              <button
                type="button"
                onClick={reload}
                className="inline-flex cursor-pointer items-center gap-2 whitespace-nowrap rounded-md bg-foreground-900 px-4 py-2 text-[12.5px] text-background-50 hover:bg-foreground-800"
              >
                <i className="ri-refresh-line"></i>
                {t('catalogue.retry')}
              </button>
            </>
          ) : (
            <>
              <p className="font-heading text-[22px] text-foreground-950">{t('product.notFound')}</p>
              <Link
                to="/products"
                className="cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-5 py-2.5 text-[12.5px] font-medium text-foreground-950 hover:bg-primary-400"
              >
                {t('product.back')}
              </Link>
            </>
          )}
        </main>
        <SiteFooter />
      </div>
    );
  }

  const discount = discountPercent(product);
  const reserved = product.stockStatus === '예약';
  const missingPhoto = !hasPhoto(product);
  const gradeRows = [
    { key: 'head', value: product.headGrade },
    { key: 'shaft', value: product.shaftGrade },
    { key: 'grip', value: product.gripGrade },
  ].filter((row) => Boolean(row.value));

  const specRows = [
    { key: 'type', value: t(`types.${product.type}`) },
    ...(product.category === 'accessories' ? [] : [{ key: 'flex', value: product.flex ?? '—' }]),
    { key: 'spec', value: product.spec },
    { key: 'location', value: t(`locations.${product.location}`) },
    { key: 'stock', value: String(stockTotal) },
  ];

  const lineHref = lineChannel?.href ?? 'https://line.me/R/ti/p/@908feqyl';

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <div className="border-b border-background-200 bg-background-100 px-5 py-5 md:px-10">
          <div className="mx-auto flex w-full max-w-[1320px] flex-wrap items-center gap-2 text-[11px] text-foreground-500">
            <Link to="/" className="hover:text-primary-700">{t('catalogue.breadcrumbHome')}</Link>
            <i className="ri-arrow-right-s-line text-[12px]"></i>
            <Link to="/products" className="hover:text-primary-700">{t('nav.shop')}</Link>
            <i className="ri-arrow-right-s-line text-[12px]"></i>
            <Link to={demo ? categoryRoute[product.category] : '/products'} className="hover:text-primary-700">
              {demo
                ? t(`categories.${product.category === 'events' ? 'special' : product.category}.title`)
                : t('nav.shop')}
            </Link>
            <i className="ri-arrow-right-s-line text-[12px]"></i>
            <span className="max-w-[220px] truncate text-foreground-700">{localizedName(product.name, lang)}</span>
          </div>
        </div>

        <section className="px-5 py-10 md:px-10 md:py-16">
          <div className="mx-auto w-full max-w-[1320px]">
            <Link
              to="/products"
              className="inline-flex cursor-pointer items-center gap-2 text-[12px] text-foreground-600 hover:text-primary-700"
            >
              <i className="ri-arrow-left-line"></i>
              {t('product.back')}
            </Link>

            <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-14">
              <div>
                <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg border border-background-200 bg-background-100">
                  <img
                    src={photos[activePhoto] ?? product.image}
                    alt={localizedName(product.name, lang)}
                    title={`${localizedName(product.name, lang)} OYO GOLF`}
                    onError={(event) => {
                      const element = event.currentTarget;
                      if (element.dataset.fallback === '1') return;
                      element.dataset.fallback = '1';
                      element.src = fallbackImage(product.type);
                    }}
                    className="h-full w-full object-cover object-top"
                  />
                  {discount > 0 && (
                    <span className="absolute left-4 top-4 rounded-full bg-primary-500 px-3 py-1 text-[11px] font-semibold text-foreground-950">
                      -{discount}%
                    </span>
                  )}
                  {reserved && (
                    <span className="absolute right-4 top-4 rounded-full bg-accent-500 px-3 py-1 text-[11px] font-medium text-foreground-950">
                      {t('catalogue.reserved')}
                    </span>
                  )}
                  {photos.length > 1 && (
                    <span className="absolute bottom-4 right-4 rounded-full bg-foreground-950/80 px-3 py-1 text-[11px] text-background-50">
                      {activePhoto + 1} / {photos.length}
                    </span>
                  )}
                  {missingPhoto && (
                    <span className="pointer-events-none absolute bottom-4 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full bg-background-50/95 px-3 py-1.5 text-[11px] font-medium text-foreground-700 ring-1 ring-background-300">
                      <i className="ri-camera-off-line text-[12px]"></i>
                      {t('product.photoPending')}
                    </span>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {photos.map((photo, index) => (
                      <button
                        key={photo}
                        type="button"
                        onClick={() => setActivePhoto(index)}
                        aria-label={`${t('product.photos')} ${index + 1}`}
                        className={`h-20 w-16 shrink-0 cursor-pointer overflow-hidden rounded-md border transition-colors ${
                          activePhoto === index
                            ? 'border-primary-500'
                            : 'border-background-200 hover:border-background-400'
                        }`}
                      >
                        <img
                          src={photo}
                          alt=""
                          onError={(event) => {
                            const element = event.currentTarget;
                            if (element.dataset.fallback === '1') return;
                            element.dataset.fallback = '1';
                            element.src = fallbackImage(product.type);
                          }}
                          className="h-full w-full object-cover object-top"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col">
                <p className="text-[10px] uppercase tracking-[0.22em] text-foreground-500">
                  {product.brand} &middot; {t(`types.${product.type}`)}
                </p>
                <h1 className="mt-3 font-heading text-[24px] leading-[1.35] text-foreground-950 md:text-[32px]">
                  {localizedName(product.name, lang)}
                </h1>
                <p className="mt-3 text-[13px] text-foreground-600">{product.spec}</p>

                <div className="mt-6 flex flex-wrap items-end gap-3">
                  {hasPrice(product) ? (
                    <>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-[14px] text-foreground-400 line-through">
                          &#3647;{product.originalPrice.toLocaleString('en-US')}
                        </span>
                      )}
                      <strong className="text-[30px] font-semibold leading-none text-foreground-950">
                        &#3647;{product.price.toLocaleString('en-US')}
                      </strong>
                      <span className="pb-1 text-[11px] uppercase tracking-[0.16em] text-foreground-500">
                        {t('product.thb')}
                      </span>
                    </>
                  ) : (
                    <strong className="text-[24px] font-medium leading-none text-foreground-800">
                      {t('product.priceOnRequest')}
                    </strong>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-[11px] ${
                      product.location === 'TH'
                        ? 'bg-secondary-100 text-secondary-900'
                        : 'bg-background-200 text-foreground-800'
                    }`}
                  >
                    {t(`locations.${product.location}`)}
                  </span>
                  <span className="rounded-full bg-background-100 px-3 py-1 text-[11px] text-foreground-700">
                    {t('product.stock')} {stockTotal}
                  </span>
                  {product.stockStatus && (
                    <span className="rounded-full bg-accent-100 px-3 py-1 text-[11px] text-accent-900">
                      {reserved ? t('catalogue.reserved') : t('catalogue.available')}
                    </span>
                  )}
                </div>

                {product.description && (
                  <p className="mt-5 rounded-lg border border-background-200 bg-background-100/70 px-4 py-3 text-[12.5px] leading-relaxed text-foreground-600">
                    {product.description}
                  </p>
                )}

                {gradeRows.length > 0 && (
                  <div className="mt-7">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-foreground-500">
                      {t('product.condition')}
                    </p>
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {gradeRows.map((row, index) => (
                        <div
                          key={row.key}
                          className={`rounded-lg border px-3 py-3 text-center ${
                            index === 0
                              ? 'border-primary-300 bg-primary-50'
                              : 'border-background-200 bg-background-100'
                          }`}
                        >
                          <span className="block text-[10px] uppercase tracking-[0.12em] text-foreground-500">
                            {t(`product.${row.key}`)}
                          </span>
                          <strong className="mt-1 block font-heading text-[18px] font-normal text-foreground-950">
                            {row.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <dl className="mt-7 divide-y divide-background-200 border-y border-background-200">
                  {specRows.map((row) => (
                    <div key={row.key} className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-foreground-500">
                        {t(`product.${row.key}`)}
                      </dt>
                      <dd className="text-right text-[12.5px] text-foreground-800">{row.value}</dd>
                    </div>
                  ))}
                  {typeof product.conditionPercent === 'number' && (
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-foreground-500">
                        {t('product.conditionPercent')}
                      </dt>
                      <dd className="text-right text-[12.5px] text-foreground-800">
                        {product.conditionPercent}%
                      </dd>
                    </div>
                  )}
                  {typeof product.headCoverIncluded === 'boolean' && (
                    <div className="flex items-center justify-between gap-4 py-2.5">
                      <dt className="text-[11.5px] uppercase tracking-[0.1em] text-foreground-500">
                        {t('product.headCover')}
                      </dt>
                      <dd className="text-right text-[12.5px] text-foreground-800">
                        {product.headCoverIncluded ? t('product.included') : t('product.notIncluded')}
                      </dd>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4 py-2.5">
                    <dt className="text-[11.5px] uppercase tracking-[0.1em] text-foreground-500">
                      {t('product.sku')}
                    </dt>
                    <dd className="text-right text-[12.5px] text-foreground-800">{product.id}</dd>
                  </div>
                </dl>

                {missingPhoto && (
                  <div className="mt-6 flex flex-col gap-3 rounded-lg border border-accent-300/70 bg-accent-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-100 text-[15px] text-accent-700">
                        <i className="ri-camera-off-line"></i>
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-medium text-accent-900">
                          {t('product.photoPending')}
                        </p>
                        <p className="mt-1 text-[11.5px] leading-relaxed text-foreground-700">
                          {t('product.photoPendingDesc')}
                        </p>
                      </div>
                    </div>
                    <a
                      href={lineHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-accent-500 bg-background-50 px-3.5 py-2 text-[11.5px] font-medium text-accent-800 transition-colors hover:bg-accent-100"
                    >
                      <i className="ri-image-line text-[12px]"></i>
                      {t('product.photoRequest')}
                    </a>
                  </div>
                )}

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={lineHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full bg-primary-500 px-6 py-3 text-[13px] font-medium text-foreground-950 transition-colors hover:bg-primary-400"
                  >
                    <i className="ri-chat-3-line"></i>
                    {t('product.inquire')}
                  </a>
                  <Link
                    to="/products"
                    className="inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border border-foreground-900 px-6 py-3 text-[13px] text-foreground-900 transition-colors hover:bg-foreground-900 hover:text-background-50"
                  >
                    {t('product.back')}
                  </Link>
                </div>
                <p className="mt-4 text-[11.5px] leading-relaxed text-foreground-500">{t('product.note')}</p>
              </div>
            </div>
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
            <div className="mx-auto w-full max-w-[1320px]">
              <div className="flex items-end justify-between gap-4">
                <h2 className="font-heading text-[22px] leading-snug text-foreground-950 md:text-[28px]">
                  {t('product.related')}
                </h2>
                <Link
                  to="/products"
                  className="inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[12px] text-foreground-600 hover:text-accent-700"
                >
                  {t('catalogue.viewAll')}
                  <i className="ri-arrow-right-line"></i>
                </Link>
              </div>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
                {related.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}