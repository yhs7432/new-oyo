import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import { Story, Pillars, Numbers, Grading, Offices, AboutCta } from './components/AboutSections';

export default function AboutPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('aboutPage.eyebrow')}
          title={t('aboutPage.title')}
          lead={t('aboutPage.lead')}
          leadLine1={t('aboutPage.leadLine1')}
          leadLine2={t('aboutPage.leadLine2')}
          crumbs={[{ label: t('catalogue.breadcrumbHome'), to: '/' }, { label: t('nav.about') }]}
          image="https://readdy.ai/api/search-image?query=Warm%20toned%20workshop%20table%20with%20several%20used%20golf%20clubs%20arranged%20neatly%20and%20a%20craftsman%20inspecting%20a%20driver%20head%20under%20soft%20natural%20light%2C%20beige%20and%20cream%20background%2C%20editorial%20photography%2C%20shallow%20depth%20of%20field%2C%20premium%20quiet%20catalogue%20aesthetic&width=1200&height=750&seq=about-hero-2026&orientation=landscape"
          imageAlt={t('aboutPage.title')}
        />
        <Story />
        <Pillars />
        <Numbers />
        <Grading />
        <Offices />
        <AboutCta />
      </main>
      <SiteFooter />
    </div>
  );
}