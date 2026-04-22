import { cn } from "@/lib/utils";
import { Partner } from "@/lib/schema";
import Image from "next/image";

interface PartnerCardProps {
    partner: Partner;
    isSingle?: boolean;
}

export function PartnerCard({ partner, isSingle = false }: PartnerCardProps) {
    const cardContent = (
        <div className="flex-1 flex items-center justify-center min-h-0 min-w-0 p-4 sm:p-6">
            {partner.logo_image ? (
                <div className="relative w-full h-full min-h-[60px] flex items-center justify-center">
                    <Image
                        src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${typeof partner.logo_image === 'object' && partner.logo_image !== null
                            ? partner.logo_image.id
                            : partner.logo_image
                            }`}
                        alt={partner.name || "Логотип партнера"}
                        fill
                        unoptimized
                        className={cn(
                            "object-contain",
                            !partner.is_colored && "grayscale invert brightness"
                        )}
                    />
                </div>
            ) : (
                <span className="font-serif text-xs font-medium uppercase text-white/50 tracking-wider text-center">
                    {partner.name}
                </span>
            )}
        </div>
    );

    const cardClassName = cn(
        "h-28 border border-white/5 bg-[#171717] flex transition-all duration-300 group hover:bg-white/[0.05]",
        isSingle
            ? "flex-[0_1_calc(100%-0px)] min-w-[200px] max-w-[280px]"
            : "flex-[0_1_calc(50%-12px)] md:flex-[0_1_calc(33.333%-16px)] lg:flex-[0_1_calc(25%-18px)] min-w-[140px]"
    );

    if (partner.link) {
        return (
            <a href={partner.link} target="_blank" rel="noopener noreferrer" className={cardClassName}>
                {cardContent}
            </a>
        );
    }

    return <div className={cardClassName}>{cardContent}</div>;
}