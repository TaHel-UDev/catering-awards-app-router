import type { CSSProperties } from "react";
import type { LaureatesSection } from "@/lib/schema";
import styles from "./cities.module.css";

type CitiesProps = Pick<LaureatesSection,
    "cities" | "cities_font_size" | "cities_mobile_font_size" | "cities_marquee" | "cities_scroll_duration"
>;

export default function Cities({ cities, cities_font_size, cities_mobile_font_size, cities_marquee, cities_scroll_duration }: CitiesProps) {
    if (!cities?.trim()) return null;

    const style = {
        "--cities-font-size": `${Math.min(32, Math.max(10, cities_font_size ?? 18))}px`,
        "--cities-mobile-font-size": `${Math.min(32, Math.max(10, cities_mobile_font_size ?? 16))}px`,
        "--cities-duration": `${Math.min(180, Math.max(10, cities_scroll_duration ?? 60))}s`,
    } as CSSProperties;
    const text = cities.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).join(" · ");
    const cityNames = text.split(/\s*·\s*/).filter(Boolean);
    const content = cityNames.map((city, index) => (
        <span key={index}>
            {index > 0 && <span className={styles.separator}>·</span>}
            {city}
        </span>
    ));

    return (
        <div style={style} className={`${styles.root} text-neutral-300`}>
            {cities_marquee === false ? (
                <p className={styles.staticText}>{cities}</p>
            ) : (
                <>
                    <p className="sr-only">{cities}</p>
                    <div
                        className={`${styles.viewport} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold-500`}
                        tabIndex={0}
                        role="group"
                        aria-label="Города лауреатов"
                        title="Прокрутка приостанавливается при наведении курсора или фокусе с клавиатуры."
                    >
                        <div className={styles.track} aria-hidden="true">
                            <span className={styles.copy}>{content}</span>
                            <span className={styles.copy}>{content}</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
