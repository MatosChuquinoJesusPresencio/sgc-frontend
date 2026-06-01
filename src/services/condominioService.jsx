import httpClient from '../api/httpClient'

export const condominioService = {
  getAll: (params = {}) =>
    httpClient.get('/condominios', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/condominios/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/condominios', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/condominios/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/condominios/${id}`),
}
