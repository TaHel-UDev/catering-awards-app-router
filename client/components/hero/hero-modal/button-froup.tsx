import { fadeUp } from "@/components/shared/animations/fade-up";
import { Button } from "@/components/shared/button";
import { motion } from "framer-motion";
import Link from "next/link";

interface Props {
    registration_link: string | null;
    registration_button: string | null;
    setIsModalOpen: (value: boolean) => void;
}

export default function ButtonGroup({ ...props }: Props) {
    return (
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            {props.registration_link ? (
                <Button asChild size="lg">
                    <Link href={props.registration_link} target="_blank" rel="noopener noreferrer">
                        {props.registration_button}
                    </Link>
                </Button>
            ) : (
                <Button size="lg" disabled>
                    {props.registration_button}
                </Button>
            )}

            <Button variant="ghost" onClick={() => props.setIsModalOpen(true)} className="border-b border-gold-400/30 hover:border-gold-400 transition-colors">
                Узнать больше
            </Button>
        </motion.div>
    )
}