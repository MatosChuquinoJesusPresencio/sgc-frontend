import { fetchApi } from './api';

export const profileService = {
  getProfile: () =>
    fetchApi('/profile'),

  updateProfile: (nombres, apellidos, telefono) =>
    fetchApi('/profile', {
      method: 'PUT',
      body: { nombres, apellidos, telefono },
    }),
};
