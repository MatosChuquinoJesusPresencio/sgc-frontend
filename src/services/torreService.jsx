import httpClient from '../api/httpClient'

export const torreService = {
  getAll: (condominioId, params = {}) =>
    httpClient.get('/torres', { params: { condominioId, ...params } }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/torres/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/torres', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/torres/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/torres/${id}`),
}
