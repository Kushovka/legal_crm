import { apiClient } from './client'
import type { Client, ClientAiAnalysis, ClientCreatePayload, ClientStats, ClientStatus } from '../types/client'

export const clientsApi = {
  async list() {
    const response = await apiClient.get<Client[]>('/clients')
    return response.data
  },

  async stats() {
    const response = await apiClient.get<ClientStats>('/clients/stats')
    return response.data
  },

  async get(clientId: number) {
    const response = await apiClient.get<Client>(`/clients/${clientId}`)
    return response.data
  },

  async create(payload: ClientCreatePayload) {
    const response = await apiClient.post<Client>('/clients', payload)
    return response.data
  },

  async updateStatus(clientId: number, status: ClientStatus) {
    const response = await apiClient.patch<Client>(`/clients/${clientId}/status`, { status })
    return response.data
  },

  async analyzeCase(clientId: number, caseDescription: string) {
    const response = await apiClient.post<ClientAiAnalysis>(
      `/clients/${clientId}/ai-analysis`,
      { case_description: caseDescription },
      { timeout: 125000 },
    )
    return response.data
  },

  async remove(clientId: number) {
    await apiClient.delete(`/clients/${clientId}`)
  },
}
