import { motion } from "framer-motion"
import { fadeUp } from "../shared/animations/fade-up"

interface Props {
    title_up: string | null;
    title_down: string | null;
    description: string | null;
}

export default function Content({ ...props }: Props) {
    return (
        <>
            <motion.h1 variants={fadeUp} className="font-serif text-[10vw] md:leading-[1.2] leading-[1.6] md:text-[4rem] lg:text-[6rem] text-white whitespace-nowrap mb-6 uppercase">
                <span className="block">
                    {props.title_up}
                </span>

                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-200 via-gold-400 to-gold-700 font-light transform -translate-y-4 uppercase">
                    {props.title_down}
                </span>
            </motion.h1>

            <motion.p variants={fadeUp} className="max-w-2xl mx-auto text-neutral-400 font-light text-lg leading-relaxed mb-12">
                {props.description}
            </motion.p>
        </>
    )
}