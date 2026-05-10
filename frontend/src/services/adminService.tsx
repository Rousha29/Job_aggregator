import API from './authService';

export const getStats = () =>
  API.get('/admin/stats');

export const getOffers = () =>
  API.get('/admin/offers');

export const toggleOfferVisibility = (id: string, is_visible: boolean) =>
  API.patch(`/admin/offers/${id}/visibility`, { is_visible });

export const updateOffer = (
  id: string,
  payload: {
    title?: string;
    company?: string;
    contract_type?: string;
    is_visible?: boolean;
  }
) => API.patch(`/admin/offers/${id}`, payload);

export const deleteOffer = (id: string) =>
  API.delete(`/admin/offers/${id}`);

export const getUsers = () =>
  API.get('/admin/users');

export const changeUserRole = (id: string, role: string) =>
  API.patch(`/admin/users/${id}/role`, { role });

export const deleteUser = (id: string) =>
  API.delete(`/admin/users/${id}`);

export const triggerIngestion = () =>
  API.post('/offers/import');