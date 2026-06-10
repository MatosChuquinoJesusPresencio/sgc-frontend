import { useState, useEffect } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { loginUser, logoutUser, forgotPassword as forgotPasswordApi, resetPassword as resetPasswordApi, verifySession as verifySessionApi } from "../services/authService";

import { VALID_ROLES, ROLES } from "../constants/roles";

export const AuthProvider = ({ children }) => {
  const [authLoading, setAuthLoading] = useState(false);
  const [authUser, setAuthUser] = useState(() => {
    const storedUser = localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [authError, setAuthError] = useState(null);

  // Verificar la sesión real con el backend cuando carga la aplicación
  useEffect(() => {
    let mounted = true;
    const verifySession = async () => {
      if (authUser) {
        try {
          const response = await verifySessionApi();
          if (mounted && response) {
            const backendRole = response.rol;
            let roleName = ROLES.SUPER_ADMIN; 
            if (backendRole === "SUPER_ADMINISTRADOR") roleName = ROLES.SUPER_ADMIN;
            else if (backendRole === "ADMINISTRADOR_CONDOMINIO") roleName = ROLES.ADMIN_CONDOMINIO;
            else if (backendRole === "PROPIETARIO") roleName = ROLES.PROPIETARIO;

            const sessionUser = {
              id: response.id,
              nombre: response.nombres + " " + response.apellidos,
              role: roleName,
            };
            
            setAuthUser(sessionUser);
            if (localStorage.getItem("authUser")) {
              localStorage.setItem("authUser", JSON.stringify(sessionUser));
            } else if (sessionStorage.getItem("authUser")) {
              sessionStorage.setItem("authUser", JSON.stringify(sessionUser));
            }
          }
        } catch (error) {
          // Si el token expira y falla el refresh, el backend devolverá 401
          if (mounted && error?.response?.status === 401) {
            setAuthUser(null);
            localStorage.removeItem("authUser");
            sessionStorage.removeItem("authUser");
          }
        }
      }
    };
    
    verifySession();
    return () => { mounted = false; };
  }, []); // Solo al montar

  const isAuthenticated = !!authUser;

  const login = async (userData) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      const response = await loginUser(userData.email, userData.password, userData.rememberMe || false);

      // El backend retorna la información del usuario en la respuesta exitosa
      const foundUser = response;
      
      // Mapeamos el rol del backend al rol del frontend
      const backendRole = foundUser.rol;
      let roleName = ROLES.SUPER_ADMIN; // Valor por defecto
      if (backendRole === "SUPER_ADMINISTRADOR") roleName = ROLES.SUPER_ADMIN;
      else if (backendRole === "ADMINISTRADOR_CONDOMINIO") roleName = ROLES.ADMIN_CONDOMINIO;
      else if (backendRole === "PROPIETARIO") roleName = ROLES.PROPIETARIO;

      if (!VALID_ROLES.includes(roleName)) {
        setAuthError("Rol no permitido en el sistema");
        return { success: false };
      }

      // Creamos la sesión para guardar en el estado global
      const sessionUser = {
        id: foundUser.id,
        nombre: foundUser.nombres + " " + foundUser.apellidos,
        role: roleName,
      };

      setAuthUser(sessionUser);

      if (userData.rememberMe) {
        localStorage.setItem("authUser", JSON.stringify(sessionUser));
      } else {
        sessionStorage.setItem("authUser", JSON.stringify(sessionUser));
      }

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
        await logoutUser();
      } catch (e) {
        console.warn("Logout request failed, but we will clear local session anyway.", e);
      }

      setAuthUser(null);
      localStorage.removeItem("authUser");
      sessionStorage.removeItem("authUser");
      return { success: true };
    } catch (e) {
      setAuthError(`Error inesperado al cerrar sesión: ${e.message}`);
      return { success: false, error: e.message };
    } finally {
      setAuthLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setAuthLoading(true);
      setAuthError(null);
      
      await forgotPasswordApi(email);

      return { success: true };
    } catch (e) {
      setAuthError(e.message || "Error al solicitar la recuperación.");
      return { success: false };
    } finally {
      setAuthLoading(false);
    }
  };

  const validateResetToken = (token) => {
    if (!token) return { valid: false, reason: "No se proporcionó un token." };
    // La validación real se hará en el backend al momento de enviar la nueva contraseña.
    return { valid: true };
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setAuthLoading(true);
      setAuthError(null);

      await resetPasswordApi(token, newPassword);

      return { success: true };
    } catch (e) {
      setAuthError(e.message || "Error al restablecer la contraseña.");
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