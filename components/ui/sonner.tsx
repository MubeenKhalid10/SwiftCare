'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast:
            'rounded-2xl border border-border/60 bg-background/95 shadow-[0_18px_50px_rgba(15,23,42,0.14)] backdrop-blur-xl',
          title: 'text-sm font-semibold tracking-tight',
          description: 'text-sm text-muted-foreground',
          actionButton:
            'rounded-full bg-sky-600 text-white shadow-lg shadow-sky-500/20 hover:bg-sky-500',
          cancelButton:
            'rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-white/10 dark:text-slate-100 dark:hover:bg-white/15',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
