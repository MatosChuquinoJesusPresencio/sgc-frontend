export class ApiError extends Error {
  constructor(status, message, errors = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }

  static fromAxios(error) {
    if (error.response) {
      const { status, data } = error.response
      return new ApiError(
        status,
        data.message || 'Error del servidor',
        data.errors || {}
      )
    }
    if (error.request) {
      return new ApiError(0, 'No se pudo conectar con el servidor')
    }
    return new ApiError(0, error.message)
  }
}
