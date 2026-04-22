import Link from "next/link";
import { CtaSection } from "@/lib/schema";
import { Button } from "../shared/button";

export default function CTA({ ...props }: CtaSection) {
    const title = props.title || "Станьте частью истории\nкейтеринг-индустрии";
    const text = props.text || "Заявите о себе, получите признание экспертов и расширьте деловые связи на главной премии года.";
    const buttonText = props.button_text || "Подать заявку";
    const buttonLink = props.button_link || "/";

    return (
        <section className="py-32 bg-gold-600 relative overflow-hidden">
            <div className="max-w-[1200px] mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 text-center md:text-left">
                <div>
                    <h2 className="font-serif text-4xl md:text-5xl text-white mb-4 leading-tight whitespace-pre-line">
                        {title}
                    </h2>
                    <p className="text-gold-100/90 text-lg max-w-xl">
                        {text}
                    </p>
                </div>

                <div className="shrink-0">
                    {buttonLink && buttonLink !== "/" ? (
                        <Button
                            asChild
                            className="bg-white text-black/90 shadow-2xl"
                            size="lg"
                            variant="outline"
                        >
                            <Link href={buttonLink} target="_blank" rel="noopener noreferrer">
                                {buttonText}
                            </Link>
                        </Button>
                    ) : (
                        <Button
                            className="bg-white text-black/90 shadow-2xl"
                            size="lg"
                            variant="outline"
                            disabled
                        >
                            {buttonText}
                        </Button>
                    )}
                </div>
            </div>
        </section>
    );
}