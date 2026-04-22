"use client"

import dynamic from 'next/dynamic';
import dynamicIconImports from 'lucide-react/dynamicIconImports';
import { LucideProps, Construction } from 'lucide-react';

interface DynamicIconProps extends LucideProps {
    name: string;
}

const pascalToKebab = (str: string) =>
    str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

const iconCache: Record<string, React.ElementType> = {};

export default function DynamicIcon({ name, ...props }: DynamicIconProps) {
    if (process.env.NODE_ENV === 'development') {
        return <Construction {...props} />;
    }

    const kebabName = pascalToKebab(name);

    if (!(kebabName in dynamicIconImports)) {
        console.warn(`Иконка ${name} не найдена в lucide-react`);
        return <Construction {...props} />;
    }

    if (!iconCache[kebabName]) {
        iconCache[kebabName] = dynamic(
            dynamicIconImports[kebabName as keyof typeof dynamicIconImports],
            {
                ssr: false,
                loading: () => <div className="w-5 h-5 bg-neutral-800 rounded-full animate-pulse shrink-0" />,
            }
        );
    }
    const IconComponent = iconCache[kebabName];

    return <IconComponent {...props} />;
}