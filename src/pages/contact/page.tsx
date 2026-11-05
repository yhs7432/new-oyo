import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import InquiryForm from './components/InquiryForm';
import ContactInfo from './components/ContactInfo';

export default function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('contactPage.eyebrow')}
          title={t('contactPage.title')}
          lead={t('contactPage.lead')}
          crumbs={[{ label: t('catalogue.breadcrumbHome'), to: '/' }, { label: t('nav.contact') }]}
        />
        <section className="px-5 py-12 md:px-10 md:py-16">
          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <ContactInfo />
            <InquiryForm />
          </div>
        </section>

        <section className="border-t border-background-200 bg-background-100 px-5 py-12 md:px-10 md:py-16">
          <div className="mx-auto w-full max-w-[1320px]">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <h2 className="font-heading text-[22px] leading-snug text-foreground-950 md:text-[28px]">
                {t('contactPage.mapTitle')}
              </h2>
              <p className="text-[11.5px] text-foreground-500">{t('contactPage.mapNote')}</p>
            </div>
            <div className="mt-5 overflow-hidden rounded-lg border border-background-200 bg-background-50">
              <iframe
                title={t('contactPage.mapTitle')}
                src="https://www.google.com/maps?q=No.+1+Bearing+Soi+5,+Sukhumvit+107,+Bang+Na+Tai,+Bang+Na,+Bangkok+10260,+Thailand&output=embed"
                width="100%"
                height="360"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-[300px] w-full border-0 md:h-[380px]"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}