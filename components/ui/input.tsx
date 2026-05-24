import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-slate-400 selection:bg-primary selection:text-primary-foreground dark:bg-white/5 border border-slate-200/80 h-11 w-full min-w-0 rounded-2xl bg-white/80 px-4 py-2.5 text-base shadow-sm shadow-slate-900/5 backdrop-blur-md transition-[color,box-shadow,transform] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:border-white/10 dark:text-slate-100',
        'focus-visible:-translate-y-0.5 focus-visible:border-sky-300 focus-visible:ring-sky-500/20 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
