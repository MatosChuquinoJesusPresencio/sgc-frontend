import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import PrivateLayout from "../layouts/PrivateLayout";

import PrivateRoute from "./PrivateRoute";
import PublicRoute from "./PublicRoute";
import RoleRoute from "./RoleRoute";

import LoginPage from "../pages/auth/LoginPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import SecurityPage from "../pages/auth/SecurityPage";
import VerificarEmailPage from "../pages/auth/VerificarEmailPage";

import UnauthorizedPage from "../pages/error/UnauthorizedPage";
import NotFoundPage from "../pages/error/NotFoundPage";

import RedirectPage from "../pages/utility/RedirectPage";

import SADashboardPage from "../pages/super-admin/SADashboardPage";
import SACondominiosPage from "../pages/super-admin/SACondominiosPage";
import SAUsuariosPage from "../pages/super-admin/SAUsuariosPage";


import ACDashboardPage from "../pages/admin-condominio/ACDashboardPage";
import ACMiCondominioPage from "../pages/admin-condominio/ACMiCondominioPage";
import ACInfraestructuraPage from "../pages/admin-condominio/ACInfraestructuraPage";
import ACApartamentosPage from "../pages/admin-condominio/ACApartamentosPage";
import ACUsuariosPage from "../pages/admin-condominio/ACUsuariosPage";
import ACHistorialPage from "../pages/admin-condominio/ACHistorialPage";
import ACEstacionamientosPage from "../pages/admin-condominio/ACEstacionamientosPage";
import ACCarritosPage from "../pages/admin-condominio/ACCarritosPage";

import PRDashboardPage from "../pages/propietario/PRDashboardPage";
import PRMiApartamentoPage from "../pages/propietario/PRMiApartamentoPage";
import PRVehiculosPage from "../pages/propietario/PRVehiculosPage";
import PRHistorialPage from "../pages/propietario/PRHistorialPage";
import PRCarritosPage from "../pages/propietario/PRCarritosPage";

const AppRouter = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          }
        />
        <Route
          path="/verificar-email"
          element={<VerificarEmailPage />}
        />

        <Route
          element={
            <PrivateRoute>
              <PrivateLayout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<RedirectPage />} />
          <Route path="/perfil/seguridad" element={<SecurityPage />} />

          <Route
            path="/super-admin"
            element={<RoleRoute allowedRoles={["SUPER_ADMINISTRADOR"]} />}
          >
            <Route index element={<SADashboardPage />} />
            <Route path="condominios" element={<SACondominiosPage />} />
            <Route path="usuarios" element={<SAUsuariosPage />} />
          </Route>

          <Route
            path="/admin-condominio"
            element={<RoleRoute allowedRoles={["ADMINISTRADOR_CONDOMINIO"]} />}
          >
            <Route index element={<ACDashboardPage />} />
            <Route path="mi-condominio" element={<ACMiCondominioPage />} />
            <Route path="infraestructura" element={<ACInfraestructuraPage />} />
            <Route path="apartamentos" element={<ACApartamentosPage />} />
            <Route
              path="estacionamientos"
              element={<ACEstacionamientosPage />}
            />
            <Route path="usuarios" element={<ACUsuariosPage />} />
            <Route path="carritos" element={<ACCarritosPage />} />
            <Route path="historial" element={<ACHistorialPage />} />
          </Route>

          <Route
            path="/propietario"
            element={<RoleRoute allowedRoles={["PROPIETARIO"]} />}
          >
            <Route index element={<PRDashboardPage />} />
            <Route path="mi-apartamento" element={<PRMiApartamentoPage />} />
            <Route path="vehiculos" element={<PRVehiculosPage />} />
            <Route path="carritos" element={<PRCarritosPage />} />
            <Route path="historial" element={<PRHistorialPage />} />
          </Route>
        </Route>

        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AppRouter;
