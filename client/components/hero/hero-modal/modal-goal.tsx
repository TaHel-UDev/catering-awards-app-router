import DynamicIcon from "@/components/shared/dynamic-icon";
import { Goals } from "@/lib/schema";

interface Props {
    goals: Goals;
}

export default function ModalGoal({ ...props }: Props) {
    return (
        <div className="flex items-start gap-3">
            <DynamicIcon
                name={props.goals.icon}
                className="w-5 h-5 text-gold-500 shrink-0 mt-0.5"
            />
            <span className="text-sm text-neutral-300">{props.goals.text}</span>
        </div>
    )
}