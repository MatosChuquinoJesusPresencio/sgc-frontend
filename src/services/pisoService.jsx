import httpClient from '../api/httpClient'

export const pisoService = {
  getAll: (torreId, params = {}) =>
    httpClient.get('/pisos', { params: { torreId, ...params } }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/pisos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/pisos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/pisos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/pisos/${id}`),
}
