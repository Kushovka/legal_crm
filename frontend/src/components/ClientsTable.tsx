import type { Client, ClientStatus } from '../types/client'
import { statusOptions } from '../types/client'
import { formatClientDisplayName } from '../utils/name'
import { StatusBadge } from './StatusBadge'

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

type Props = {
  clients: Client[]
  changingClientId: number | null
  deletingClientId: number | null
  onOpenAiAnalysis: (client: Client) => void
  onOpenDetails: (client: Client) => void
  onStatusChange: (clientId: number, status: ClientStatus) => Promise<void>
  onDelete: (client: Client) => Promise<void>
}

export const ClientsTable = ({
  clients,
  changingClientId,
  deletingClientId,
  onOpenAiAnalysis,
  onOpenDetails,
  onStatusChange,
  onDelete,
}: Props) => (
  <div>
    <div className="hidden overflow-x-auto xl:block">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            {['Клиент', 'Телефон', 'Статус', 'Дата добавления', 'Действия'].map((header) => (
              <th
                className="border-b border-stone-200/80 bg-stone-50/70 px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-500 first:pl-5"
                key={header}
                scope="col"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {clients.map((client) => (
            <tr
              className="group cursor-pointer transition duration-150 hover:bg-[#fbfaf8]"
              key={client.id}
              onClick={() => onOpenDetails(client)}
            >
              <td className="border-b border-stone-100 px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-stone-100 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition group-hover:bg-stone-950 group-hover:text-white">
                    {formatClientDisplayName(client.name).slice(0, 1)}
                  </div>
                  <div className="min-w-0">
                    <p className="max-w-[180px] truncate text-sm font-semibold text-stone-950" title={client.name}>
                      {formatClientDisplayName(client.name)}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">ID {client.id}</p>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap border-b border-stone-100 px-5 py-3.5 text-sm text-stone-600">
                {client.phone}
              </td>
              <td className="whitespace-nowrap border-b border-stone-100 px-5 py-3.5">
                <StatusBadge status={client.status} />
              </td>
              <td className="whitespace-nowrap border-b border-stone-100 px-5 py-3.5 text-sm text-stone-500">
                {formatDate(client.created_at)}
              </td>
              <td className="whitespace-nowrap border-b border-stone-100 px-5 py-3.5">
                <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                  <div className="relative inline-flex">
                    <select
                      className="h-9 min-w-32 appearance-none rounded-xl border border-stone-200 bg-white py-0 pl-3 pr-9 text-sm font-medium text-stone-800 shadow-sm outline-none transition hover:border-stone-300 hover:bg-stone-50 focus:border-stone-400 focus:ring-4 focus:ring-stone-100 disabled:cursor-wait disabled:bg-stone-100 disabled:text-stone-400"
                      disabled={changingClientId === client.id || deletingClientId === client.id}
                      value={client.status}
                      onChange={(event) => void onStatusChange(client.id, event.target.value as ClientStatus)}
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
                      ▾
                    </span>
                  </div>
                  <button
                    className="h-9 rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:border-stone-300 hover:bg-stone-50"
                    type="button"
                    onClick={() => onOpenAiAnalysis(client)}
                  >
                    AI-анализ
                  </button>
                  <button
                    className="grid h-9 w-9 place-items-center rounded-xl border border-red-100 bg-red-50 text-sm font-semibold text-red-600 shadow-sm transition hover:border-red-200 hover:bg-red-100 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-wait disabled:opacity-60"
                    disabled={deletingClientId === client.id}
                    title="Удалить клиента"
                    type="button"
                    onClick={() => void onDelete(client)}
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="grid gap-3 p-3 xl:hidden">
      {clients.map((client) => (
        <article
          className="cursor-pointer rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_10px_30px_rgba(28,25,23,0.05)] transition hover:border-stone-300 active:scale-[0.99]"
          key={client.id}
          onClick={() => onOpenDetails(client)}
        >
          <div className="flex flex-col gap-3 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-stone-100 text-sm font-semibold text-stone-700 ring-1 ring-stone-200">
                {formatClientDisplayName(client.name).slice(0, 1)}
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-base font-semibold text-stone-950" title={client.name}>
                  {formatClientDisplayName(client.name)}
                </h3>
                <p className="mt-1 text-sm text-stone-600">{client.phone}</p>
              </div>
            </div>
            <div className="shrink-0">
              <StatusBadge status={client.status} />
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-stone-50 px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-stone-400">Дата добавления</p>
            <p className="mt-1 text-sm font-medium text-stone-700">{formatDate(client.created_at)}</p>
          </div>
          <div className="mt-4 grid gap-2 min-[420px]:grid-cols-2" onClick={(event) => event.stopPropagation()}>
            <button
              className="h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
              type="button"
              onClick={() => onOpenAiAnalysis(client)}
            >
              AI-анализ
            </button>
            <button
              className="h-11 w-full rounded-xl border border-red-100 bg-red-50 px-3 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:opacity-60 min-[420px]:w-auto"
              disabled={deletingClientId === client.id}
              type="button"
              onClick={() => void onDelete(client)}
            >
              Удалить
            </button>
          </div>
          <div className="relative mt-3" onClick={(event) => event.stopPropagation()}>
            <select
              className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white py-0 pl-3 pr-9 text-sm font-medium text-stone-800 shadow-sm outline-none transition focus:border-stone-400 focus:ring-4 focus:ring-stone-100 disabled:cursor-wait disabled:bg-stone-100"
              disabled={changingClientId === client.id || deletingClientId === client.id}
              value={client.status}
              onChange={(event) => void onStatusChange(client.id, event.target.value as ClientStatus)}
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400">
              ▾
            </span>
          </div>
        </article>
      ))}
    </div>
  </div>
)
