import httpClient from '../api/httpClient'

export const usuarioService = {
  getAll: (params = {}) =>
    httpClient.get('/usuarios', { params }).then((r) => r.data),

  getById: (id) =>
    httpClient.get(`/usuarios/${id}`).then((r) => r.data),

  update: (id, data) =>
    httpClient.put(`/usuarios/${id}`, data).then((r) => r.data),

  updateEstado: (id, activo) =>
    httpClient.patch(`/usuarios/${id}/estado`, { activo }).then((r) => r.data),

  delete: (id) =>
    httpClient.delete(`/usuarios/${id}`),
}
