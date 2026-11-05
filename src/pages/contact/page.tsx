import { useTranslation } from 'react-i18next';
import SiteHeader from '@/components/feature/SiteHeader';
import SiteFooter from '@/components/feature/SiteFooter';
import PageHero from '@/components/feature/PageHero';
import InquiryForm from './components/InquiryForm';
import ContactInfo from './components/ContactInfo';
import ChannelsCard from './components/ChannelsCard';

export default function ContactPage() {
  const { t, i18n } = useTranslation();

  const mapLanguage = i18n.language.startsWith('ko')
    ? 'ko'
    : i18n.language.startsWith('th')
      ? 'th'
      : 'en';

  const mapSrc =
    `https://maps.google.com/maps?hl=${mapLanguage}` +
    '&q=Only%20One%20Golf%2C%20No.%201%20Soi%20Bearing%205%2C%20Krung%20Thep%20Maha%20Nakhon%2C%20Bangkok%2010260%2C%20Thailand' +
    '&z=17&ie=UTF8&iwloc=B&output=embed';

  return (
    <div className="min-h-screen bg-background-50">
      <SiteHeader />
      <main className="pt-20">
        <PageHero
          eyebrow={t('contactPage.eyebrow')}
          title={t('contactPage.title')}
          lead={t('contactPage.lead')}
          leadLine1={t('contactPage.leadLine1')}
          leadLine2={t('contactPage.leadLine2')}
          crumbs={[{ label: t('catalogue.breadcrumbHome'), to: '/' }, { label: t('nav.contact') }]}
        />
        <section className="px-5 py-12 md:px-10 md:py-16">
          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 gap-6 lg:grid-cols-[1.1fr_1fr] lg:gap-8">
            <div className="flex flex-col gap-6">
              <ChannelsCard />
              <ContactInfo />
            </div>
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
                src={mapSrc}
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