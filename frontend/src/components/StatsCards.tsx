import type { ClientStats } from '../types/client'

const items = [
  { key: 'total', label: 'Всего клиентов', icon: '∑', tone: 'bg-stone-950 text-white', accent: 'bg-stone-200' },
  { key: 'new', label: 'Новые', icon: '+', tone: 'bg-blue-600 text-white', accent: 'bg-blue-200' },
  { key: 'in_progress', label: 'В работе', icon: '↻', tone: 'bg-amber-500 text-white', accent: 'bg-amber-200' },
  { key: 'closed', label: 'Закрытые', icon: '✓', tone: 'bg-emerald-600 text-white', accent: 'bg-emerald-200' },
] as const

export const StatsCards = ({ stats, isLoading }: { stats: ClientStats; isLoading: boolean }) => (
  <section className="grid grid-cols-1 gap-3 min-[520px]:grid-cols-2 xl:grid-cols-4">
    {items.map((item) => (
      <article
        className="group relative min-w-0 overflow-hidden rounded-2xl border border-stone-200/80 bg-white p-4 shadow-[0_12px_36px_rgba(28,25,23,0.05)] transition duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-[0_18px_46px_rgba(28,25,23,0.08)]"
        key={item.key}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-500">{item.label}</p>
            <p className="mt-3 text-[34px] font-semibold leading-none text-stone-950">
              {isLoading ? <span className="block h-9 w-16 animate-pulse rounded-lg bg-stone-100" /> : stats[item.key]}
            </p>
          </div>
          <div className={`grid h-9 w-9 place-items-center rounded-xl text-sm font-semibold shadow-sm ${item.tone}`}>
            {item.icon}
          </div>
        </div>
        <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-stone-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${item.accent}`}
            style={{ width: isLoading || stats.total === 0 ? '18%' : `${Math.max(18, Math.min(100, (stats[item.key] / Math.max(stats.total, 1)) * 100))}%` }}
          />
        </div>
      </article>
    ))}
  </section>
)
