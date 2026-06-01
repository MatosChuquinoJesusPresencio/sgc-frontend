import httpClient from '../api/httpClient'

export const inquilinoService = {
  getAll: (apartamentoId, params = {}) =>
    httpClient.get('/inquilinos', { params: { apartamentoId, ...params } }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/inquilinos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/inquilinos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/inquilinos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/inquilinos/${id}`),
}
