import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import type { Product } from '@/types/product';
import { discountPercent, hasPrice, localizedName } from '@/utils/products';
import { fallbackImage } from '@/services/catalogue';

export default function ProductCard({ product }: { product: Product }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage || 'en';
  const discount = discountPercent(product);
  const soldOut = product.stock <= 0;
  const reserved = product.stockStatus === '예약';

  const [hoverBroken, setHoverBroken] = useState(false);
  const gallery = Array.isArray(product.images) ? product.images : [];
  const hoverPhoto = gallery.length > 1 && !hoverBroken ? gallery[1] : undefined;

  return (
    <Link
      to={`/products/${product.id}`}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-lg border border-background-200 bg-background-50 transition-colors hover:border-primary-400"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-background-100">
        <img
          src={product.image}
          alt={localizedName(product.name, lang)}
          title={`${localizedName(product.name, lang)} OYO GOLF`}
          onError={(event) => {
            const element = event.currentTarget;
            if (element.dataset.fallback === '1') return;
            element.dataset.fallback = '1';
            element.src = fallbackImage(product.type);
          }}
          className={`h-full w-full object-cover object-top transition-all duration-700 group-hover:scale-105 ${
            hoverPhoto ? 'group-hover:opacity-0' : ''
          }`}
        />
        {hoverPhoto && (
          <img
            src={hoverPhoto}
            alt=""
            aria-hidden="true"
            onError={() => setHoverBroken(true)}
            className="absolute inset-0 h-full w-full scale-100 object-cover object-top opacity-0 transition-all duration-700 group-hover:scale-105 group-hover:opacity-100"
          />
        )}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-primary-500 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-foreground-950">
            -{discount}%
          </span>
        )}
        {discount === 0 && product.headGrade && (
          <span className="absolute left-3 top-3 rounded-full bg-background-50/95 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-foreground-900 ring-1 ring-background-300">
            {product.headGrade}
          </span>
        )}
        {reserved && (
          <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2.5 py-1 text-[10px] font-medium tracking-wide text-foreground-950">
            {t('catalogue.reserved')}
          </span>
        )}
        <span
          className={`absolute bottom-3 left-3 rounded-full px-2.5 py-1 text-[10px] tracking-wide ${
            product.location === 'TH'
              ? 'bg-secondary-500 text-background-50'
              : 'bg-foreground-900/85 text-background-50'
          }`}
        >
          {t(`locations.${product.location}`)}
        </span>
        {gallery.length > 1 && (
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-full bg-foreground-950/70 px-2 py-1 text-[9.5px] text-background-50">
            <i className="ri-image-2-line text-[11px]"></i>
            {gallery.length}
          </span>
        )}
        {Array.isArray(product.images) && product.images.length === 0 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-background-50/90 px-2.5 py-1 text-[10px] text-foreground-500 ring-1 ring-background-300">
            {t('catalogue.noPhoto')}
          </span>
        )}
        {soldOut && (
          <span className="absolute inset-0 flex items-center justify-center bg-background-50/70 text-[12px] font-medium uppercase tracking-[0.2em] text-foreground-700">
            {t('catalogue.soldOut')}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3.5">
        <p className="truncate text-[9.5px] uppercase tracking-[0.16em] text-foreground-500">
          {product.brand} &middot; {t(`types.${product.type}`)}
        </p>
        <h3 className="mt-1.5 truncate font-heading text-[13.5px] leading-snug text-foreground-950">
          {localizedName(product.name, lang)}
        </h3>
        <p className="mt-1 truncate text-[11px] text-foreground-500">{product.spec}</p>

        {product.stock > 1 && (
          <p className="mt-1.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] text-secondary-900">
              <i className="ri-stack-line text-[11px]"></i>
              {t('catalogue.stockCount', { count: product.stock })}
            </span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <div className="min-w-0">
            {hasPrice(product) ? (
              <>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="block text-[11px] text-foreground-400 line-through">
                    &#3647;{product.originalPrice.toLocaleString('en-US')}
                  </span>
                )}
                <strong className="text-[14px] font-semibold text-foreground-950">
                  &#3647;{product.price.toLocaleString('en-US')}
                </strong>
              </>
            ) : (
              <strong className="text-[12.5px] font-medium text-foreground-700">
                {t('catalogue.priceOnRequest')}
              </strong>
            )}
          </div>
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-background-300 text-[12px] text-foreground-600 transition-colors group-hover:border-primary-500 group-hover:text-primary-600">
            <i className="ri-arrow-right-line"></i>
          </span>
        </div>
      </div>
    </Link>
  );
}