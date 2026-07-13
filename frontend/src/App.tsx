import { useMemo, useState } from 'react'
import { AuthPage } from './components/AuthPage'
import { ClientForm } from './components/ClientForm'
import { ClientsTable } from './components/ClientsTable'
import { Modal } from './components/Modal'
import { StatsCards } from './components/StatsCards'
import { Toast } from './components/Toast'
import { useAuth } from './hooks/useAuth'
import { useClients } from './hooks/useClients'
import type { User } from './types/auth'
import type { Client, ClientCreatePayload, ClientStatus } from './types/client'

type ActiveView = 'clients' | 'tasks' | 'documents' | 'settings'

const navItems: Array<{ id: ActiveView; label: string }> = [
  { id: 'clients', label: 'Клиенты' },
  { id: 'tasks', label: 'Задачи' },
  { id: 'documents', label: 'Документы' },
  { id: 'settings', label: 'Настройки' },
]

const viewTitles: Record<ActiveView, { title: string; description: string; badge: string }> = {
  clients: {
    title: 'Клиенты',
    description: 'Управление клиентами и статусами юридических дел',
    badge: 'Дашборд',
  },
  tasks: {
    title: 'Задачи',
    description: 'Легкий раздел для контроля будущих процессуальных действий',
    badge: 'Планирование',
  },
  documents: {
    title: 'Документы',
    description: 'Место для будущих договоров, доверенностей и шаблонов',
    badge: 'Файлы',
  },
  settings: {
    title: 'Настройки',
    description: 'Аккаунт, уведомления и параметры рабочего пространства',
    badge: 'Профиль',
  },
}

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))

const PlaceholderView = ({ view }: { view: ActiveView }) => {
  const copy: Record<Exclude<ActiveView, 'clients'>, { title: string; text: string }> = {
    tasks: {
      title: 'Задачи появятся здесь',
      text: 'Раздел уже встроен в навигацию, чтобы продукт ощущался цельным. Следующим шагом сюда можно добавить дедлайны, ответственных и напоминания.',
    },
    documents: {
      title: 'Документы готовы к расширению',
      text: 'Здесь логично хранить шаблоны, сканы доверенностей и материалы по делу клиента.',
    },
    settings: {
      title: 'Настройки аккаунта',
      text: 'Сейчас уведомления отправляются на email текущего пользователя. Позже сюда можно вынести смену почты, SMTP и параметры команды.',
    },
  }

  if (view === 'clients') return null

  return (
    <section className="rounded-2xl border border-stone-200/80 bg-white p-5 shadow-[0_16px_50px_rgba(28,25,23,0.06)] sm:p-8">
      <div className="max-w-xl">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Раздел</p>
        <h2 className="mt-3 text-xl font-semibold text-stone-950 sm:text-2xl">{copy[view].title}</h2>
        <p className="mt-3 text-sm leading-6 text-stone-500">{copy[view].text}</p>
      </div>
    </section>
  )
}

const ClientDetails = ({
  client,
  changingClientId,
  deletingClientId,
  onBack,
  onStatusChange,
  onDelete,
}: {
  client: Client
  changingClientId: number | null
  deletingClientId: number | null
  onBack: () => void
  onStatusChange: (clientId: number, status: ClientStatus) => Promise<void>
  onDelete: (client: Client) => Promise<void>
}) => (
  <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_16px_50px_rgba(28,25,23,0.06)]">
    <div className="border-b border-stone-200/80 bg-stone-50/60 px-4 py-4 sm:px-5">
      <button
        className="h-9 max-w-full rounded-xl border border-stone-200 bg-white px-3 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50"
        type="button"
        onClick={onBack}
      >
        ← Назад к списку
      </button>
    </div>
    <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 p-4 sm:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-stone-950 text-xl font-semibold text-white">
              {client.name.trim().slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Карточка клиента</p>
              <h2 className="mt-1 break-words text-xl font-semibold text-stone-950 sm:text-2xl">{client.name}</h2>
              <p className="mt-1 text-sm text-stone-500">ID {client.id}</p>
            </div>
          </div>
          <button
            className="h-10 w-full rounded-xl border border-red-100 bg-red-50 px-4 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-100 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
            disabled={deletingClientId === client.id}
            type="button"
            onClick={() => void onDelete(client)}
          >
            Удалить
          </button>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Телефон</p>
            <p className="mt-2 break-words text-base font-semibold text-stone-950 sm:text-lg">{client.phone}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Дата добавления</p>
            <p className="mt-2 text-base font-semibold text-stone-950 sm:text-lg">{formatDate(client.created_at)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Обновлено</p>
            <p className="mt-2 text-base font-semibold text-stone-950 sm:text-lg">{formatDate(client.updated_at)}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-[#fbfaf8] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Следующее действие</p>
            <p className="mt-2 text-base font-semibold text-stone-950 sm:text-lg">Проверить статус дела</p>
          </div>
        </div>
      </div>

      <aside className="border-t border-stone-200 bg-stone-50/70 p-5 lg:border-l lg:border-t-0">
        <p className="text-sm font-semibold text-stone-950">Статус клиента</p>
        <div className="relative mt-3">
          <select
            className="h-11 w-full appearance-none rounded-xl border border-stone-200 bg-white py-0 pl-3.5 pr-9 text-sm font-semibold text-stone-900 shadow-sm outline-none transition hover:border-stone-300 focus:border-stone-500 focus:ring-4 focus:ring-stone-100 disabled:cursor-wait disabled:bg-stone-100"
            disabled={changingClientId === client.id || deletingClientId === client.id}
            value={client.status}
            onChange={(event) => void onStatusChange(client.id, event.target.value as ClientStatus)}
          >
            <option value="new">Новый</option>
            <option value="in_progress">В работе</option>
            <option value="closed">Закрыт</option>
          </select>
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400">
            ▾
          </span>
        </div>
        <div className="mt-5 rounded-2xl border border-stone-200 bg-white p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-stone-400">Уведомления</p>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            При добавлении клиента письмо уходит на email аккаунта юриста.
          </p>
        </div>
      </aside>
    </div>
  </section>
)

const Dashboard = ({ user, onLogout }: { user: User; onLogout: () => void }) => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [activeView, setActiveView] = useState<ActiveView>('clients')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const {
    clients,
    stats,
    isLoading,
    error,
    isCreating,
    changingClientId,
    deletingClientId,
    createClient,
    changeStatus,
    deleteClient,
    reload,
  } = useClients()

  const hasClients = clients.length > 0
  const pageState = useMemo(() => {
    if (isLoading) return 'loading'
    if (error) return 'error'
    if (!hasClients) return 'empty'
    return 'ready'
  }, [error, hasClients, isLoading])

  const handleCreate = async (payload: ClientCreatePayload) => {
    await createClient(payload)
    setIsModalOpen(false)
    setToast({ type: 'success', text: 'Клиент добавлен' })
  }

  const handleStatusChange = async (clientId: number, status: ClientCreatePayload['status']) => {
    try {
      const updated = await changeStatus(clientId, status)
      if (updated && selectedClient?.id === clientId) {
        setSelectedClient(updated)
      }
      setToast({ type: 'success', text: 'Статус обновлен' })
    } catch {
      setToast({ type: 'error', text: 'Не удалось обновить статус' })
    }
  }

  const handleDelete = async (client: Client) => {
    if (!window.confirm(`Удалить клиента «${client.name}»?`)) return

    try {
      await deleteClient(client.id)
      if (selectedClient?.id === client.id) {
        setSelectedClient(null)
      }
      setToast({ type: 'success', text: 'Клиент удален' })
    } catch {
      setToast({ type: 'error', text: 'Не удалось удалить клиента' })
    }
  }

  const currentView = viewTitles[activeView]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f4f1] text-stone-950">
      <div className="grid min-h-screen w-full gap-0 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden min-h-screen border-r border-stone-800/80 bg-[#171717] p-4 text-stone-100 lg:flex lg:flex-col">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white text-sm font-semibold text-stone-950">
              Ю
            </div>
            <div>
              <p className="text-sm font-semibold leading-5">Юридическая CRM</p>
              <p className="text-xs text-stone-400">Клиентские дела</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <p className="text-xs font-medium uppercase text-stone-500">Аккаунт</p>
            <p className="mt-1 truncate text-sm font-medium text-white">{user.email}</p>
            <button
              className="mt-3 h-9 w-full rounded-xl bg-white/10 text-sm font-semibold text-white transition hover:bg-white/15"
              type="button"
              onClick={onLogout}
            >
              Выйти
            </button>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => (
              <button
                className={[
                  'flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm font-medium transition',
                  activeView === item.id
                    ? 'bg-white/10 text-white'
                    : 'text-stone-400 hover:bg-white/[0.06] hover:text-stone-200',
                ].join(' ')}
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id)
                  setSelectedClient(null)
                }}
              >
                <span>{item.label}</span>
                {item.id === 'clients' && (
                  <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{stats.total}</span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <p className="text-xs font-medium uppercase text-stone-500">Сегодня</p>
            <p className="mt-2 text-2xl font-semibold text-white">{stats.in_progress}</p>
            <p className="mt-1 text-sm leading-5 text-stone-400">дела находятся в работе</p>
          </div>
        </aside>

        <section className="min-w-0 overflow-hidden border-stone-200/80 bg-[#fbfaf8] lg:min-h-screen">
          <div className="border-b border-stone-200/80 bg-[#fbfaf8]/90 px-4 py-4 backdrop-blur sm:px-6 lg:px-10 xl:px-12">
            <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-xs font-medium text-stone-600 shadow-sm">
                    {currentView.badge}
                  </span>
                  <span className="max-w-full truncate text-xs text-stone-400">Уведомления приходят на {user.email}</span>
                </div>
                <h1 className="mt-3 break-words text-[28px] font-semibold leading-tight text-stone-950 sm:text-[36px] lg:text-[40px]">
                  {selectedClient ? selectedClient.name : currentView.title}
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base">
                  {selectedClient ? 'Подробная информация и управление делом клиента' : currentView.description}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                {activeView === 'clients' && !selectedClient && (
                  <button
                    className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(28,25,23,0.16)] transition duration-200 hover:-translate-y-0.5 hover:bg-stone-800 hover:shadow-[0_16px_34px_rgba(28,25,23,0.2)] focus:outline-none focus:ring-2 focus:ring-stone-900 focus:ring-offset-2 focus:ring-offset-[#fbfaf8] sm:w-auto"
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    <span className="grid h-5 w-5 place-items-center rounded-md bg-white/12 text-base leading-none transition group-hover:bg-white/20">
                      +
                    </span>
                    Добавить клиента
                  </button>
                )}
                <button
                  className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-700 shadow-sm transition hover:bg-stone-50 sm:w-auto lg:hidden"
                  type="button"
                  onClick={onLogout}
                >
                  Выйти
                </button>
              </div>
            </header>

            <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
              {navItems.map((item) => (
                <button
                  className={[
                    'flex h-10 shrink-0 items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition',
                    activeView === item.id
                      ? 'border-stone-900 bg-stone-950 text-white shadow-sm'
                      : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50',
                  ].join(' ')}
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveView(item.id)
                    setSelectedClient(null)
                  }}
                >
                  <span>{item.label}</span>
                  {item.id === 'clients' && (
                    <span
                      className={[
                        'rounded-full px-2 py-0.5 text-xs',
                        activeView === item.id ? 'bg-white/15 text-white' : 'bg-stone-100 text-stone-500',
                      ].join(' ')}
                    >
                      {stats.total}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="space-y-5 px-3 py-4 sm:px-6 sm:py-5 lg:px-10 xl:px-12">
            {activeView === 'clients' && <StatsCards stats={stats} isLoading={isLoading} />}

            {selectedClient && activeView === 'clients' ? (
              <ClientDetails
                changingClientId={changingClientId}
                client={selectedClient}
                deletingClientId={deletingClientId}
                onBack={() => setSelectedClient(null)}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ) : activeView === 'clients' ? (
              <section className="min-w-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-[0_16px_50px_rgba(28,25,23,0.06)]">
              <div className="flex flex-col gap-3 border-b border-stone-200/80 bg-white px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-stone-950">Список клиентов</h2>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-medium text-stone-500">
                      {clients.length}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-stone-500">Новые записи отображаются первыми</p>
                </div>
                {error && (
                  <button
                    className="h-10 w-full rounded-xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:border-stone-300 hover:bg-stone-50 md:w-auto"
                    type="button"
                    onClick={reload}
                  >
                    Повторить
                  </button>
                )}
              </div>

              {pageState === 'loading' && (
                <div className="space-y-2 p-3 sm:p-4">
                  {[0, 1, 2, 3].map((item) => (
                    <div
                      className="h-[70px] animate-pulse rounded-xl border border-stone-100 bg-gradient-to-r from-stone-100 via-stone-50 to-stone-100"
                      key={item}
                    />
                  ))}
                </div>
              )}

              {pageState === 'error' && (
                <div className="p-6 text-center sm:p-8">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-50 text-lg text-red-600">
                    !
                  </div>
                  <p className="mt-4 text-base font-semibold text-stone-950">Не удалось загрузить клиентов</p>
                  <p className="mt-2 text-sm text-stone-500">{error}</p>
                </div>
              )}

              {pageState === 'empty' && (
                <div className="p-6 text-center sm:p-12">
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-stone-200 bg-stone-50 text-2xl text-stone-500">
                    +
                  </div>
                  <p className="mt-4 text-base font-semibold text-stone-950">Клиентов пока нет</p>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-stone-500">
                    Добавьте первого клиента, чтобы увидеть статусы дел и динамику в таблице.
                  </p>
                  <button
                    className="mt-5 h-10 w-full rounded-xl bg-stone-950 px-4 text-sm font-semibold text-white transition hover:bg-stone-800 sm:w-auto"
                    type="button"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Добавить клиента
                  </button>
                </div>
              )}

              {pageState === 'ready' && (
                <ClientsTable
                  clients={clients}
                  changingClientId={changingClientId}
                  deletingClientId={deletingClientId}
                  onDelete={handleDelete}
                  onOpenDetails={setSelectedClient}
                  onStatusChange={handleStatusChange}
                />
              )}
              </section>
            ) : (
              <PlaceholderView view={activeView} />
            )}
          </div>
        </section>
      </div>

      <Modal isOpen={isModalOpen} title="Новый клиент" onClose={() => setIsModalOpen(false)}>
        <ClientForm
          isSubmitting={isCreating}
          onCancel={() => setIsModalOpen(false)}
          onSubmit={handleCreate}
        />
      </Modal>

      {toast && <Toast toast={toast} onClose={() => setToast(null)} />}
    </main>
  )
}

const App = () => {
  const { user, isAuthLoading, login, register, logout } = useAuth()

  if (isAuthLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f5f4f1] text-stone-950">
        <div className="rounded-2xl border border-stone-200 bg-white px-5 py-4 text-sm font-semibold shadow-sm">
          Загружаем CRM...
        </div>
      </main>
    )
  }

  if (!user) {
    return <AuthPage onLogin={login} onRegister={register} />
  }

  return <Dashboard user={user} onLogout={logout} />
}

export default App
