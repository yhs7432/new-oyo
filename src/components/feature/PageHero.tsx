import { Link } from 'react-router-dom';

type Crumb = { label: string; to?: string };

export default function PageHero({
  eyebrow,
  title,
  lead,
  leadLine1,
  leadLine2,
  crumbs,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  leadLine1?: string;
  leadLine2?: string;
  crumbs: Crumb[];
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="border-b border-background-200 bg-background-100 px-5 pb-10 pt-10 md:px-10 md:pb-14 md:pt-14">
      <div className="mx-auto w-full max-w-[1320px]">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[11px] text-foreground-500">
          {crumbs.map((crumb, index) => (
            <span key={crumb.label} className="flex items-center gap-2">
              {index > 0 && <i className="ri-arrow-right-s-line text-[12px]"></i>}
              {crumb.to ? (
                <Link to={crumb.to} className="hover:text-primary-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-foreground-700">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div className={`mt-6 flex flex-col gap-8 ${image ? 'lg:flex-row lg:items-center lg:gap-12' : ''}`}>
          <div className="flex-1">
            <p className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-accent-600">
              <span className="inline-block h-px w-7 bg-accent-500"></span>
              {eyebrow}
            </p>
            <h1 className="mt-4 font-heading text-[28px] leading-[1.3] text-foreground-950 md:text-[40px] md:leading-[1.25]">
              {title}
            </h1>
            {leadLine1 && leadLine2 ? (
              <p className="mt-4 max-w-xl text-[13px] leading-[1.9] text-foreground-600 md:text-[14px]">
                <span className="block break-keep">{leadLine1}</span>
                <span className="mt-1 block break-keep text-foreground-500">{leadLine2}</span>
              </p>
            ) : (
              <p className="mt-4 max-w-xl text-[13px] leading-[1.9] text-foreground-600 md:text-[14px]">{lead}</p>
            )}
          </div>
          {image && (
            <div className="w-full shrink-0 overflow-hidden rounded-lg bg-background-200 lg:w-[42%]">
              <div className="aspect-[16/10] w-full">
                <img
                  src={image}
                  alt={imageAlt ?? title}
                  title={imageAlt ?? title}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}