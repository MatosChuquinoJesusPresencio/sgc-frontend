import httpClient from '../api/httpClient'

export const configuracionService = {
  getById: (id) =>
    httpClient.get(`/configuracion/${id}`).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/configuracion/${id}`, data).then((r) => r.data),
}
