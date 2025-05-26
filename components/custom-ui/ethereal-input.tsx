import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const etherealInputVariants = cva(
  "flex w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 placeholder:text-grey-500 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: 
          "h-10 border border-american-silver bg-white text-gunmetal focus:border-inchworm focus:outline-none focus:ring-2 focus:ring-inchworm focus:ring-offset-2",
        ghost:
          "h-10 border border-transparent bg-grey-100 text-gunmetal focus:border-inchworm focus:bg-white focus:outline-none focus:ring-2 focus:ring-inchworm focus:ring-offset-2",
        error:
          "h-10 border border-red-500 bg-white text-gunmetal focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",
      },
      size: {
        default: "h-10",
        sm: "h-9 text-xs",
        lg: "h-11 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface EtherealInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof etherealInputVariants> {}

const EtherealInput = React.forwardRef<HTMLInputElement, EtherealInputProps>(
  ({ className, variant, size, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(etherealInputVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
EtherealInput.displayName = "EtherealInput"

export { EtherealInput, etherealInputVariants }