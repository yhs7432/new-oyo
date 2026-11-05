import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { languages } from '@/mocks/home';

const links = [
  { key: 'nav.shop', to: '/special-offers' },
  { key: 'nav.about', to: '/about' },
  { key: 'nav.ordering', to: '/how-to-order' },
  { key: 'nav.news', to: '/news' },
  { key: 'nav.contact', to: '/contact' },
];

export default function SiteHeader({ overlay = false }: { overlay?: boolean }) {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  const current = (i18n.resolvedLanguage || 'en').slice(0, 2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setLangOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = code;
    }
    setLangOpen(false);
    setOpen(false);
  };

  const light = !overlay || scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        light ? 'border-b border-background-200 bg-background-50/95 backdrop-blur' : 'bg-transparent'
      }`}
    >
      <div className="flex h-20 w-full items-center justify-between gap-6 px-5 md:px-10">
        <Link to="/" className="group flex flex-col leading-none">
          <span className="mb-1 text-[10px] text-primary-600">&#9819;</span>
          <strong
            className={`font-heading text-xl font-normal tracking-[0.06em] md:text-[22px] ${
              light ? 'text-foreground-950' : 'text-background-50'
            }`}
          >
            OYO GOLF
          </strong>
          <span className="mt-1 text-[7px] uppercase tracking-[0.3em] text-primary-600">
            Premium Golf Equipment
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex lg:gap-9">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`whitespace-nowrap text-[13px] tracking-wide transition-colors hover:text-primary-600 ${
                light ? 'text-foreground-700' : 'text-background-100'
              }`}
            >
              {t(l.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/admin"
            className={`cursor-pointer whitespace-nowrap rounded-md border px-4 py-2 text-xs transition-colors ${
              light
                ? 'border-foreground-900 text-foreground-900 hover:bg-foreground-900 hover:text-background-50'
                : 'border-background-50/50 text-background-50 hover:bg-background-50 hover:text-foreground-950'
            }`}
          >
            {t('nav.login')}
          </Link>
          <Link
            to="/partner"
            className="cursor-pointer whitespace-nowrap rounded-md bg-primary-500 px-4 py-2 text-xs font-medium text-foreground-950 transition-colors hover:bg-primary-400"
          >
            {t('nav.partner')}
          </Link>
          <div ref={langRef} className="relative ml-1">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              className={`flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-md border px-3 py-2 text-xs transition-colors ${
                light
                  ? 'border-background-300 text-foreground-800 hover:border-foreground-400'
                  : 'border-background-50/40 text-background-50 hover:border-background-50'
              }`}
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center">
                <i className="ri-global-line text-[13px]"></i>
              </span>
              {languages.find((l) => l.code === current)?.label ?? 'EN'}
              <i className={`ri-arrow-down-s-line text-[13px] transition-transform ${langOpen ? 'rotate-180' : ''}`}></i>
            </button>
            {langOpen && (
              <ul
                role="listbox"
                className="absolute right-0 top-12 w-36 overflow-hidden rounded-lg border border-background-200 bg-background-50 py-1"
              >
                {languages.map((l) => (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={current === l.code}
                      onClick={() => changeLanguage(l.code)}
                      className={`flex w-full cursor-pointer items-center justify-between px-3.5 py-2 text-sm transition-colors hover:bg-background-100 ${
                        current === l.code ? 'text-primary-700' : 'text-foreground-800'
                      }`}
                    >
                      <span className="whitespace-nowrap">{l.label}</span>
                      {current === l.code && <i className="ri-check-line text-primary-600"></i>}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          className={`flex h-10 w-10 cursor-pointer items-center justify-center text-2xl md:hidden ${
            light ? 'text-foreground-950' : 'text-background-50'
          }`}
        >
          <i className={open ? 'ri-close-line' : 'ri-menu-line'}></i>
        </button>
      </div>

      {open && (
        <div className="border-t border-background-200 bg-background-50 px-5 pb-6 pt-4 md:hidden">
          <nav className="flex flex-col divide-y divide-background-200">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="py-3 text-sm text-foreground-800"
              >
                {t(l.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-5 flex gap-2">
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-md border border-foreground-900 py-2.5 text-xs text-foreground-900"
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/partner"
              onClick={() => setOpen(false)}
              className="flex flex-1 cursor-pointer items-center justify-center whitespace-nowrap rounded-md bg-primary-500 py-2.5 text-xs font-medium text-foreground-950"
            >
              {t('nav.partner')}
            </Link>
          </div>
          <div className="mt-5">
            <p className="mb-2 text-[11px] uppercase tracking-[0.2em] text-foreground-500">
              {t('nav.language')}
            </p>
            <div className="inline-flex gap-1 rounded-full border border-background-300 p-1">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => changeLanguage(l.code)}
                  className={`cursor-pointer whitespace-nowrap rounded-full px-3 py-1.5 text-xs transition-colors ${
                    current === l.code
                      ? 'bg-foreground-900 text-background-50'
                      : 'text-foreground-700 hover:bg-background-100'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}