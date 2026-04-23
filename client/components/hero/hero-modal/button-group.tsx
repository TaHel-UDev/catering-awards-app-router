import { fadeUp } from "@/components/shared/animations/fade-up";
import { Button } from "@/components/shared/button";
import { motion } from "framer-motion";
import Link from "next/link";
import { Form } from "@/lib/schema";

interface Props {
    registration_link: string | null;
    registration_button: string | null;
    setIsInfoModalOpen: (value: boolean) => void;
    setIsFormModalOpen: (value: boolean) => void;
    action_type: string | null;
    form: Form | any;
}

export default function ButtonGroup({ ...props }: Props) {
    return (
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-8 justify-center items-center">
            <div className="relative z-10 w-full sm:w-auto mt-auto">
                {props.action_type === "form" && props.form ? (
                    <Button size="lg" onClick={() => props.setIsFormModalOpen(true)} variant="primary" fullWidth>
                        {props.registration_button}
                    </Button>
                ) : props.registration_link && props.action_type === "link" ? (
                    <Button asChild size="lg" variant="primary" fullWidth>
                        <Link href={props.registration_link} target="_blank" rel="noopener noreferrer">
                            {props.registration_button}
                        </Link>
                    </Button>
                ) : (
                    <Button variant="primary" size="lg" fullWidth disabled>
                        {props.registration_button}
                    </Button>
                )}
            </div>

            <Button
                size="lg"
                variant="ghost"
                onClick={() => props.setIsInfoModalOpen(true)}
                className="border-b border-gold-400/30 hover:border-gold-400 transition-colors"
            >
                Узнать больше
            </Button>
        </motion.div>
    )
}