import httpClient from '../api/httpClient'

export const estacionamientoService = {
  getAll: (params = {}) =>
    httpClient.get('/estacionamientos', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/estacionamientos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/estacionamientos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/estacionamientos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/estacionamientos/${id}`),

  configurar: (id, data) =>
    httpClient.patch(`/estacionamientos/${id}/configurar`, data).then((r) => r.data),
}
