import { fetchApi } from '../api/api';

export const getCondominios = (params) =>
    fetchApi('/condominios', { params });

export const getCondominio = (id) =>
    fetchApi(`/condominios/${id}`);

export const createCondominio = (data) =>
    fetchApi('/condominios', { method: 'POST', body: JSON.stringify(data) });

export const updateCondominio = (id, data) =>
    fetchApi(`/condominios/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteCondominio = (id) =>
    fetchApi(`/condominios/${id}`, { method: 'DELETE' });

export const getCondominioRelations = (id) =>
    fetchApi(`/condominios/${id}/relations`);
