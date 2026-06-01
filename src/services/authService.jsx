import httpClient from '../api/httpClient'

export const authService = {
  login: (email, password) =>
    httpClient.post('/auth/login', { email, password }).then((r) => r.data),

  logout: () =>
    httpClient.post('/auth/logout').then((r) => r.data),

  refresh: () =>
    httpClient.post('/auth/refresh').then((r) => r.data),

  me: () =>
    httpClient.get('/auth/me').then((r) => r.data),

  register: (data) =>
    httpClient.post('/auth/register', data).then((r) => r.data),

  forgotPassword: (email) =>
    httpClient.post('/auth/forgot-password', { email }).then((r) => r.data),

  resetPassword: (token, password) =>
    httpClient.post('/auth/reset-password', { token, password }).then((r) => r.data),

  changePassword: (currentPassword, newPassword) =>
    httpClient.post('/auth/change-password', { currentPassword, newPassword }).then((r) => r.data),

  updateEmail: (email) =>
    httpClient.patch('/auth/email', { email }).then((r) => r.data),
}
