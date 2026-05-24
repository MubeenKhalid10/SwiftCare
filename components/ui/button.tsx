import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-medium shrink-0 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 outline-none transition-all duration-250 ease-out focus-visible:border-ring focus-visible:ring-ring/40 focus-visible:ring-[3px] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-primary to-primary-600 text-primary-foreground shadow-md shadow-primary/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/35',
        destructive:
          'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-500/30 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border border-border bg-background text-foreground shadow-sm hover:-translate-y-0.5 hover:border-primary/40 hover:bg-icon-bg hover:text-primary dark:hover:bg-primary/10',
        secondary:
          'bg-icon-bg text-primary shadow-sm hover:-translate-y-0.5 hover:bg-primary/15 dark:bg-primary/20 dark:text-primary-foreground dark:hover:bg-primary/30',
        ghost:
          'text-foreground/70 hover:bg-muted hover:text-foreground dark:text-foreground/70 dark:hover:bg-muted/80 dark:hover:text-foreground',
        link: 'text-primary underline-offset-4 hover:text-primary-600 hover:underline dark:text-primary',
      },
      size: {
        default: 'h-10 px-5 py-2.5 has-[>svg]:px-4',
        sm: 'h-9 rounded-full gap-1.5 px-4 has-[>svg]:px-3',
        lg: 'h-11 rounded-full px-7 has-[>svg]:px-5',
        icon: 'size-10 rounded-full',
        'icon-sm': 'size-9 rounded-full',
        'icon-lg': 'size-12 rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
