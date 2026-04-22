import { motion } from "framer-motion";

interface Props {
    onClose: () => void;
}

export default function ModalBlur({ onClose }: Props) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        />
    )
}