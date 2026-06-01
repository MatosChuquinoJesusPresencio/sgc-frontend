import httpClient from '../api/httpClient'

export const vehiculoService = {
  getAll: (params = {}) =>
    httpClient.get('/vehiculos', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/vehiculos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/vehiculos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/vehiculos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/vehiculos/${id}`),
}
