import * as React from 'react'
import { cn } from '@/lib/utils'

type Orientation = 'horizontal' | 'vertical'

export interface SeparatorProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: Orientation
  role?: React.AriaRole
}

export const Separator = React.forwardRef<HTMLDivElement, SeparatorProps>(
  (
    { className, orientation = 'horizontal', role = 'separator', ...props },
    ref,
  ) => (
    <div
      ref={ref}
      role={role}
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'vertical' ? 'w-px h-full' : 'h-px w-full',
        className,
      )}
      {...props}
    />
  ),
)
Separator.displayName = 'Separator'
