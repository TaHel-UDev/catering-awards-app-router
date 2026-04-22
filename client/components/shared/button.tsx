import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
    "relative inline-flex items-center justify-center transition-all duration-500 font-sans font-medium tracking-[0.2em] uppercase overflow-hidden group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed isolate selection:bg-transparent",
    {
        variants: {
            variant: {
                primary:
                    "text-dark-950 before:absolute before:inset-0 before:-z-20 before:bg-gold-400 hover:before:bg-gold-300 before:transition-colors after:absolute after:inset-0 after:-z-10 after:bg-white/20 after:translate-y-full hover:after:translate-y-0 after:transition-transform after:duration-500 after:ease-out after:content-['']",
                outline:
                    "bg-transparent text-gold-300 border border-gold-400/30 hover:border-gold-400 hover:text-gold-200 hover:bg-gold-400/5",
                ghost:
                    "bg-transparent text-neutral-400 hover:text-white px-0 py-2",
            },
            size: {
                default: "text-xs px-8 py-4",
                sm: "text-[10px] px-6 py-3",
                lg: "text-xs md:text-sm px-12 py-5",
            },
            fullWidth: {
                true: "w-full",
            },
        },
        defaultVariants: {
            variant: "primary",
            size: "default",
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, fullWidth, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : "button"
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, fullWidth, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button, buttonVariants }