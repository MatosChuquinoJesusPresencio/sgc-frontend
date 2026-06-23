import { fetchApi } from './api';

const buildQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  return q.toString();
};

export const adminCondominioService = {
  getDashboardMetrics: () =>
    fetchApi('/admin/dashboard/metrics'),

  getMyCondominiumInfo: () =>
    fetchApi('/admin/condominium/my-info'),

  updateMyCondominium: (data) =>
    fetchApi('/admin/condominium/my-info', {
      method: 'PUT',
      body: data,
    }),

  getStructure: () =>
    fetchApi('/admin/structure'),

  createNode: (data) =>
    fetchApi('/admin/structure/nodes', {
      method: 'POST',
      body: data,
    }),

  deleteNode: (id, type) =>
    fetchApi(`/admin/structure/nodes/${id}?type=${type}`, {
      method: 'DELETE',
    }),

  getUsers: (params = {}) => {
    const q = buildQuery({ search: params.search, rol: params.role, activo: params.active, page: params.page, size: params.size });
    return fetchApi(`/admin/users${q ? '?' + q : ''}`);
  },

  deleteUser: (id) =>
    fetchApi(`/admin/users/${id}`, { method: 'DELETE' }),

  createUser: (data) =>
    fetchApi('/admin/users', {
      method: 'POST',
      body: data,
    }),

  updateUser: (id, data) =>
    fetchApi(`/admin/users/${id}`, {
      method: 'PUT',
      body: data,
    }),

  getApartments: () =>
    fetchApi('/admin/apartments'),

  assignOwner: (apartmentId, data) =>
    fetchApi(`/admin/apartments/${apartmentId}/assign-owner`, {
      method: 'PUT',
      body: data,
    }),

  updateOccupants: (apartmentId, data) =>
    fetchApi(`/admin/apartments/${apartmentId}/occupants`, {
      method: 'PUT',
      body: data,
    }),

  getAssets: () =>
    fetchApi('/admin/assets'),

  createAsset: (data) =>
    fetchApi('/admin/assets', {
      method: 'POST',
      body: data,
    }),

  updateAssetStatus: (id, data) =>
    fetchApi(`/admin/assets/${id}/status`, {
      method: 'PUT',
      body: data,
    }),

  deleteAsset: (id) =>
    fetchApi(`/admin/assets/${id}`, { method: 'DELETE' }),

  getLogs: (params = {}) => {
    const q = buildQuery({ type: params.type, userId: params.userId, fechaInicio: params.fechaInicio, fechaFin: params.fechaFin, page: params.page, size: params.size });
    return fetchApi(`/admin/logs${q ? '?' + q : ''}`);
  },
};
