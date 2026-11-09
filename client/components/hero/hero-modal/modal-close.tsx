import { X } from "lucide-react";

interface Props {
    onClose: () => void;
}

export default function ModalClose({ onClose }: Props) {
    return (
        <button
            type="button"
            aria-label="Закрыть окно о премии"
            onClick={onClose}
            className="absolute top-4 right-4 z-10 cursor-pointer bg-[#111] p-2 text-neutral-400 transition-colors hover:text-white"
        >
            <X size={24} aria-hidden="true" />
        </button>
    )
}
