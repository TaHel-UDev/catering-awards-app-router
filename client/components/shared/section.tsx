import React, { ReactNode } from 'react';

interface SectionProps {
    children: ReactNode;
    className?: string;
    id?: string;
    noPadding?: boolean;
}

const Section: React.FC<SectionProps> = ({ children, className = "", id, noPadding = false }) => {
    return (
        <section id={id} className={`w-full relative z-10 ${className}`}>
            <div className={`max-w-[1200px] mx-auto px-6 md:px-8 ${noPadding ? '' : 'pt-6 md:pt-24'}`}>
                {children}
            </div>
        </section>
    );
};

export default Section
