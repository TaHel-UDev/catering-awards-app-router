'use client'

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Star, ChevronDown, ChevronUp, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import * as XLSX from "xlsx";
import Section from "../shared/section";
import { Button } from "../shared/button";
import SectionHeader from "../shared/section-header";
import { WinnersSection, WinnersCategories } from "@/lib/schema";
import { WinnerCard } from "./card";
import DynamicIcon from "../shared/dynamic-icon";

const MOBILE_CARDS_VISIBLE = 4;

export default function Winners({ ...props }: WinnersSection) {
    const [expanded, setExpanded] = useState(false);
    const [mobileCardsExpanded, setMobileCardsExpanded] = useState(false);

    // Подстраховка: если в JSON всё еще приходят данные (пока ты их не удалил из админки)
    const fallbackCategories = props.categories || [];

    const [categories, setCategories] = useState<WinnersCategories[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchAndParseExcel = async () => {
            const fileId = typeof props.file === 'object' && props.file !== null ? props.file.id : props.file;

            if (!fileId) {
                setCategories(fallbackCategories);
                setIsLoading(false);
                return;
            }

            try {
                // ВАЖНО: Если переменная окружения пустая, подставь сюда свой URL Директуса жестко для проверки
                // Например: const baseUrl = 'http://localhost:8055';
                const baseUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';
                const fileUrl = `${baseUrl}/assets/${fileId}`;

                const response = await fetch(fileUrl);

                if (!response.ok) {
                    throw new Error(`Не удалось скачать файл: ${response.status} ${response.statusText}. Проверь URL (${fileUrl}) и настройки CORS в Directus.`);
                }

                const arrayBuffer = await response.arrayBuffer();

                // Читаем Excel файл
                const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];

                // Конвертируем в плоский массив
                const rawData = XLSX.utils.sheet_to_json(worksheet);

                // Маппим колонки (по твоему скриншоту колонки называются "Номинация" и "Компания")
                const formattedCategories = rawData.map((row: any) => ({
                    nomination: row['Номинация'] || 'Без номинации',
                    company: row['Компания'] || 'Не указана',
                }));

                if (formattedCategories.length === 0) {
                    throw new Error("Файл прочитан, но он пустой или названия колонок не совпадают с 'Номинация' и 'Компания'.");
                }

                setCategories(formattedCategories);
                setError(null);

            } catch (err: any) {
                console.error("Ошибка парсинга Excel:", err);
                setError(err.message);

                // Если Excel упал, но есть старые данные из JSON, показываем их
                if (fallbackCategories.length > 0) {
                    setCategories(fallbackCategories);
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchAndParseExcel();
    }, [props.file]);

    const visibleOnMobile = mobileCardsExpanded ? categories : categories.slice(0, MOBILE_CARDS_VISIBLE);
    const hasMoreOnMobile = categories.length > MOBILE_CARDS_VISIBLE;

    return (
        <Section id="winners" className="pb-6 md:pb-24">
            <div className="grid lg:grid-cols-12 gap-12 items-start">
                <div className="lg:col-span-4 lg:sticky top-24">
                    <SectionHeader
                        title={props.title || "Победители"}
                        subtitle={props.subtitle || "Лучшие компании по итогам прошедшего года"}
                    />
                    <div className="p-8 border border-gold-500/20 bg-gold-500/5 relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 text-gold-500 opacity-10">
                            <DynamicIcon name={props.icon} size={120} />
                        </div>
                        <div className="relative z-10">
                            <span className="block text-6xl font-serif text-gold-400 mb-2">
                                {props.year}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div className="bg-white/5 p-8 md:p-12 border border-white/10">
                        <div className={cn(
                            "relative overflow-hidden transition-all duration-500",
                            !expanded ? "max-h-[200px]" : "max-h-none"
                        )}>
                            <p className="text-neutral-300 leading-relaxed whitespace-pre-line text-lg mb-8">
                                {props.description}
                            </p>
                            {!expanded && (
                                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#111] to-transparent pointer-events-none" />
                            )}
                        </div>

                        {!expanded ? (
                            <div className="mt-4 flex justify-center">
                                <Button
                                    onClick={() => setExpanded(true)}
                                    className="bg-gold-500 text-black hover:bg-gold-400"
                                >
                                    Читать далее <ChevronDown className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5 }}
                            >
                                {props.intro_text && (
                                    <h3 className="font-serif text-2xl text-white mb-8 mt-8 border-l-4 border-gold-500 pl-4 py-1">
                                        {props.intro_text}
                                    </h3>
                                )}

                                {/* Вывод ошибки, если Excel не смог распарситься */}
                                {error && (
                                    <div className="mb-8 p-4 bg-red-500/10 border border-red-500/50 rounded-lg flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <p className="text-red-400 text-sm leading-relaxed">{error}</p>
                                    </div>
                                )}

                                {isLoading ? (
                                    <div className="flex justify-center items-center py-12 text-gold-500">
                                        <Loader2 className="w-8 h-8 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-4 mb-12">
                                        {/* Мобильная версия списка */}
                                        <div className="md:hidden space-y-4">
                                            {visibleOnMobile.map((cat, idx) => (
                                                <WinnerCard key={idx} category={cat} idx={idx} />
                                            ))}

                                            {hasMoreOnMobile && !mobileCardsExpanded && (
                                                <div className="pt-2 flex justify-center">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setMobileCardsExpanded(true)}
                                                        className="border-gold-500/30 text-gold-400 hover:bg-gold-500/10"
                                                    >
                                                        Показать всех победителей ({categories.length}) <ChevronDown className="ml-2 w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}

                                            {hasMoreOnMobile && mobileCardsExpanded && (
                                                <div className="pt-2 flex justify-center">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setMobileCardsExpanded(false)}
                                                        className="text-neutral-500 hover:text-white"
                                                    >
                                                        Свернуть <ChevronUp className="ml-2 w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Десктопная версия списка */}
                                        <div className="hidden md:block space-y-4">
                                            {categories.map((cat, idx) => (
                                                <WinnerCard key={idx} category={cat} idx={idx} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Спец. номинация */}
                                {props.special_nomination && (
                                    <div className="bg-gold-500/10 border border-gold-500/20 p-8 mb-8">
                                        <div className="flex items-start gap-4">
                                            <Star className="w-8 h-8 text-gold-500 mt-1 shrink-0" />
                                            <div>
                                                <h4 className="font-serif text-xl text-gold-400 mb-2">Специальная номинация</h4>
                                                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">
                                                    {props.special_nomination}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-8 border-t border-white/10">
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setExpanded(false);
                                            document.getElementById('winners')?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                        className="text-neutral-500 hover:text-white"
                                    >
                                        Свернуть <ChevronUp className="ml-2 w-4 h-4" />
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
            </div>
        </Section>
    );
}