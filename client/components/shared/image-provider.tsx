import Image from 'next/image';

interface Props {
    src: string | { id: string;[key: string]: any } | null;
    alt: string;
    width?: number;
    height?: number;
    fill?: boolean;
    quality?: number;
    className?: string;
    priority?: boolean;
    unoptimized?: boolean;
}

const ImageProvider = ({
    src,
    alt,
    width,
    height,
    fill = false,
    quality = 90,
    className,
    priority = false,
    unoptimized = false,
}: Props) => {
    const DIRECTUS_URL = process.env.NEXT_PUBLIC_DIRECTUS_URL || '';

    const getFullSrc = () => {
        if (!src) return '';

        // Магия здесь: если src это объект и в нем есть id, забираем id. Иначе берем сам src.
        const fileId = typeof src === 'object' && 'id' in src ? src.id : src;

        // Защита от кривых данных: если после всех проверок это не строка, возвращаем пустоту
        if (typeof fileId !== 'string') return '';

        const cleanPath = fileId.startsWith('/') ? fileId.slice(1) : fileId;

        return `${DIRECTUS_URL}/assets/${cleanPath}`;
    };

    const imageSource = getFullSrc();
    if (!imageSource) return null;

    return (
        <Image
            src={imageSource}
            alt={alt || "Image"}
            width={!fill ? width : undefined}
            height={!fill ? height : undefined}
            fill={fill}
            quality={quality}
            className={className}
            priority={priority}
            style={fill ? { objectFit: 'cover' } : undefined}
            unoptimized={unoptimized}
        />
    );
};

export default ImageProvider;