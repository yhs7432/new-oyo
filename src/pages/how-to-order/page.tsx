import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import { OrderSteps, OrderTerms, OrderFaq, OrderCta } from './components/OrderSections';

export default function OrderingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('orderPage.eyebrow')}
          title={t('orderPage.title')}
          lead={t('orderPage.lead')}
          crumbs={[{ label: t('catalogue.breadcrumbHome'), to: '/' }, { label: t('nav.ordering') }]}
        />
        <OrderSteps />
        <OrderTerms />
        <OrderFaq />
        <OrderCta />
      </main>
      <SiteFooter />
    </div>
  );
}