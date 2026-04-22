"use client"

import { motion } from "framer-motion";

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    align?: 'left' | 'center';
    large?: boolean;
}

export default function SectionHeader({
    title,
    subtitle,
    align = 'left',
    large = false
}: SectionHeaderProps) {
    return (
        <div className={`mb-6 lg:mb-20 ${align === 'center' ? 'text-center' : ''}`}>
            <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`font-serif text-white mb-6 leading-[1.1] ${large ? 'text-5xl md:text-7xl' : 'text-4xl md:text-5xl'}`}
            >
                {title}
            </motion.h2>
            {subtitle && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className={`text-neutral-400 font-light text-lg md:text-xl max-w-2xl leading-relaxed ${align === 'center' ? 'mx-auto' : ''}`}
                >
                    {subtitle}
                </motion.p>
            )}
        </div>
    );
}