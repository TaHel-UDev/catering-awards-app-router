interface Props {
    image: string | { id: string;[key: string]: any } | null;
}

export default function ModalImage({ ...props }: Props) {
    return (
        <div className="hidden md:block w-1/3 bg-neutral-900 relative overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center opacity-40"
                style={{ backgroundImage: `url('${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${props.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent"></div>
        </div>
    )
}