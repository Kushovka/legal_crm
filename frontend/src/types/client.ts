export type ClientStatus = 'new' | 'in_progress' | 'closed'

export type Client = {
  id: number
  name: string
  phone: string
  status: ClientStatus
  status_label: string
  created_at: string
  updated_at: string
}

export type ClientStats = {
  total: number
  new: number
  in_progress: number
  closed: number
}

export type ClientCreatePayload = {
  name: string
  phone: string
  status: ClientStatus
}

export const statusOptions: Array<{ value: ClientStatus; label: string }> = [
  { value: 'new', label: 'Новый' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'closed', label: 'Закрыт' },
]
