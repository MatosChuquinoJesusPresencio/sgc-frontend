import { fetchApi } from '../api/api';

export const getUsuarios = (params) =>
    fetchApi('/usuarios', { params });

export const getUsuario = (id) =>
    fetchApi(`/usuarios/${id}`);

export const createUsuario = (data) =>
    fetchApi('/usuarios', { method: 'POST', body: JSON.stringify(data) });

export const updateUsuario = (id, data) =>
    fetchApi(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteUsuario = (id) =>
    fetchApi(`/usuarios/${id}`, { method: 'DELETE' });

export const toggleUsuarioEstado = (id) =>
    fetchApi(`/usuarios/${id}/estado`, { method: 'PATCH' });
