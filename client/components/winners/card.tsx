"use client"

import { motion } from "framer-motion";
import { Award } from "lucide-react";
import { WinnersCategories } from "@/lib/schema";

interface WinnerCardProps {
    category: WinnersCategories;
    idx: number;
}

export function WinnerCard({ category, idx }: WinnerCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.03 }}
            // Объединяем стили для мобилок и десктопа (flex-col md:flex-row)
            className="group relative p-6 bg-white/[0.03] hover:bg-white/[0.06] transition-colors border-l-2 border-transparent hover:border-gold-500 flex flex-col md:flex-row items-start md:items-center gap-4 py-5"
        >
            <div className="flex-1 w-full">
                <div className="text-xs text-neutral-500 uppercase tracking-widest mb-1 group-hover:text-gold-400 transition-colors">
                    {category.nomination}
                </div>
                <div className="text-xl md:text-2xl text-white font-serif leading-tight">
                    {category.company}
                </div>
            </div>
            <Award className="w-6 h-6 text-gold-500/20 group-hover:text-gold-500 transition-colors shrink-0" />
        </motion.div>
    );
}