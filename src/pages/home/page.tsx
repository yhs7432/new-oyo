import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import Hero from './components/Hero';
import { About, Ordering, News } from './components/Sections';

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader overlay />
      <main>
        <Hero />
        <About />
        <Ordering />
        <News />
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