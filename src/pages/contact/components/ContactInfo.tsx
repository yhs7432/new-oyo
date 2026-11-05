import { useTranslation } from 'react-i18next';

export default function ContactInfo() {
  const { t } = useTranslation();

  const offices = [
    {
      label: t('contactPage.bangkokLabel'),
      name: t('contactPage.bangkokName'),
      address: t('contactPage.bangkokAddress'),
      phone: '+66 65 513 2007',
      phoneHref: 'tel:+66655132007',
      email: 'dokkaebigolfthailand@gmail.com',
    },
    {
      label: t('contactPage.koreaLabel'),
      name: t('contactPage.koreaName'),
      address: t('contactPage.koreaAddress'),
      phone: '+82 32 285 7735',
      phoneHref: 'tel:+82322857735',
      email: 'hdu@star-logis.com',
    },
  ];

  return (
    <div className="rounded-lg border border-background-200 bg-background-100 p-5 md:p-7">
      <h2 className="font-heading text-[20px] leading-snug text-foreground-950 md:text-[24px]">
        {t('contactPage.infoTitle')}
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">{t('contactPage.hoursNote')}</p>

      <div className="mt-6 flex flex-col gap-4">
        {offices.map((office) => (
          <article key={office.label} className="rounded-lg border border-background-200 bg-background-50 p-4 md:p-5">
            <p className="text-[10px] uppercase tracking-[0.24em] text-accent-600">{office.label}</p>
            <h3 className="mt-2 font-heading text-[15.5px] text-foreground-950">{office.name}</h3>
            <p className="mt-2 text-[12px] leading-[1.8] text-foreground-600">{office.address}</p>
            <dl className="mt-4 space-y-2 border-t border-background-200 pt-3.5 text-[12.5px]">
              <div className="flex gap-3">
                <dt className="flex w-[68px] shrink-0 items-center gap-1.5 text-foreground-500">
                  <i className="ri-phone-line text-[13px]"></i>
                  {t('contactPage.phone')}
                </dt>
                <dd>
                  <a href={office.phoneHref} className="text-foreground-800 hover:text-accent-700">
                    {office.phone}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="flex w-[68px] shrink-0 items-center gap-1.5 text-foreground-500">
                  <i className="ri-mail-line text-[13px]"></i>
                  {t('contactPage.email')}
                </dt>
                <dd className="min-w-0">
                  <a href={`mailto:${office.email}`} className="break-all text-foreground-800 hover:text-accent-700">
                    {office.email}
                  </a>
                </dd>
              </div>
            </dl>
          </article>
        ))}
      </div>
    </div>
  );
}