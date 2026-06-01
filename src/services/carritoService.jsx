import httpClient from '../api/httpClient'

export const carritoService = {
  getAll: (condominioId, params = {}) =>
    httpClient.get('/carritos', { params: { condominioId, ...params } }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/carritos/${id}`).then((r) => r.data),

  create: (data) =>
    httpClient.post('/carritos', data).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/carritos/${id}`, data).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/carritos/${id}`),

  updateEstado: (id, estado) =>
    httpClient.patch(`/carritos/${id}/estado`, { estado }).then((r) => r.data),

  prestar: (carritoId, data) =>
    httpClient.post(`/carritos/${carritoId}/prestar`, data).then((r) => r.data),

  devolver: (logId, data) =>
    httpClient.post(`/carritos/prestamos/${logId}/devolver`, data).then((r) => r.data),
}
