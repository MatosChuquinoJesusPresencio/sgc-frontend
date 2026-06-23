import { fetchApi } from './api';

export const securityService = {
  getDashboardStatus: () =>
    fetchApi('/security/dashboard/status'),

  getParkingSlots: () =>
    fetchApi('/security/parking-slots'),

  verifyVehicle: (plate) =>
    fetchApi(`/security/vehicles/verify/${encodeURIComponent(plate)}`),

  getActiveCartLoans: () =>
    fetchApi('/security/asset-loans/active-carts'),

  registerCartLoan: (data) =>
    fetchApi('/security/asset-loans', {
      method: 'POST',
      body: data,
    }),

  returnCartLoan: (id) =>
    fetchApi(`/security/asset-loans/${id}/return`, {
      method: 'PUT',
    }),

  registerVehicleEntry: (data) =>
    fetchApi('/security/access-logs/entry', {
      method: 'POST',
      body: data,
    }),

  registerVehicleExit: (data) =>
    fetchApi('/security/access-logs/exit', {
      method: 'PUT',
      body: data,
    }),
};
