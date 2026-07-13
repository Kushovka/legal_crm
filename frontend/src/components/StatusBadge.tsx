import clsx from 'clsx'
import type { ClientStatus } from '../types/client'

const styles: Record<ClientStatus, string> = {
  new: 'bg-blue-50 text-blue-700 ring-blue-200 before:bg-blue-500',
  in_progress: 'bg-amber-50 text-amber-700 ring-amber-200 before:bg-amber-500',
  closed: 'bg-emerald-50 text-emerald-700 ring-emerald-200 before:bg-emerald-500',
}

const labels: Record<ClientStatus, string> = {
  new: 'Новый',
  in_progress: 'В работе',
  closed: 'Закрыт',
}

export const StatusBadge = ({ status }: { status: ClientStatus }) => (
  <span
    className={clsx(
      'inline-flex min-w-24 items-center justify-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 before:h-1.5 before:w-1.5 before:rounded-full',
      styles[status],
    )}
  >
    {labels[status]}
  </span>
)
