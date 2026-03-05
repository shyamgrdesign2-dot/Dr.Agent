import { RefreshCw } from 'lucide-react'

import { cn } from '@/lib/utils'

function Spinner({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <RefreshCw
      size={16}
      role="status"
      aria-label="Loading"
      className={cn('animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
