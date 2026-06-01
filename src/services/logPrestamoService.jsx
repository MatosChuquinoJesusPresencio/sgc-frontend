import httpClient from '../api/httpClient'

export const logPrestamoService = {
  getAll: (params = {}) =>
    httpClient.get('/logs-prestamo', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/logs-prestamo/${id}`).then((r) => r.data),
}
