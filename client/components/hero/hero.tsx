'use client'

import { useState } from "react";
import { HeroSection } from "@/lib/schema";
import { motion } from "framer-motion";
import { staggerChildren } from "../shared/animations/stagger-children";
import Modal from "./hero-modal/modal";
import Logo from "./logo";
import Content from "./content";
import { Button } from "../shared/button";
import Link from "next/link";
import { fadeUp } from "../shared/animations/fade-up";
import ButtonGroup from "./hero-modal/button-froup";

interface HeroProps {
}

export default function Hero({ ...props }: HeroSection) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Modal data={props} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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

                        <ButtonGroup {...props} setIsModalOpen={setIsModalOpen} />
                    </motion.div>
                </div>
            </div>
        </>
    )
}