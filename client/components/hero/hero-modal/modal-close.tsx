import { motion } from "framer-motion";
import { X } from "lucide-react";

interface Props {
    onClose: () => void;
}

export default function ModalClose({ onClose }: Props) {
    return (
        <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors z-10 p-2 cursor-pointer"
        >
            <X size={24} />
        </button>
    )
}