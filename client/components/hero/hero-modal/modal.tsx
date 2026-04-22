import { HeroSection } from "@/lib/schema";
import { AnimatePresence } from "framer-motion";
import { motion } from "framer-motion";
import ModalBlur from "./modal-blur";
import ModalClose from "./modal-close";
import ModalImage from "./modal-image";
import ModalGoalsList from "./modal-goals-list";

interface HeroAboutModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: HeroSection | null;
}

export default function Modal({ isOpen, onClose, data }: HeroAboutModalProps) {
    if (!data) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <ModalBlur onClose={onClose} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-[#111] border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl relative flex flex-col md:flex-row">
                            <ModalClose onClose={onClose} />

                            <ModalImage image={data.modal_image} />

                            <div className="w-full md:w-2/3 p-8 md:p-12">
                                <h2 className="font-serif text-3xl md:text-4xl text-white mb-6 uppercase">
                                    {data.modal_title}
                                </h2>

                                <p className="text-neutral-300 font-light leading-relaxed mb-8 border-l-2 border-gold-500 pl-4 whitespace-pre-line">
                                    {data.modal_text}
                                </p>

                                <ModalGoalsList
                                    title={data.modal_goals_title}
                                    goals={data.modal_goals_list}
                                />

                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}