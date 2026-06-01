import httpClient from '../api/httpClient'

export const apartamentoService = {
  getAll: (pisoId, params = {}) =>
    httpClient.get('/apartamentos', { params: { pisoId, ...params } }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/apartamentos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/apartamentos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/apartamentos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/apartamentos/${id}`),
}
