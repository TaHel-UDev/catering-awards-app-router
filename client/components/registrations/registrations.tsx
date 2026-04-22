import { Sparkles, Ticket } from "lucide-react";
import Section from "../shared/section";
import { Button } from "../shared/button";
import Link from "next/link";
import { RegistrationsSection } from "@/lib/schema";
import DynamicIcon from "../shared/dynamic-icon";
import RegistrationCard from "./card";

export default function Registrations({ ...props }: RegistrationsSection) {
    return (
        <Section id="registration" className="relative z-20">
            <div className="grid grid-cols-1 md:grid-cols-2 shadow-2xl shadow-black/50">

                <RegistrationCard
                    icon={props.guests_icon}
                    subtitle={props.guests_subtitle}
                    title={props.guests_title}
                    text={props.guests_text}
                    advantages={props.guests_advantages}
                    buttonText={props.guests_button}
                    link={props.guests_link}
                    className="border-y md:border-l border-white/10 md:col-start-1 md:row-start-1"
                    gradientClassName="via-white/30"
                    ulClassName="space-y-3"
                    textClassName="text-neutral-400 font-light leading-relaxed max-w-sm mb-3 whitespace-pre-line"
                />

                <RegistrationCard
                    icon={props.nominees_icon}
                    subtitle={props.nominees_subtitle}
                    title={props.nominees_title}
                    text={props.nominees_text}
                    advantages={props.nominees_advantages}
                    buttonText={props.nominees_button}
                    link={props.nominees_link}
                    className="border border-white/10 md:col-start-2"
                    gradientClassName="via-gold-500/50"
                />

            </div>
        </Section>
    )
}