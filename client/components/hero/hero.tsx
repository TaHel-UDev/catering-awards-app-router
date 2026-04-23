'use client'

import { useState } from "react";
import { HeroSection } from "@/lib/schema";
import { motion } from "framer-motion";
import { staggerChildren } from "../shared/animations/stagger-children";
import Modal from "./hero-modal/modal";
import FormModal from "../shared/form-modal";
import Logo from "./logo";
import Content from "./content";
import ButtonGroup from "./hero-modal/button-group";

export default function Hero({ ...props }: HeroSection) {
    // Разделяем стейты для двух разных модалок
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    return (
        <>
            {/* Старая модалка "Узнать больше" */}
            <Modal data={props} isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} />

            {/* Новая универсальная модалка с формой */}
            {props.action_type === "form" && props.form && (
                <FormModal
                    isOpen={isFormModalOpen}
                    onClose={() => setIsFormModalOpen(false)}
                    config={props.form}
                    sourceName="Главный экран (Hero)"
                />
            )}

            <div className="relative min-h-screen flex flex-col justify-center items-center bg-dark-950 overflow-hidden px-6">
                <div className="absolute inset-0 bg-luxury-gradient z-0" />

                <>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-white/5 z-0" />
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[1px] bg-white/5 z-0" />
                </>

                <div className="relative z-10 max-w-[1400px] w-full mx-auto grid grid-cols-1 place-items-center">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerChildren}
                        className="text-center"
                    >
                        <Logo {...props} />

                        <Content {...props} />

                        {/* Передаем оба стейта в кнопки */}
                        <ButtonGroup
                            {...props}
                            setIsInfoModalOpen={setIsInfoModalOpen}
                            setIsFormModalOpen={setIsFormModalOpen}
                        />
                    </motion.div>
                </div>
            </div>
        </>
    )
}