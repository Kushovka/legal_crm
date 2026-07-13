import type { ReactNode } from 'react'

type Props = {
  isOpen: boolean
  title: string
  children: ReactNode
  onClose: () => void
}

export const Modal = ({ isOpen, title, children, onClose }: Props) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-stone-950/35 px-3 py-3 backdrop-blur-sm animate-fade-in sm:items-center sm:px-4 sm:py-6">
      <div className="max-h-[calc(100vh-24px)] w-full max-w-lg overflow-hidden rounded-2xl border border-stone-200 bg-[#fbfaf8] shadow-[0_30px_90px_rgba(28,25,23,0.22)] animate-pop-in sm:max-h-[calc(100vh-48px)]">
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-stone-400">Карточка клиента</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">{title}</h2>
          </div>
          <button
            className="grid h-9 w-9 place-items-center rounded-xl text-xl leading-none text-stone-400 transition hover:bg-stone-100 hover:text-stone-950"
            type="button"
            aria-label="Закрыть"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="max-h-[calc(100vh-128px)] overflow-y-auto p-4 sm:p-5">{children}</div>
      </div>
    </div>
  )
}
