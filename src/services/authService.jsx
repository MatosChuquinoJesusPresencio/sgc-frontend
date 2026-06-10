import { fetchApi } from '../api/api';

export const loginUser = (email, password, rememberMe) =>
    fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe })
    });

export const logoutUser = () =>
    fetchApi('/auth/logout', { method: 'POST' });

export const verifySession = () =>
    fetchApi('/auth/me');

export const forgotPassword = (email) =>
    fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email })
    });

export const resetPassword = (token, password) =>
    fetchApi('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password })
    });

export const changePassword = (currentPassword, newPassword) =>
    fetchApi('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword })
    });
