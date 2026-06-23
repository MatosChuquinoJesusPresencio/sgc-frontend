import { fetchApi } from './api';

const buildQuery = (params) => {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v);
  });
  return q.toString();
};

export const propietarioService = {
  getDashboardSummary: () =>
    fetchApi('/homeowner/dashboard/summary'),

  getApartmentDetails: () =>
    fetchApi('/homeowner/apartment/details'),

  getTenants: () =>
    fetchApi('/homeowner/tenants'),

  createTenant: (data) =>
    fetchApi('/homeowner/tenants', {
      method: 'POST',
      body: data,
    }),

  deleteTenant: (id) =>
    fetchApi(`/homeowner/tenants/${id}`, {
      method: 'DELETE',
    }),

  getVehicles: () =>
    fetchApi('/homeowner/vehicles'),

  createVehicle: (data) =>
    fetchApi('/homeowner/vehicles', {
      method: 'POST',
      body: data,
    }),

  deleteVehicle: (id) =>
    fetchApi(`/homeowner/vehicles/${id}`, {
      method: 'DELETE',
    }),

  getLogs: (params = {}) => {
    const q = buildQuery({ fechaInicio: params.fechaInicio, fechaFin: params.fechaFin, page: params.page, size: params.size });
    return fetchApi(`/homeowner/logs${q ? '?' + q : ''}`);
  },
};
