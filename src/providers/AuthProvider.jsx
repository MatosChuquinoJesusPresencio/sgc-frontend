import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { fetchApi } from "../services/api";

import { VALID_ROLES, ROLES } from "../constants/roles";

const mapBackendRole = (backendRole) => {
  if (backendRole === "SUPER_ADMINISTRADOR") return ROLES.SUPER_ADMIN;
  if (backendRole === "ADMINISTRADOR_CONDOMINIO") return ROLES.ADMIN_CONDOMINIO;
  if (backendRole === "PROPIETARIO") return ROLES.PROPIETARIO;
  if (backendRole === "AGENTE_SEGURIDAD") return ROLES.AGENTE_SEGURIDAD;
  return null;
};

const buildSessionUser = (userData) => ({
  id: userData.id,
  nombre: `${userData.nombres} ${userData.apellidos}`,
  nombres: userData.nombres,
  apellidos: userData.apellidos,
  correo: userData.correo,
  role: mapBackendRole(userData.rol),
  idCondominio: userData.idCondominio ?? null,
});

const persistUser = (sessionUser, rememberMe) => {
  const raw = JSON.stringify(sessionUser);
  if (rememberMe) {
    localStorage.setItem("authUser", raw);
  } else {
    sessionStorage.setItem("authUser", raw);
  }
};

const clearPersistedUser = () => {
  localStorage.removeItem("authUser");
  sessionStorage.removeItem("authUser");
};

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const verifySession = async () => {
      if (!authUser) return;
      try {
        const response = await fetchApi('/auth/me');
        if (!mounted || !response) return;

        const roleName = mapBackendRole(response.rol);
        if (!roleName || !VALID_ROLES.includes(roleName)) {
          throw new Error("Rol no v\u00e1lido");
        }

        const sessionUser = buildSessionUser(response);
        setAuthUser(sessionUser);

        const hasLocal = localStorage.getItem("authUser");
        const hasSession = sessionStorage.getItem("authUser");
        if (hasLocal) localStorage.setItem("authUser", JSON.stringify(sessionUser));
        else if (hasSession) sessionStorage.setItem("authUser", JSON.stringify(sessionUser));
      } catch (error) {
        if (mounted && error?.status === 401) {
          setAuthUser(null);
          clearPersistedUser();
        }
      }
    };

    verifySession();
    return () => { mounted = false; };
  }, []);

  const isAuthenticated = !!authUser;

  const login = async (userData) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: {
          correo: userData.email,
          contrasena: userData.password,
          recuerdame: userData.rememberMe || false,
        },
      });

      const foundUser = response.usuario;
      const roleName = mapBackendRole(foundUser.rol);

      if (!roleName || !VALID_ROLES.includes(roleName)) {
        setAuthError("Rol no permitido en el sistema");
        return { success: false };
      }

      const sessionUser = buildSessionUser(foundUser);
      setAuthUser(sessionUser);
      persistUser(sessionUser, userData.rememberMe);

      return { success: true };
    } catch (e) {
      let errorMessage = e.message || "Error al conectar con el servidor.";
      if (e.status === 401 || e.status === 403) {
        errorMessage = "Credenciales incorrectas.";
      }
      setAuthError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      try {
        await fetchApi('/auth/logout', { method: 'POST' });
      } catch (e) {
        console.warn("Logout request failed, clearing local session.", e);
      }

      setAuthUser(null);
      clearPersistedUser();
      return { success: true };
    } catch (e) {
      setAuthError(`Error inesperado al cerrar sesi\u00f3n: ${e.message}`);
      return { success: false, error: e.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await fetchApi('/auth/forgot-password', {
        method: 'POST',
        body: { correo: email },
      });

      return { success: true };
    } catch (e) {
      setAuthError(e.message || "Error al solicitar la recuperaci\u00f3n.");
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const validateResetToken = (token) => {
    if (!token) return { valid: false, reason: "No se proporcion\u00f3 un token." };
    return { valid: true };
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await fetchApi('/auth/reset-password', {
        method: 'POST',
        body: { token, nuevaContrasena: newPassword },
      });

      return { success: true };
    } catch (e) {
      setAuthError(e.message || "Error al restablecer la contrase\u00f1a.");
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
        authError,
        login,
        logout,
        forgotPassword,
        validateResetToken,
        resetPassword,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};