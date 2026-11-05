import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import NoticeList from './components/NoticeList';

export default function NewsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('newsPage.eyebrow')}
          title={t('newsPage.title')}
          lead={t('newsPage.lead')}
          crumbs={[{ label: t('catalogue.breadcrumbHome'), to: '/' }, { label: t('nav.news') }]}
        />
        <NoticeList />
      </main>
      <SiteFooter />
    </div>
  );
}