import { fetchApi } from './api';

export const authService = {
  login: (correo, contrasena, recuerdame = false) =>
    fetchApi('/auth/login', {
      method: 'POST',
      body: { correo, contrasena, recuerdame },
    }),

  logout: () =>
    fetchApi('/auth/logout', { method: 'POST' }),

  refresh: () =>
    fetchApi('/auth/refresh', { method: 'POST' }),

  me: () =>
    fetchApi('/auth/me'),

  forgotPassword: (correo) =>
    fetchApi('/auth/forgot-password', {
      method: 'POST',
      body: { correo },
    }),

  resetPassword: (token, nuevaContrasena) =>
    fetchApi('/auth/reset-password', {
      method: 'POST',
      body: { token, nuevaContrasena },
    }),

  changePassword: (contrasenaActual, nuevaContrasena) =>
    fetchApi('/auth/change-password', {
      method: 'PUT',
      body: { contrasenaActual, nuevaContrasena },
    }),

  updateEmail: (nuevoCorreo, contrasena) =>
    fetchApi('/auth/email', {
      method: 'PUT',
      body: { nuevoCorreo, contrasena },
    }),

  verifyEmail: (token) =>
    fetchApi(`/auth/verify-email?token=${token}`, { method: 'POST' }),
};
