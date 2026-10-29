import type { LaureatesSection } from "@/lib/schema";
import Section from "../shared/section";
import SectionHeader from "../shared/section-header";
import Cities from "./cities";

export default function Laureates({ enabled, title, subtitle, companies, cities, cities_font_size, cities_mobile_font_size, cities_marquee, cities_scroll_duration }: LaureatesSection) {
    const names = companies?.filter((company) => company.name?.trim()) || [];
    if (enabled === false || names.length === 0) return null;

    return (
        <Section id="laureates" className="overflow-hidden bg-dark-950 pb-6 md:pb-24">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(197,160,40,0.06),transparent_70%)]" />
            <div className="relative">
                <div aria-hidden="true" className="mx-auto mb-8 flex items-center justify-center gap-4">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500/50" />
                    <span className="size-1.5 rotate-45 bg-gold-400" />
                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500/50" />
                </div>
                <div className="mx-auto max-w-3xl [&_h2]:text-balance [&_h2]:leading-tight [&_p]:text-pretty">
                    <SectionHeader title={title || ""} subtitle={subtitle || undefined} align="center" />
                </div>
                <ul className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-7 gap-y-5 md:gap-x-10 md:gap-y-7">
                    {names.map((company, index) => (
                        <li key={index} className={`max-w-full break-words text-center font-serif text-xl leading-relaxed md:text-2xl ${company.highlighted ? "font-semibold text-gold-200" : "font-light text-neutral-400"}`}>
                            {company.name}
                        </li>
                    ))}
                </ul>
                {cities?.trim() && (
                    <div className="mt-10 text-center md:mt-14">
                        <Cities
                            cities={cities}
                            cities_font_size={cities_font_size}
                            cities_mobile_font_size={cities_mobile_font_size}
                            cities_marquee={cities_marquee}
                            cities_scroll_duration={cities_scroll_duration}
                        />
                    </div>
                )}
            </div>
        </Section>
    );
}
