# Plan de Integración SGC - Backend ↔ Frontend

## Diagnóstico

- **Backend:** 68 endpoints operativos en 8 controladores con arquitectura hexagonal
- **Frontend:** Solo 7 llamadas reales a la API (todo auth). El resto usa datos mock en `localStorage` vía `DataContext`
- **Rol faltante:** `AGENTE_SEGURIDAD` está excluido de `VALID_ROLES` en el frontend

---

## 1. Servicios API a Crear

| Servicio | Endpoints |
|---|---|
| `src/services/authService.js` | login, logout, refresh, me, forgot-password, reset-password, change-password, email, verify-email |
| `src/services/profileService.js` | GET/PUT /api/profile |
| `src/services/catalogService.js` | GET /api/catalogs/countries, GET /api/catalogs/countries/{id}/cities |
| `src/services/superAdminService.js` | 20 endpoints (admins, condominiums, users, dashboard, metrics) |
| `src/services/adminCondominioService.js` | 16 endpoints (dashboard, structure, users, assets, logs) |
| `src/services/securityService.js` | 8 endpoints (dashboard, parking, vehicles, cart loans, access logs) |
| `src/services/propietarioService.js` | 9 endpoints (dashboard, apartment, tenants, vehicles, logs) |

---

## 2. Fases de Implementación

### Fase 1 — Base

- [ ] Limpiar `api.js` (fix `fetchApi`, mejorar manejo de errores)
- [ ] Actualizar `AuthProvider.jsx`:
  - Mapear campos backend: `correo`/`contrasena` en lugar de `email`/`password`
  - Manejar `idCondominio` en la sesión del usuario
  - Agregar soporte para `AGENTE_SEGURIDAD`
- [ ] Eliminar `src/data/` (datos mock) progresivamente
- [ ] Agregar `AGENTE_SEGURIDAD` a `VALID_ROLES` en `roles.jsx`

### Fase 2 — Servicios API

- [ ] Crear `authService.js`
- [ ] Crear `profileService.js`
- [ ] Crear `catalogService.js`
- [ ] Crear `superAdminService.js`
- [ ] Crear `adminCondominioService.js`
- [ ] Crear `securityService.js`
- [ ] Crear `propietarioService.js`

### Fase 3 — Super Admin (3 páginas)

- [ ] `SADashboardPage.jsx`
  - Usar `superAdminService.getDashboardMetrics()`
  - Usar `superAdminService.getRecentAdmins()`
  - Usar `superAdminService.getRecentCondos()`
- [ ] `SACondominiosPage.jsx`
  - Usar `superAdminService.getCondominiums(search, active, page, size)`
  - Usar `superAdminService.createCondominium(data)`
  - Usar `superAdminService.updateCondominium(id, data)`
  - Usar `superAdminService.toggleCondominiumStatus(id, data)`
  - Usar `superAdminService.deleteCondominium(id)`
  - Usar `superAdminService.getUnassignedCondominiums()`
  - Usar `superAdminService.getUnassignedAdministrators()`
  - Usar `catalogService.getCountries()`
  - Usar `catalogService.getCities(countryId)`
- [ ] `SAUsuariosPage.jsx`
  - Usar `superAdminService.getUsers(search, role, active, page, size)`
  - Usar `superAdminService.createAdministrator(data)`
  - Usar `superAdminService.updateAdministrator(id, data)`
  - Usar `superAdminService.toggleUserStatus(id, data)`
  - Usar `superAdminService.deleteUser(id)`
  - Usar `superAdminService.forcePasswordChange(id, data)`
  - Usar `superAdminService.invalidateSession(id)`

### Fase 4 — Admin Condominio (8 páginas)

- [ ] `ACDashboardPage.jsx`
  - Usar `adminCondominioService.getDashboardMetrics()`
- [ ] `ACMiCondominioPage.jsx`
  - Usar `adminCondominioService.getMyCondominiumInfo()`
  - Usar `adminCondominioService.updateMyCondominium(data)`
- [ ] `ACInfraestructuraPage.jsx`
  - Usar `adminCondominioService.getStructure()`
  - Usar `adminCondominioService.createNode(data)`
  - Usar `adminCondominioService.deleteNode(id)`
- [ ] `ACApartamentosPage.jsx`
  - Usar `adminCondominioService.getApartments()`
  - Usar `adminCondominioService.assignOwner(apartmentId, ownerId)`
  - Usar `adminCondominioService.updateOccupants(apartmentId, data)`
- [ ] `ACUsuariosPage.jsx`
  - Usar `adminCondominioService.getUsers(search, role, active, page, size)`
  - Usar `adminCondominioService.createUser(data)`
  - Usar `adminCondominioService.updateUser(id, data)`
- [ ] `ACEstacionamientosPage.jsx`
  - Usar `adminCondominioService.getAssets()`
  - Usar `adminCondominioService.createAsset(data)`
  - Usar `adminCondominioService.updateAssetStatus(id, data)`
- [ ] `ACCarritosPage.jsx`
  - Usar `adminCondominioService.getAssets()`
  - Usar `adminCondominioService.createAsset(data)`
  - Usar `adminCondominioService.updateAssetStatus(id, data)`
- [ ] `ACHistorialPage.jsx`
  - Usar `adminCondominioService.getLogs(type, userId, fechaInicio, fechaFin, page, size)`

### Fase 5 — Propietario (5 páginas)

- [ ] `PRDashboardPage.jsx`
  - Usar `propietarioService.getDashboardSummary()`
- [ ] `PRMiApartamentoPage.jsx`
  - Usar `propietarioService.getApartmentDetails()`
- [ ] `PRVehiculosPage.jsx`
  - Usar `propietarioService.getVehicles()`
  - Usar `propietarioService.createVehicle(data)`
  - Usar `propietarioService.deleteVehicle(id)`
- [ ] `PRCarritosPage.jsx`
  - Usar `securityService.getActiveCartLoans()` (compartido)
- [ ] `PRHistorialPage.jsx`
  - Usar `propietarioService.getLogs(fechaInicio, fechaFin, page, size)`

### Fase 6 — Seguridad (Agente) + Limpieza

- [ ] Crear páginas para `AGENTE_SEGURIDAD` en `src/pages/seguridad/`
- [ ] Agregar rutas `/seguridad/*` en `AppRouter.jsx`
- [ ] Actualizar modales (`CondoFormModal`, `UserFormModal`, `CondoDetailModal`, etc.) para usar API
- [ ] Remover `DataContext`/`DataProvider` cuando todas las páginas migren
- [ ] Remover carpeta `src/data/`

---

## 3. Notas Técnicas

### Autenticación

- Login envía `{ correo, contrasena, recuerdame }` (no `email`/`password`)
- Respuesta: `{ usuario: UsuarioResponse, expiracionAccesoMs, expiracionRefrescoMs }`
- `UsuarioResponse`: `{ id, nombres, apellidos, correo, rol, idCondominio }`
- Refresh automático en interceptor 401

### Paginación

- Backend devuelve: `{ items: T[], total, pagina, tamano, totalPaginas, hayMas }`
- Query params: `?search=&active=&page=0&size=20`
- Adaptar `usePagination` y `DataTable` para recibir datos paginados del backend

### Catálogos

- `GET /api/catalogs/countries` → `[{ id, nombre, codigoIso }]`
- `GET /api/catalogs/countries/{id}/cities` → `[{ id, nombre, idPais }]`
- Cargar al abrir formulario de condominio

### Roles

| Backend | Frontend |
|---|---|
| `SUPER_ADMINISTRADOR` | `SUPER_ADMIN` |
| `ADMINISTRADOR_CONDOMINIO` | `ADMIN_CONDOMINIO` |
| `PROPIETARIO` | `PROPIETARIO` |
| `AGENTE_SEGURIDAD` | `AGENTE_SEGURIDAD` |

### fetchApi

- `fetchApi(url, options)` → wrapper sobre axios con `withCredentials: true`
- Usar `body` como objeto (no stringificar manualmente) — corregir en Fase 1

---

## 4. Archivos a Modificar/Crear

### Modificar

| Archivo | Cambio |
|---|---|
| `src/services/api.js` | Fix `fetchApi`, mejorar errores |
| `src/providers/AuthProvider.jsx` | Mapear campos backend, agregar `idCondominio`, soporte `AGENTE_SEGURIDAD` |
| `src/constants/roles.jsx` | Agregar `AGENTE_SEGURIDAD` a `VALID_ROLES` |
| `src/routers/AppRouter.jsx` | Agregar rutas seguridad |
| `src/pages/super-admin/SADashboardPage.jsx` | Migrar a API real |
| `src/pages/super-admin/SACondominiosPage.jsx` | Migrar a API real |
| `src/pages/super-admin/SAUsuariosPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACDashboardPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACMiCondominioPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACInfraestructuraPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACApartamentosPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACUsuariosPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACEstacionamientosPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACCarritosPage.jsx` | Migrar a API real |
| `src/pages/admin-condominio/ACHistorialPage.jsx` | Migrar a API real |
| `src/pages/propietario/PRDashboardPage.jsx` | Migrar a API real |
| `src/pages/propietario/PRMiApartamentoPage.jsx` | Migrar a API real |
| `src/pages/propietario/PRVehiculosPage.jsx` | Migrar a API real |
| `src/pages/propietario/PRCarritosPage.jsx` | Migrar a API real |
| `src/pages/propietario/PRHistorialPage.jsx` | Migrar a API real |
| `src/components/modals/CondoFormModal.jsx` | Usar catálogos de API |
| `src/components/modals/UserFormModal.jsx` | Usar API |
| `src/components/modals/CondoDetailModal.jsx` | Usar API |
| `src/components/modals/CondoRelationsModal.jsx` | Usar API |
| `src/components/modals/ConfirmDialog.jsx` | Sin cambios (genérico) |
| `src/components/modals/VehicleModal.jsx` | Usar API |
| `src/components/modals/ResidentModal.jsx` | Usar API |
| `src/hooks/usePagination.jsx` | Adaptar para paginación server-side |
| `src/hooks/useHistoryMappings.jsx` | Adaptar para datos reales |

### Crear

| Archivo | Propósito |
|---|---|
| `src/services/authService.js` | Llamadas auth |
| `src/services/profileService.js` | Llamadas perfil |
| `src/services/catalogService.js` | Llamadas catálogos |
| `src/services/superAdminService.js` | Llamadas super admin |
| `src/services/adminCondominioService.js` | Llamadas admin condominio |
| `src/services/securityService.js` | Llamadas seguridad |
| `src/services/propietarioService.js` | Llamadas propietario |
| `src/pages/seguridad/SEDashboardPage.jsx` | Dashboard agente seguridad |
| `src/pages/seguridad/SEEstacionamientosPage.jsx` | Estacionamientos agente |
| `src/pages/seguridad/SEAccesoPage.jsx` | Control acceso agente |
| `src/pages/seguridad/SEPrestamosPage.jsx` | Préstamos carrito agente |
| `src/pages/seguridad/SEHistorialPage.jsx` | Historial agente |

### Eliminar (progresivamente)

| Archivo | Reemplazo |
|---|---|
| `src/data/usuario.jsx` | API real |
| `src/data/condominio.jsx` | API real |
| `src/data/torre.jsx` | API real |
| `src/data/piso.jsx` | API real |
| `src/data/apartamento.jsx` | API real |
| `src/data/rol.jsx` | API real |
| `src/data/vehiculo.jsx` | API real |
| `src/data/estacionamiento.jsx` | API real |
| `src/data/carrito_carga.jsx` | API real |
| `src/data/log_prestamo_carrito.jsx` | API real |
| `src/data/log_access_vehicular.jsx` | API real |
| `src/data/inquilino_temporal.jsx` | API real |
| `src/data/configuracion.jsx` | API real |
| `src/providers/DataProvider.jsx` | API real |
| `src/contexts/DataContext.jsx` | API real |
| `src/hooks/useData.jsx` | API real |
