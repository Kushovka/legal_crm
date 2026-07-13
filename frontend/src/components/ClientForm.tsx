import { useState } from 'react'
import type { FormEvent } from 'react'
import { getApiErrorMessage } from '../api/client'
import type { ClientCreatePayload, ClientStatus } from '../types/client'
import { statusOptions } from '../types/client'
import { formatRussianPhoneInput, isCompleteRussianPhone } from '../utils/phone'

type Props = {
  isSubmitting: boolean
  onSubmit: (payload: ClientCreatePayload) => Promise<void>
  onCancel: () => void
}

export const ClientForm = ({ isSubmitting, onSubmit, onCancel }: Props) => {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState<ClientStatus>('new')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!name.trim() || !phone.trim()) {
      setError('Заполните имя и телефон')
      return
    }

    if (!isCompleteRussianPhone(phone)) {
      setError('Введите российский номер полностью: +7 900 000-00-00')
      return
    }

    setError(null)
    try {
      await onSubmit({ name: name.trim(), phone: phone.trim(), status })
      setName('')
      setPhone('')
      setStatus('new')
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    }
  }

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <label className="block">
        <span className="text-sm font-semibold text-stone-800">Имя</span>
        <input
          className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          disabled={isSubmitting}
          maxLength={255}
          placeholder="Анна Петрова"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-stone-800">Телефон</span>
        <input
          className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:cursor-not-allowed disabled:bg-stone-100 disabled:text-stone-400"
          disabled={isSubmitting}
          maxLength={64}
          placeholder="+7 900 000-00-00"
          value={phone}
          onChange={(event) => setPhone(formatRussianPhoneInput(event.target.value))}
        />
        <span className="mt-1.5 block text-xs text-stone-400">Только российский номер, 11 цифр</span>
      </label>

      <label className="block">
        <span className="text-sm font-semibold text-stone-800">Статус</span>
        <div className="relative mt-2">
          <select
            className="h-12 w-full appearance-none rounded-xl border border-stone-200 bg-white py-0 pl-3.5 pr-9 text-sm font-medium text-stone-950 shadow-sm outline-none transition hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:cursor-not-allowed disabled:bg-stone-100"
            disabled={isSubmitting}
            value={status}
            onChange={(event) => setStatus(event.target.value as ClientStatus)}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            ▾
          </span>
        </div>
      </label>

      <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end">
        <button
          className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="button"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          className="h-11 rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(28,25,23,0.16)] transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-stone-300 disabled:shadow-none"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
      </div>
    </form>
  )
}
