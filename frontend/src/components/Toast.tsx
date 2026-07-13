import { useEffect } from 'react'
import clsx from 'clsx'

type ToastData = {
  type: 'success' | 'error'
  text: string
}

export const Toast = ({ toast, onClose }: { toast: ToastData; onClose: () => void }) => {
  useEffect(() => {
    const timeout = window.setTimeout(onClose, 3200)
    return () => window.clearTimeout(timeout)
  }, [onClose])

  return (
    <div
      className={clsx(
        'fixed bottom-5 right-5 z-50 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_18px_50px_rgba(28,25,23,0.18)] animate-slide-up',
        toast.type === 'success'
          ? 'border-stone-800 bg-stone-950 text-white'
          : 'border-red-500 bg-red-600 text-white',
      )}
      role="status"
    >
      {toast.text}
    </div>
  )
}
