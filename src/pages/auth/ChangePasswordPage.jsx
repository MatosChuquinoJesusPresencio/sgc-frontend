import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Lock, Save, Shield, Info, AlertTriangle, CheckCircle } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { fetchApi } from "../../services/api";

import AnimatedPage from "../../components/animations/AnimatedPage";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FormInput from "../../components/form/FormInput";

const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const newPassword = watch("newPassword");

  const onSubmit = async (data) => {
    setError(null);
    setLoading(true);

    try {
      await fetchApi("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      setSuccess(true);
      reset();

      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err) {
      setError(err.message || "Ocurrió un error al intentar cambiar la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          title="Configuración de Seguridad"
          badgeText="Perfil"
          welcomeText="Actualiza tus credenciales de acceso para mantener tu cuenta protegida."
        />

        <div className="security-card">
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2 mb-4">
                <div className="cell-icon primary">
                  <Shield size={16} />
                </div>
                Cambiar Contraseña
              </h5>

              <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <div className="security-tip">
                  <div className="security-tip-icon">
                    <Info size={16} />
                  </div>
                  <div className="security-tip-text">
                    <h6>Recomendación</h6>
                    <p>Usa al menos 6 caracteres y combina letras con números para una mayor seguridad.</p>
                  </div>
                </div>

                <FormInput
                  label="Contraseña Actual"
                  type="password"
                  placeholder="Escribe tu contraseña actual"
                  register={register}
                  name="currentPassword"
                  validation={{
                    required: "La contraseña actual es obligatoria",
                  }}
                  error={errors.currentPassword}
                />

                <FormInput
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  register={register}
                  name="newPassword"
                  validation={{
                    required: "La nueva contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  }}
                  error={errors.newPassword}
                />

                <FormInput
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  register={register}
                  name="confirmPassword"
                  validation={{
                    required: "Debe confirmar la nueva contraseña",
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  }}
                  error={errors.confirmPassword}
                />

                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={loading}
                >
                  {loading ? (
                    <><span className="spinner" /> Actualizando...</>
                  ) : (
                    <><Save size={16} /> Actualizar Contraseña</>
                  )}
                </button>

                {error && (
                  <div className="alert alert-danger mt-3">
                    <AlertTriangle size={14} />
                    <span>{error}</span>
                    <button
                      onClick={() => setError(null)}
                      style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {success && (
                  <div className="alert alert-success mt-3">
                    <CheckCircle size={14} />
                    <span>¡Contraseña actualizada con éxito! Redirigiendo al inicio...</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ChangePasswordPage;
