import { useState } from 'react'
import type { FormEvent } from 'react'
import { getApiErrorMessage } from '../api/client'
import type { AuthPayload } from '../types/auth'

type Props = {
  onLogin: (payload: AuthPayload) => Promise<void>
  onRegister: (payload: AuthPayload) => Promise<void>
}

export const AuthPage = ({ onLogin, onRegister }: Props) => {
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    if (!email.trim() || !password.trim()) {
      setError('Укажите почту и пароль')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const payload = { email: email.trim().toLowerCase(), password }
      if (mode === 'register') {
        await onRegister(payload)
      } else {
        await onLogin(payload)
      }
    } catch (submitError) {
      setError(getApiErrorMessage(submitError))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f4f1] px-0 py-0 text-stone-950 sm:px-4 sm:py-8">
      <section className="grid min-h-screen w-full max-w-5xl overflow-hidden border-stone-200 bg-[#fbfaf8] shadow-[0_28px_100px_rgba(28,25,23,0.12)] sm:min-h-0 sm:rounded-3xl sm:border lg:grid-cols-[1fr_440px]">
        <div className="hidden bg-[#171717] p-8 text-white lg:flex lg:flex-col">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-sm font-semibold text-stone-950">
              Ю
            </div>
            <div>
              <p className="font-semibold">Юридическая CRM</p>
              <p className="text-sm text-stone-400">Клиенты, статусы, уведомления</p>
            </div>
          </div>
          <div className="mt-auto">
            <p className="max-w-md text-3xl font-semibold leading-tight">
              Войдите по почте, и уведомления о новых клиентах будут приходить именно туда.
            </p>
            <p className="mt-4 max-w-sm text-sm leading-6 text-stone-400">
              Простая авторизация для прототипа: email, пароль и персональный список клиентов.
            </p>
          </div>
        </div>

        <div className="flex flex-col justify-center p-5 sm:p-8">
          <div className="mb-8">
            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 shadow-sm">
              Аккаунт юриста
            </span>
            <h1 className="mt-4 text-2xl font-semibold leading-tight sm:text-3xl">
              {mode === 'register' ? 'Создать доступ' : 'Войти в CRM'}
            </h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              {mode === 'register'
                ? 'Почта станет адресом для уведомлений о новых клиентах.'
                : 'Введите почту и пароль, чтобы вернуться к клиентам.'}
            </p>
          </div>

          <div className="mb-5 grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
            <button
              className={`h-10 rounded-xl text-sm font-semibold transition ${
                mode === 'register' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
              type="button"
              onClick={() => setMode('register')}
            >
              Регистрация
            </button>
            <button
              className={`h-10 rounded-xl text-sm font-semibold transition ${
                mode === 'login' ? 'bg-white text-stone-950 shadow-sm' : 'text-stone-500 hover:text-stone-800'
              }`}
              type="button"
              onClick={() => setMode('login')}
            >
              Вход
            </button>
          </div>

          <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-semibold text-stone-800">Почта</span>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                disabled={isSubmitting}
                placeholder="you@yandex.ru"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-stone-800">Пароль</span>
              <input
                className="mt-2 h-12 w-full rounded-xl border border-stone-200 bg-white px-3.5 text-sm text-stone-950 shadow-sm outline-none transition placeholder:text-stone-400 hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100"
                disabled={isSubmitting}
                minLength={6}
                placeholder="Минимум 6 символов"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            <button
              className="h-12 w-full rounded-xl bg-stone-950 px-5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(28,25,23,0.16)] transition hover:-translate-y-0.5 hover:bg-stone-800 disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-stone-300"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? 'Проверяем...' : mode === 'register' ? 'Создать аккаунт' : 'Войти'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}
