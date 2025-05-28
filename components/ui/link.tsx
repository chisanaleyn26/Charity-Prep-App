'use client'

import NextLink, { LinkProps } from 'next/link'
import { AnchorHTMLAttributes, forwardRef } from 'react'

export interface CustomLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps>, LinkProps {
  children?: React.ReactNode
}

const Link = forwardRef<HTMLAnchorElement, CustomLinkProps>(
  ({ children, ...props }, ref) => {
    return (
      <NextLink ref={ref} {...props}>
        {children}
      </NextLink>
    )
  }
)

Link.displayName = 'Link'

export { Link }
export default Link