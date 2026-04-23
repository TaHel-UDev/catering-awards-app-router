"use client"

import Link from "next/link";
import { Button } from "../shared/button";
import DynamicIcon from "../shared/dynamic-icon";
import { Form, RegistrationsAdvantages } from "@/lib/schema";
import { useState } from "react";
import FormModal from "../shared/form-modal";

interface RegistrationCardProps {
    icon: string;
    subtitle: string | null;
    title: string | null;
    text: string | null;
    advantages?: RegistrationsAdvantages[] | null;
    buttonText: string | null;
    action_type?: 'link' | 'form';
    link?: string | null;
    form?: Form | null;
    className?: string;
    gradientClassName?: string;
    ulClassName?: string;
    textClassName?: string;
}

export default function RegistrationCard({
    icon,
    subtitle,
    title,
    text,
    advantages,
    buttonText,
    action_type = "link",
    link = "/",
    form,
    className = "",
    gradientClassName = "via-white/30",
    ulClassName = "space-y-3 mb-8",
    textClassName = "text-neutral-400 font-light leading-relaxed max-w-sm mb-8 whitespace-pre-line"
}: RegistrationCardProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <div className={`relative min-h-[500px] p-10 md:p-16 bg-[#0B0B0B] group overflow-hidden flex flex-col justify-between ${className}`}>
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent ${gradientClassName} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700`}></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="p-3 bg-white/5 rounded-full text-gold-500">
                            <DynamicIcon name={icon} />
                        </div>
                        <span className="text-xs uppercase tracking-widest text-gold-500">
                            {subtitle}
                        </span>
                    </div>
                    <h3 className="font-serif text-3xl md:text-4xl text-white mb-6 uppercase">
                        {title}
                    </h3>
                    <p className={textClassName}>
                        {text}
                    </p>
                    <ul className={ulClassName}>
                        {advantages?.map((b, i) => (
                            <li key={i} className="flex items-center gap-3 text-sm text-neutral-500">
                                <span className="w-1 h-1 bg-gold-500 rounded-full"></span>
                                {b.text}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="relative z-10 mt-auto">
                    {/* Рендерим кнопку в зависимости от action_type */}
                    {action_type === "form" && form ? (
                        <Button onClick={() => setIsModalOpen(true)} variant="primary" fullWidth>
                            {buttonText}
                        </Button>
                    ) : link && action_type === "link" ? (
                        <Button asChild variant="primary" fullWidth>
                            <Link href={link} target="_blank" rel="noopener noreferrer">
                                {buttonText}
                            </Link>
                        </Button>
                    ) : (
                        <Button variant="primary" fullWidth disabled>
                            {buttonText}
                        </Button>
                    )}
                </div>
            </div>

            {/* Рендерим модалку только если это форма и передан конфиг */}
            {action_type === "form" && form && (
                <FormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    config={form}
                />
            )}
        </>
    );
}