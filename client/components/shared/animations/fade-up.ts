import { Variants } from "framer-motion";

export const fadeUp: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 1, ease: [0.22, 1, 0.36, 1] }
    }
};