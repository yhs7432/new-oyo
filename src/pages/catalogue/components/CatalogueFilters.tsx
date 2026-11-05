import { useTranslation } from 'react-i18next';
import type { Flex, ProductType } from '@/types/product';
import { flexOptions, type FilterState, type SortKey } from '@/utils/products';

interface Props {
  filters: FilterState;
  types: ProductType[];
  brands: string[];
  onChange: (patch: Partial<FilterState>) => void;
  onReset: () => void;
}

const control = 'h-10 w-full rounded-md border border-background-300 bg-background-50 px-3 text-[12.5px] text-foreground-800 outline-none transition-colors focus:border-primary-500';

export default function CatalogueFilters({ filters, types, brands, onChange, onReset }: Props) {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-background-200 bg-background-100 p-4 md:p-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-xs">
          <span className="pointer-events-none absolute left-3 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center text-foreground-400">
            <i className="ri-search-line text-[14px]"></i>
          </span>
          <input
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ query: event.target.value })}
            placeholder={t('catalogue.search')}
            className={`${control} pl-9`}
          />
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:ml-auto lg:w-auto lg:grid-cols-3">
          <label className="block min-w-0">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-foreground-500">
              {t('catalogue.brand')}
            </span>
            <div className="relative">
              <select
                value={filters.brand}
                onChange={(event) => onChange({ brand: event.target.value })}
                className={`${control} cursor-pointer appearance-none pr-8`}
              >
                <option value="all">{t('catalogue.allOption')}</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
              <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-500"></i>
            </div>
          </label>

          <label className="block min-w-0">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-foreground-500">
              {t('catalogue.flex')}
            </span>
            <div className="relative">
              <select
                value={filters.flex}
                onChange={(event) => onChange({ flex: event.target.value as Flex | 'all' })}
                className={`${control} cursor-pointer appearance-none pr-8`}
              >
                <option value="all">{t('catalogue.allOption')}</option>
                {flexOptions.map((flex) => (
                  <option key={flex} value={flex}>{flex}</option>
                ))}
              </select>
              <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-500"></i>
            </div>
          </label>

          <label className="col-span-2 block min-w-0 sm:col-span-1">
            <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-foreground-500">
              {t('catalogue.sort')}
            </span>
            <div className="relative">
              <select
                value={filters.sort}
                onChange={(event) => onChange({ sort: event.target.value as SortKey })}
                className={`${control} cursor-pointer appearance-none pr-8`}
              >
                <option value="newest">{t('catalogue.sortNewest')}</option>
                <option value="price-asc">{t('catalogue.sortPriceAsc')}</option>
                <option value="price-desc">{t('catalogue.sortPriceDesc')}</option>
              </select>
              <i className="ri-arrow-down-s-line pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[13px] text-foreground-500"></i>
            </div>
          </label>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-background-300/70 pt-4">
        <button
          type="button"
          onClick={() => onChange({ type: 'all' })}
          className={`cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11.5px] transition-colors ${
            filters.type === 'all'
              ? 'border-foreground-900 bg-foreground-900 text-background-50'
              : 'border-background-300 bg-background-50 text-foreground-700 hover:border-primary-400'
          }`}
        >
          {t('catalogue.allOption')}
        </button>
        {types.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange({ type })}
            className={`cursor-pointer whitespace-nowrap rounded-full border px-3.5 py-1.5 text-[11.5px] transition-colors ${
              filters.type === type
                ? 'border-foreground-900 bg-foreground-900 text-background-50'
                : 'border-background-300 bg-background-50 text-foreground-700 hover:border-primary-400'
            }`}
          >
            {t(`types.${type}`)}
          </button>
        ))}
        <button
          type="button"
          onClick={onReset}
          className="ml-auto inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap text-[11.5px] text-foreground-500 underline-offset-4 hover:text-accent-700 hover:underline"
        >
          <i className="ri-refresh-line"></i>
          {t('catalogue.reset')}
        </button>
      </div>
    </div>
  );
}