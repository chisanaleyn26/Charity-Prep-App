import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const etherealCardVariants = cva(
  "rounded-lg bg-white text-gunmetal transition-all duration-300",
  {
    variants: {
      variant: {
        default: "border border-american-silver shadow-sm hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg",
        ghost: "border border-transparent hover:border-american-silver",
        gradient: "bg-gradient-to-br from-white to-grey-100 border border-american-silver shadow-sm hover:shadow-md",
        success: "border border-inchworm shadow-sm hover:shadow-md hover:border-inchworm/80",
        warning: "border border-orange shadow-sm hover:shadow-md hover:border-orange/80",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface EtherealCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof etherealCardVariants> {}

const EtherealCard = React.forwardRef<HTMLDivElement, EtherealCardProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(etherealCardVariants({ variant }), className)}
      {...props}
    />
  )
)
EtherealCard.displayName = "EtherealCard"

const EtherealCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
EtherealCardHeader.displayName = "EtherealCardHeader"

const EtherealCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight text-gunmetal",
      className
    )}
    {...props}
  />
))
EtherealCardTitle.displayName = "EtherealCardTitle"

const EtherealCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-grey-700", className)}
    {...props}
  />
))
EtherealCardDescription.displayName = "EtherealCardDescription"

const EtherealCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EtherealCardContent.displayName = "EtherealCardContent"

const EtherealCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EtherealCardFooter.displayName = "EtherealCardFooter"

export { 
  EtherealCard, 
  EtherealCardHeader, 
  EtherealCardFooter, 
  EtherealCardTitle, 
  EtherealCardDescription, 
  EtherealCardContent 
}