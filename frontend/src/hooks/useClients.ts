import { useCallback, useEffect, useState } from 'react'
import { clientsApi } from '../api/clients'
import { getApiErrorMessage } from '../api/client'
import type { Client, ClientCreatePayload, ClientStats, ClientStatus } from '../types/client'

const emptyStats: ClientStats = {
  total: 0,
  new: 0,
  in_progress: 0,
  closed: 0,
}

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [stats, setStats] = useState<ClientStats>(emptyStats)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [changingClientId, setChangingClientId] = useState<number | null>(null)
  const [deletingClientId, setDeletingClientId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [clientsData, statsData] = await Promise.all([clientsApi.list(), clientsApi.stats()])
      setClients(clientsData)
      setStats(statsData)
    } catch (loadError) {
      setError(getApiErrorMessage(loadError))
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const refreshStats = async () => {
    setStats(await clientsApi.stats())
  }

  const createClient = async (payload: ClientCreatePayload) => {
    setIsCreating(true)
    try {
      const created = await clientsApi.create(payload)
      setClients((current) => [created, ...current])
      await refreshStats()
      return created
    } finally {
      setIsCreating(false)
    }
  }

  const changeStatus = async (clientId: number, status: ClientStatus) => {
    setChangingClientId(clientId)
    try {
      const updated = await clientsApi.updateStatus(clientId, status)
      setClients((current) => current.map((client) => (client.id === clientId ? updated : client)))
      await refreshStats()
      return updated
    } finally {
      setChangingClientId(null)
    }
  }

  const deleteClient = async (clientId: number) => {
    setDeletingClientId(clientId)
    try {
      await clientsApi.remove(clientId)
      setClients((current) => current.filter((client) => client.id !== clientId))
      await refreshStats()
    } finally {
      setDeletingClientId(null)
    }
  }

  return {
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
    reload: load,
  }
}
