import Link from "next/link";
import directus from "@/lib/directus";
import { readSingleton } from "@directus/sdk";
import { FooterSection } from "@/lib/schema";

export default async function Footer() {
    const data = await directus.request<FooterSection>(readSingleton('footer_section'));

    const title = data.title || 'Премия "Кейтеринг года"';
    const description = data.description || 'Независимая профессиональная премия, отмечающая лучшие компании в сфере выездного ресторанного обслуживания.';
    const copyright = data.copyright || 'Премия "Кейтеринг года". Все права защищены.';

    const navLinks = data.navigation || [];
    const contactLinks = data.contacts || [];

    return (
        <footer className="bg-black pt-24 pb-12 border-t border-white/10" id="contacts">
            <div className="max-w-[1200px] mx-auto px-6">
                <div className="grid md:grid-cols-4 gap-12 mb-20">
                    <div className="col-span-2">
                        <h2 className="font-serif text-3xl text-gold-500 mb-6">{title}</h2>
                        <p className="text-neutral-500 text-sm leading-relaxed max-w-md whitespace-pre-line">
                            {description}
                        </p>
                        <Link href="/privacy-policy.pdf" target="_blank" className="mt-4 inline-block text-neutral-500 text-sm leading-relaxed max-w-md whitespace-pre-line hover:text-gold-400 transition-colors">Политика конфиденциальности</Link>
                    </div>

                    <div>
                        <h4 className="text-white text-xs uppercase tracking-widest mb-6">Навигация</h4>
                        <ul className="space-y-4 text-sm text-neutral-400">
                            {navLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.url} className="hover:text-gold-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            {navLinks.length === 0 && <li>Ссылки скоро появятся</li>}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-white text-xs uppercase tracking-widest mb-6">Контакты</h4>
                        <ul className="space-y-4 text-sm text-neutral-400">
                            {contactLinks.map((link, idx) => (
                                <li key={idx}>
                                    <Link href={link.url} className="hover:text-gold-400 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            {contactLinks.length === 0 && <li>Контакты скоро появятся</li>}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-neutral-600 gap-4">
                    <p>© {new Date().getFullYear()} {copyright}</p>
                </div>
            </div>
        </footer>
    );
}