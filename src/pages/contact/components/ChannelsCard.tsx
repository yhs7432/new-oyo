import { useTranslation } from 'react-i18next';
import { channels, mapLink } from '@/config/channels';

const item =
  'group flex cursor-pointer items-center gap-3 rounded-md border border-background-200 bg-background-50 px-3.5 py-3 transition-colors hover:border-primary-400';
const bubble =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-100 text-[15px] text-secondary-900';
const name = 'block text-[12.5px] font-medium text-foreground-900';
const handle = 'block truncate text-[11px] text-foreground-500';

export default function ChannelsCard() {
  const { t } = useTranslation();

  return (
    <div className="rounded-lg border border-background-200 bg-background-100 p-5 md:p-7">
      <h2 className="font-heading text-[20px] leading-snug text-foreground-950 md:text-[24px]">
        {t('contactPage.channelsTitle')}
      </h2>
      <p className="mt-2 text-[12px] leading-relaxed text-foreground-600">
        <span className="block break-keep">{t('contactPage.channelsLine1')}</span>
        <span className="mt-1 block break-keep text-foreground-500">{t('contactPage.channelsLine2')}</span>
      </p>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {channels.map((channel) => (
          <a
            key={channel.id}
            href={channel.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={channel.name}
            className={item}
          >
            <span className={bubble}>
              <i className={channel.icon}></i>
            </span>
            <span className="min-w-0">
              <span className={name}>{channel.name}</span>
              <span className={handle}>{channel.handle}</span>
            </span>
            <i className="ri-arrow-right-up-line ml-auto text-[13px] text-foreground-400 transition-colors group-hover:text-primary-600"></i>
          </a>
        ))}
        <a
          href={mapLink}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('contactPage.mapLinkLabel')}
          className={item}
        >
          <span className={bubble}>
            <i className="ri-map-pin-line"></i>
          </span>
          <span className="min-w-0">
            <span className={name}>{t('contactPage.mapLinkLabel')}</span>
            <span className={handle}>Google Maps</span>
          </span>
          <i className="ri-arrow-right-up-line ml-auto text-[13px] text-foreground-400 transition-colors group-hover:text-primary-600"></i>
        </a>
      </div>
    </div>
  );
}