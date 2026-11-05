import { useTranslation } from 'react-i18next';
import { channels, mapLink } from '@/config/channels';

const label = 'mb-3 font-body text-[11px] uppercase tracking-[0.16em] text-primary-700';
const sub = 'mb-1 block text-[10.5px] uppercase tracking-[0.1em] text-foreground-500';

export default function SiteFooter() {
  const { t } = useTranslation();

  return (
    <footer id="contact" className="bg-background-200 px-5 pb-8 pt-14 text-foreground-900 md:px-10 md:pt-16">
      <div className="mx-auto w-full max-w-[1320px]">
        <div className="grid grid-cols-1 gap-9 border-b border-background-300 pb-9 md:grid-cols-[1fr_1.5fr_1fr] md:gap-10">
          <div>
            <strong className="font-heading text-[22px] font-normal tracking-[0.06em] text-primary-800">
              OYO GOLF
            </strong>
            <p className="mt-2 text-[10px] uppercase tracking-[0.24em] text-foreground-500">
              Premium Golf Equipment
            </p>
            <p className="mt-4 max-w-[220px] text-[12px] leading-relaxed text-foreground-600">
              {t('footer.tagline')}
            </p>
            <div className="mt-5">
              <p className="mb-2 text-[10px] uppercase tracking-[0.16em] text-primary-700">{t('footer.channels')}</p>
              <div className="flex flex-wrap items-center gap-2">
                {channels.map((channel) => (
                  <a
                    key={channel.id}
                    href={channel.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={channel.name}
                    title={`${channel.name} ${channel.handle}`}
                    className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-background-300 bg-background-50 text-[15px] text-foreground-700 transition-colors hover:border-primary-500 hover:text-primary-700"
                  >
                    <i className={channel.icon}></i>
                  </a>
                ))}
              </div>
            </div>
          </div>
          <div>
            <h4 className={label}>{t('footer.company')}</h4>
            <p className="text-[12px] text-foreground-800">OYO GOLF CO., LTD.</p>
            <p className="mt-4 text-[12px] leading-relaxed text-foreground-700">
              <span className={sub}>{t('footer.bizNo')}</span>
              0205568067846
            </p>
            <p className="mt-3 text-[12px] leading-relaxed text-foreground-700">
              <span className={sub}>{t('footer.registeredOffice')}</span>
              No. 1 Bearing Soi 5, Sukhumvit 107, Bang Na Tai, Bang Na, Bangkok 10260, Thailand
            </p>
            <a
              href={mapLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[11.5px] text-foreground-700 transition-colors hover:text-primary-700"
            >
              <span className="flex h-3.5 w-3.5 items-center justify-center">
                <i className="ri-map-pin-line text-[13px]"></i>
              </span>
              {t('footer.viewMap')}
              <i className="ri-arrow-right-up-line text-[12px]"></i>
            </a>
          </div>
          <div>
            <h4 className={label}>{t('footer.contact')}</h4>
            <p className="text-[12px] text-foreground-700">
              <span className={sub}>{t('footer.phone')}</span>
              <a href="tel:+66655132007" className="hover:text-accent-700">+66 65 513 2007</a>
            </p>
            <p className="mt-3 text-[12px] text-foreground-700">
              <span className={sub}>{t('footer.email')}</span>
              <a href="mailto:dokkaebigolfthailand@gmail.com" className="break-all hover:text-accent-700">
                dokkaebigolfthailand@gmail.com
              </a>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-9 pt-9 md:grid-cols-[1fr_1.5fr_1fr] md:gap-10">
          <div>
            <h4 className={label}>{t('footer.koreaOffice')}</h4>
            <p className="text-[12px] text-foreground-800">STAR LOGISTICS CO., LTD.</p>
          </div>
          <div>
            <h4 className={label}>{t('footer.officeAddress')}</h4>
            <p className="max-w-sm text-[12px] leading-relaxed text-foreground-700">
              Room 1704, Building C, Songdo Centroad, 323 Incheon Tower-daero, Yeonsu-gu, Incheon, Republic of Korea
            </p>
          </div>
          <div>
            <h4 className={label}>{t('footer.contact')}</h4>
            <dl className="grid grid-cols-[54px_1fr] gap-y-2 text-[12px] text-foreground-700">
              <dt className="text-foreground-500">{t('footer.office')}</dt>
              <dd><a href="tel:+82322857735" className="hover:text-accent-700">+82 32 285 7735</a></dd>
              <dt className="text-foreground-500">{t('footer.direct')}</dt>
              <dd><a href="tel:+82322857745" className="hover:text-accent-700">+82 32 285 7745</a></dd>
              <dt className="text-foreground-500">{t('footer.fax')}</dt>
              <dd>+82 32 232 1633</dd>
              <dt className="text-foreground-500">{t('footer.email')}</dt>
              <dd><a href="mailto:hdu@star-logis.com" className="hover:text-accent-700">hdu@star-logis.com</a></dd>
            </dl>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-background-300 pt-5 text-[11px] text-foreground-500 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 OYO GOLF CO., LTD. {t('footer.rights')}</p>
          <p className="uppercase tracking-[0.16em]">Korea &middot; Thailand</p>
        </div>
      </div>
    </footer>
  );
}