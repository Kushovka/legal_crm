import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { clientsApi } from '../api/clients'
import { getApiErrorMessage } from '../api/client'
import type { Client, ClientAiAnalysis } from '../types/client'

type Props = {
  client: Client
  onClose: () => void
  onCopied: () => void
}

const Section = ({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) => (
  <section className="rounded-2xl border border-stone-200 bg-white p-4">
    <h3 className="text-sm font-semibold text-stone-950">{title}</h3>
    <div className="mt-3 text-sm leading-6 text-stone-600">{children}</div>
  </section>
)

const ListBlock = ({ items }: { items: string[] }) => {
  if (items.length === 0) {
    return <p className="text-stone-400">Нет данных</p>
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li className="flex gap-2" key={`${item}-${index}`}>
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-stone-400" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export const AiAnalysisModal = ({ client, onClose, onCopied }: Props) => {
  const [caseDescription, setCaseDescription] = useState('')
  const [analysis, setAnalysis] = useState<ClientAiAnalysis | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await clientsApi.analyzeCase(client.id, caseDescription)
      setAnalysis(result)
    } catch (requestError) {
      setError(getApiErrorMessage(requestError))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCopy = async () => {
    if (!analysis?.draft_message) return
    await navigator.clipboard.writeText(analysis.draft_message)
    onCopied()
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
        AI формирует черновик. Перед использованием проверьте информацию.
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm font-semibold text-stone-950" htmlFor="case-description">
            Описание ситуации клиента
          </label>
          <textarea
            className="mt-2 min-h-[320px] w-full resize-y rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm leading-7 text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:cursor-wait disabled:bg-stone-100 sm:min-h-[420px]"
            disabled={isSubmitting}
            id="case-description"
            maxLength={4000}
            placeholder="Например: клиент хочет взыскать задолженность по договору, есть переписка и частичная оплата..."
            value={caseDescription}
            onChange={(event) => setCaseDescription(event.target.value)}
          />
        </div>
        {error && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            className="h-11 rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting}
            type="button"
            onClick={onClose}
          >
            Закрыть
          </button>
          <button
            className="h-11 rounded-xl bg-stone-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-wait disabled:opacity-60"
            disabled={isSubmitting || !caseDescription.trim()}
            type="submit"
          >
            {isSubmitting ? 'Формируем анализ...' : 'Сформировать анализ'}
          </button>
        </div>
      </form>

      {analysis && (
        <div className="grid gap-3">
          <Section title="Краткое резюме">
            <p>{analysis.summary}</p>
          </Section>
          <Section title="Следующие шаги">
            <ListBlock items={analysis.next_steps} />
          </Section>
          <Section title="Вопросы клиенту">
            <ListBlock items={analysis.questions} />
          </Section>
          <Section title="Возможные риски">
            <ListBlock items={analysis.risks} />
          </Section>
          <Section title="Черновик сообщения">
            <p className="whitespace-pre-wrap">{analysis.draft_message}</p>
            <button
              className="mt-3 h-10 rounded-xl border border-stone-200 bg-stone-50 px-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-100"
              type="button"
              onClick={() => void handleCopy()}
            >
              Копировать
            </button>
          </Section>
        </div>
      )}
    </div>
  )
}
