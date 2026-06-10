import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Lock, Save, Shield, Mail, Info, AlertTriangle, CheckCircle } from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { changePassword, updateEmail } from "../../services/authService";

import AnimatedPage from "../../components/animations/AnimatedPage";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FormInput from "../../components/form/FormInput";

const SecurityPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [loadingPwd, setLoadingPwd] = useState(false);
  const [errorPwd, setErrorPwd] = useState(null);
  const [successPwd, setSuccessPwd] = useState(false);

  const [loadingEmail, setLoadingEmail] = useState(false);
  const [errorEmail, setErrorEmail] = useState(null);
  const [successEmail, setSuccessEmail] = useState(false);

  const {
    register: registerPwd,
    handleSubmit: handleSubmitPwd,
    watch: watchPwd,
    reset: resetPwd,
    formState: { errors: errorsPwd },
  } = useForm();

  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    watch: watchEmail,
    reset: resetEmail,
    formState: { errors: errorsEmail },
  } = useForm();

  const newPassword = watchPwd("newPassword");

  const onSubmitPwd = async (data) => {
    setErrorPwd(null);
    setLoadingPwd(true);

    try {
      await changePassword(data.currentPassword, data.newPassword);

      setSuccessPwd(true);
      resetPwd();

      setTimeout(() => {
        setSuccessPwd(false);
      }, 5000);
    } catch (err) {
      setErrorPwd(err.message || "Ocurrió un error al intentar cambiar la contraseña.");
    } finally {
      setLoadingPwd(false);
    }
  };

  const onSubmitEmail = async (data) => {
    setErrorEmail(null);
    setLoadingEmail(true);

    try {
      await updateEmail(data.nuevoCorreo);

      setSuccessEmail(true);
      resetEmail();

      setTimeout(() => {
        setSuccessEmail(false);
      }, 10000);
    } catch (err) {
      setErrorEmail(err.message || "Ocurrió un error al intentar actualizar el correo.");
    } finally {
      setLoadingEmail(false);
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

              <form noValidate onSubmit={handleSubmitPwd(onSubmitPwd)}>
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
                  register={registerPwd}
                  name="currentPassword"
                  validation={{
                    required: "La contraseña actual es obligatoria",
                  }}
                  error={errorsPwd.currentPassword}
                />

                <FormInput
                  label="Nueva Contraseña"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  register={registerPwd}
                  name="newPassword"
                  validation={{
                    required: "La nueva contraseña es obligatoria",
                    minLength: {
                      value: 6,
                      message: "Mínimo 6 caracteres",
                    },
                  }}
                  error={errorsPwd.newPassword}
                />

                <FormInput
                  label="Confirmar Nueva Contraseña"
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  register={registerPwd}
                  name="confirmPassword"
                  validation={{
                    required: "Debe confirmar la nueva contraseña",
                    validate: (value) =>
                      value === newPassword || "Las contraseñas no coinciden",
                  }}
                  error={errorsPwd.confirmPassword}
                />

                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={loadingPwd}
                >
                  {loadingPwd ? (
                    <><span className="spinner" /> Actualizando...</>
                  ) : (
                    <><Save size={16} /> Actualizar Contraseña</>
                  )}
                </button>

                {errorPwd && (
                  <div className="alert alert-danger mt-3">
                    <AlertTriangle size={14} />
                    <span>{errorPwd}</span>
                    <button
                      onClick={() => setErrorPwd(null)}
                      style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {successPwd && (
                  <div className="alert alert-success mt-3">
                    <CheckCircle size={14} />
                    <span>¡Contraseña actualizada con éxito!</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>

        <div className="security-card" style={{ marginTop: "1.5rem" }}>
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2 mb-4">
                <div className="cell-icon primary">
                  <Mail size={16} />
                </div>
                Cambiar Correo Electrónico
              </h5>

              <form noValidate onSubmit={handleSubmitEmail(onSubmitEmail)}>
                {authUser?.correoPendiente && (
                  <div className="alert alert-warning mb-4">
                    <Info size={14} />
                    <span>
                      Tienes un cambio de correo pendiente a <strong>{authUser.correoPendiente}</strong>.
                      Revisa tu bandeja de entrada para confirmarlo.
                    </span>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Correo Actual</label>
                  <input
                    type="text"
                    className="form-input"
                    value={authUser?.correo || ""}
                    disabled
                  />
                </div>

                <FormInput
                  label="Nuevo Correo Electrónico"
                  type="email"
                  placeholder="nuevo@correo.com"
                  register={registerEmail}
                  name="nuevoCorreo"
                  validation={{
                    required: "El nuevo correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Ingresa un correo electrónico válido",
                    },
                  }}
                  error={errorsEmail.nuevoCorreo}
                />

                <FormInput
                  label="Confirmar Nuevo Correo"
                  type="email"
                  placeholder="Repite el nuevo correo"
                  register={registerEmail}
                  name="confirmarCorreo"
                  validation={{
                    required: "Debe confirmar el nuevo correo",
                    validate: (value) =>
                      value === watchEmail("nuevoCorreo") || "Los correos no coinciden",
                  }}
                  error={errorsEmail.confirmarCorreo}
                />

                <button
                  type="submit"
                  className="btn btn-primary w-full mt-4"
                  disabled={loadingEmail}
                >
                  {loadingEmail ? (
                    <><span className="spinner" /> Actualizando...</>
                  ) : (
                    <><Mail size={16} /> Actualizar Correo</>
                  )}
                </button>

                {errorEmail && (
                  <div className="alert alert-danger mt-3">
                    <AlertTriangle size={14} />
                    <span>{errorEmail}</span>
                    <button
                      onClick={() => setErrorEmail(null)}
                      style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                )}

                {successEmail && (
                  <div className="alert alert-success mt-3">
                    <CheckCircle size={14} />
                    <span>Te enviamos un enlace de verificación a tu nuevo correo. Revisa tu bandeja de entrada.</span>
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

export default SecurityPage;
