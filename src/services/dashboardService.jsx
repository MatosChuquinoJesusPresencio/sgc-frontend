import { fetchApi } from '../api/api';

export const getSuperAdminDashboard = () =>
    fetchApi('/dashboard/super-admin');
