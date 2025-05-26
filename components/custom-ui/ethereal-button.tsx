import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const etherealButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inchworm focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:h-4 [&_svg]:w-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-inchworm text-gunmetal hover:bg-inchworm/90 active:bg-inchworm/80 shadow-sm hover:shadow-md",
        secondary:
          "bg-gunmetal text-white hover:bg-gunmetal/90 active:bg-gunmetal/80 shadow-sm hover:shadow-md",
        tertiary:
          "border border-american-silver bg-white text-gunmetal hover:bg-grey-100 active:bg-grey-300",
        warning:
          "bg-orange text-white hover:bg-orange/90 active:bg-orange/80 shadow-sm hover:shadow-md",
        ghost:
          "text-gunmetal hover:bg-grey-100 active:bg-grey-300",
        link:
          "text-gunmetal underline-offset-4 hover:underline hover:text-inchworm",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8 text-base",
        xl: "h-12 rounded-md px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface EtherealButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof etherealButtonVariants> {
  asChild?: boolean
}

const EtherealButton = React.forwardRef<HTMLButtonElement, EtherealButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(etherealButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
EtherealButton.displayName = "EtherealButton"

export { EtherealButton, etherealButtonVariants }