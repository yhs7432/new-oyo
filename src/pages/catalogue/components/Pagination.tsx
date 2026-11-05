import { useTranslation } from 'react-i18next';

interface Props {
  page: number;
  total: number;
  onChange: (page: number) => void;
}

function pageWindow(page: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | 'gap')[] = [1];
  const start = Math.max(2, page - 1);
  const end = Math.min(total - 1, page + 1);

  if (start > 2) items.push('gap');
  for (let p = start; p <= end; p += 1) items.push(p);
  if (end < total - 1) items.push('gap');
  items.push(total);

  return items;
}

export default function Pagination({ page, total, onChange }: Props) {
  const { t } = useTranslation();
  if (total <= 1) return null;

  const items = pageWindow(page, total);

  return (
    <div className="mt-10 flex flex-col items-center gap-4 border-t border-background-200 pt-6 sm:flex-row sm:justify-between">
      <p className="text-[12px] text-foreground-500">{t('catalogue.page', { page, total })}</p>
      <div className="flex flex-wrap items-center justify-center gap-1.5">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label={t('catalogue.prev')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700 transition-colors hover:border-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="ri-arrow-left-s-line"></i>
        </button>
        {items.map((item, index) =>
          item === 'gap' ? (
            <span
              key={`gap-${index}`}
              className="flex h-9 w-6 items-center justify-center text-[12px] text-foreground-400"
            >
              &middot;&middot;&middot;
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={`h-9 min-w-9 cursor-pointer rounded-md border px-3 text-[12.5px] transition-colors ${
                item === page
                  ? 'border-foreground-900 bg-foreground-900 text-background-50'
                  : 'border-background-300 text-foreground-700 hover:border-primary-500 hover:text-primary-600'
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= total}
          aria-label={t('catalogue.next')}
          className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-background-300 text-foreground-700 transition-colors hover:border-primary-500 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <i className="ri-arrow-right-s-line"></i>
        </button>
      </div>
    </div>
  );
}