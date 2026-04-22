import SectionHeader from "../shared/section-header";
import { PartnersSection, PartnerCategory, Partner } from "@/lib/schema"; // Убедись в правильном пути
import Section from "../shared/section";
import { PartnerCard } from "./card";

export default function Partners({ ...props }: PartnersSection) {
    const categoriesList = props.categories || [];

    if (categoriesList.length === 0) return null;

    return (
        <Section className="border-t border-white/5 pb-6 md:pb-24" id="partners">
            <div className="max-w-[1200px] mx-auto px-4">
                <div className="w-full text-center">
                    <SectionHeader title={props.title || "Партнеры"} align="center" />
                </div>

                <div className="space-y-10 sm:space-y-12">
                    {categoriesList.map((junction, index) => {
                        // 1. Пропускаем, если junction пришел просто как число (ID), а не как объект
                        if (typeof junction === 'number') return null;

                        // 2. Достаем саму категорию из поля item
                        const category = junction.item;

                        // Защита, если категория пришла как строка (ID) или её нет
                        if (!category || typeof category === 'string') return null;

                        // Приводим к типу PartnerCategory для уверенности
                        const catData = category as PartnerCategory;

                        // 3. Достаем партнеров
                        const partners = catData.partners || [];
                        const count = partners.length;

                        if (count === 0) return null;

                        return (
                            <div key={catData.id || index}>
                                <h3 className="text-2xs border-b border-gold-500 mb-4 pb-4 text-center uppercase tracking-widest text-white/80">
                                    {catData.title}
                                </h3>

                                <div className="flex flex-wrap justify-center gap-4 w-full">
                                    {partners.map((partner) => {
                                        // Защита: если партнер пришел как число (ID), пропускаем
                                        if (typeof partner === 'number') return null;

                                        return (
                                            <PartnerCard
                                                key={partner.id}
                                                partner={partner as Partner}
                                                isSingle={count === 1}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Section>
    );
}