import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { authService } from "../services/authService";
import { ApiError } from "../api/apiError";

const mapUsuarioToSessionUser = (usuario) => ({
  id: usuario.id,
  nombre: `${usuario.nombres} ${usuario.apellidos}`,
  id_condominio: usuario.condominioId,
  role: usuario.rol,
});

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    authService
      .me()
      .then((data) => setAuthUser(mapUsuarioToSessionUser(data)))
      .catch(() => setAuthUser(null))
      .finally(() => setInitialLoading(false));
  }, []);

  const isAuthenticated = !!authUser;

  const login = async ({ email, password }) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const data = await authService.login(email, password);
      setAuthUser(mapUsuarioToSessionUser(data.usuario));

      return { success: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Error inesperado al iniciar sesión";
      setAuthError(message);
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await authService.logout();
      setAuthUser(null);

      return { success: true };
    } catch {
      setAuthError("Error inesperado al cerrar sesión");
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await authService.forgotPassword(email);

      return { success: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Error inesperado";
      setAuthError(message);
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const validateResetToken = (token) => {
    if (!token) return { valid: false, reason: "No se proporcionó un token." };
    return { valid: true, email: null };
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await authService.resetPassword(token, newPassword);

      return { success: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Error inesperado";
      setAuthError(message);
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await authService.changePassword(currentPassword, newPassword);

      return { success: true };
    } catch (e) {
      const message = e instanceof ApiError ? e.message : "Error inesperado";
      setAuthError(message);
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        authUser,
        authLoading,
        initialLoading,
        authError,
        login,
        logout,
        forgotPassword,
        validateResetToken,
        resetPassword,
        changePassword,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
