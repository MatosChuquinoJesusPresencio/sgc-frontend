import axios from 'axios'
import { ApiError } from './apiError'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const httpClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true

      if (!isRefreshing) {
        isRefreshing = true
        try {
          await axios.post(`${BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          isRefreshing = false
          return httpClient(original)
        } catch {
          isRefreshing = false
          window.location.href = '/login'
          return Promise.reject(error)
        }
      } else {
        await new Promise((r) => setTimeout(r, 500))
        return httpClient(original)
      }
    }

    return Promise.reject(ApiError.fromAxios(error))
  }
)

export default httpClient
