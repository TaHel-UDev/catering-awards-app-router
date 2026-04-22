import DynamicIcon from "@/components/shared/dynamic-icon";
import { Goals } from "@/lib/schema";
import ModalGoal from "./modal-goal";

interface Props {
    title: string | null;
    goals: Goals[] | null;
}

export default function ModalGoalsList({ ...props }: Props) {
    return (
        <div className="space-y-6">
            <h4 className="text-xs uppercase tracking-widest text-neutral-500 mb-4">
                {props.title}
            </h4>
            <div className="grid sm:grid-cols-1 gap-4">
                <div className="flex flex-col gap-4">
                    {props.goals?.map((goal, idx) => (
                        <ModalGoal
                            key={idx}
                            goals={goal}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
}