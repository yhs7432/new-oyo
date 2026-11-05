import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import { PartnerBenefits, PartnerSteps, PartnerApply, PartnerCta } from './components/PartnerSections';

export default function PartnerPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('partnerPage.eyebrow')}
          title={t('partnerPage.title')}
          lead={t('partnerPage.lead')}
          leadLine1={t('partnerPage.leadLine1')}
          leadLine2={t('partnerPage.leadLine2')}
          crumbs={[
            { label: t('catalogue.breadcrumbHome'), to: '/' },
            { label: t('nav.partner') },
          ]}
          image="https://readdy.ai/api/search-image?query=Warm%20minimal%20golf%20shop%20interior%20with%20wooden%20shelves%20displaying%20rows%20of%20used%20golf%20clubs%2C%20neat%20price%20tags%20and%20soft%20daylight%20from%20a%20large%20window%2C%20beige%20and%20cream%20tones%2C%20editorial%20retail%20photography%2C%20calm%20premium%20atmosphere&width=1200&height=750&seq=partner-hero-2026&orientation=landscape"
          imageAlt={t('partnerPage.title')}
        />
        <PartnerBenefits />
        <PartnerSteps />
        <PartnerApply />
        <PartnerCta />
      </main>
      <SiteFooter />
    </div>
  );
}