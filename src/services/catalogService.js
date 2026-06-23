import { fetchApi } from './api';

export const catalogService = {
  getCountries: () =>
    fetchApi('/catalogs/countries'),

  getCities: (countryId) =>
    fetchApi(`/catalogs/countries/${countryId}/cities`),
};
