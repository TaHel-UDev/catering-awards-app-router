import { motion } from "framer-motion";
import Link from "next/link";
import { fadeUp } from "../shared/animations/fade-up";
import ImageProvider from "../shared/image-provider";
import { DirectusFile } from "@directus/sdk";
import { Schema } from "@/lib/schema";

interface Props {
    logotype: string | DirectusFile<Schema> | null;
}

export default function Logo({ ...props }: Props) {
    return (
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-8">
            <span className="h-[1px] w-8 bg-gold-400/50"></span>
            <Link href="/">
                <ImageProvider
                    src={props.logotype}
                    alt="Логотип"
                    width={300}
                    height={300}
                    className="w-[140px] h-[140px] md:w-[200px] md:h-[200px]"
                    unoptimized={true}
                />
            </Link>
            <span className="h-[1px] w-8 bg-gold-400/50"></span>
        </motion.div>
    )
}