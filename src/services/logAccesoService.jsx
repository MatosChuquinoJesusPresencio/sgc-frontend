import httpClient from '../api/httpClient'

export const logAccesoService = {
  getAll: (params = {}) =>
    httpClient.get('/logs-acceso', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/logs-acceso/${id}`).then((r) => r.data),

  registrarEntrada: (data) =>
    httpClient.post('/logs-acceso/entrada', data).then((r) => r.data),

  registrarSalida: (id) =>
    httpClient.post(`/logs-acceso/${id}/salida`).then((r) => r.data),
}
