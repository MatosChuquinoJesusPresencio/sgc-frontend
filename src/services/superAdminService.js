import { fetchApi } from './api';

const buildQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  return q.toString();
};

export const superAdminService = {
  getDashboardMetrics: () =>
    fetchApi('/super-admin/dashboard/metrics'),

  getRecentAdmins: () =>
    fetchApi('/super-admin/dashboard/recent-admins'),

  getRecentCondos: () =>
    fetchApi('/super-admin/dashboard/recent-condos'),

  getAdministrators: (params = {}) => {
    const q = buildQuery({ search: params.search, activo: params.active, page: params.page, size: params.size });
    return fetchApi(`/super-admin/administrators${q ? '?' + q : ''}`);
  },

  createAdministrator: (data) =>
    fetchApi('/super-admin/administrators', {
      method: 'POST',
      body: data,
    }),

  updateAdministrator: (id, data) =>
    fetchApi(`/super-admin/administrators/${id}`, {
      method: 'PUT',
      body: data,
    }),

  toggleAdministratorStatus: (id, data) =>
    fetchApi(`/super-admin/administrators/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteAdministrator: (id) =>
    fetchApi(`/super-admin/administrators/${id}`, {
      method: 'DELETE',
    }),

  assignCondominium: (id, data) =>
    fetchApi(`/super-admin/administrators/${id}/assign-condo`, {
      method: 'PUT',
      body: data,
    }),

  getUnassignedAdministrators: () =>
    fetchApi('/super-admin/administrators/available'),

  getCondominiums: (params = {}) => {
    const q = buildQuery({ search: params.search, activo: params.active, page: params.page, size: params.size });
    return fetchApi(`/super-admin/condominiums${q ? '?' + q : ''}`);
  },

  createCondominium: (data) =>
    fetchApi('/super-admin/condominiums', {
      method: 'POST',
      body: data,
    }),

  updateCondominium: (id, data) =>
    fetchApi(`/super-admin/condominiums/${id}`, {
      method: 'PUT',
      body: data,
    }),

  toggleCondominiumStatus: (id, data) =>
    fetchApi(`/super-admin/condominiums/${id}`, {
      method: 'PATCH',
      body: data,
    }),

  deleteCondominium: (id) =>
    fetchApi(`/super-admin/condominiums/${id}`, {
      method: 'DELETE',
    }),

  getUnassignedCondominiums: () =>
    fetchApi('/super-admin/condominiums/unassigned'),

  getUsers: (params = {}) => {
    const q = buildQuery({ search: params.search, rol: params.role, activo: params.active, page: params.page, size: params.size });
    return fetchApi(`/super-admin/users${q ? '?' + q : ''}`);
  },

  invalidateSession: (id) =>
    fetchApi(`/super-admin/users/${id}/invalidate-session`, {
      method: 'POST',
    }),

  forcePasswordChange: (id, data) =>
    fetchApi(`/super-admin/users/${id}/force-password`, {
      method: 'PUT',
      body: data,
    }),
};
