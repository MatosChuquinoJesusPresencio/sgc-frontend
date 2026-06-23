import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Lock, Phone, Save, Shield, Info, AlertTriangle, CheckCircle, Loader2, Building2 } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { profileService } from "../../services/profileService";
import { fetchApi } from "../../services/api";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import FormInput from "../../components/form/FormInput";
import RoleBadge from "../../components/ui/RoleBadge";

const TABS = [
  { key: "view", label: "Mi Perfil", icon: User },
  { key: "edit", label: "Editar Datos", icon: Phone },
  { key: "email", label: "Cambiar Correo", icon: Mail },
  { key: "password", label: "Contrase\u00f1a", icon: Lock },
];

const ROLE_LABELS = {
  SUPER_ADMINISTRADOR: "Super Admin",
  ADMINISTRADOR_CONDOMINIO: "Admin Condominio",
  PROPIETARIO: "Propietario",
  AGENTE_SEGURIDAD: "Seguridad",
};

const PerfilPage = () => {
  const { authUser } = useAuth();
  const [activeTab, setActiveTab] = useState("view");
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const editForm = useForm();
  const emailForm = useForm();
  const passwordForm = useForm();
  const newPassword = passwordForm.watch("newPassword");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const data = await profileService.getProfile();
        setProfile(data);
        editForm.reset({
          nombres: data.nombres || "",
          apellidos: data.apellidos || "",
          telefono: data.telefono || "",
        });
      } catch (err) {
        setError(err.message || "Error al cargar perfil.");
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleEditProfile = async (data) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await profileService.updateProfile(data.nombres, data.apellidos, data.telefono);
      const updated = await profileService.getProfile();
      setProfile(updated);
      setSuccess("Perfil actualizado exitosamente.");
    } catch (err) {
      setError(err.message || "Error al actualizar perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeEmail = async (data) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await fetchApi("/auth/email", {
        method: "PUT",
        body: { nuevoCorreo: data.nuevoCorreo, contrasena: data.contrasena },
      });
      emailForm.reset();
      const updated = await profileService.getProfile();
      setProfile(updated);
      setSuccess("Solicitud de cambio de correo enviada. Revisa tu bandeja de entrada para confirmar.");
    } catch (err) {
      setError(err.message || "Error al cambiar correo.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async (data) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      await fetchApi("/auth/change-password", {
        method: "PUT",
        body: { contrasenaActual: data.currentPassword, nuevaContrasena: data.newPassword },
      });
      passwordForm.reset();
      setSuccess("Contrase\u00f1a actualizada exitosamente.");
    } catch (err) {
      setError(err.message || "Error al cambiar contrase\u00f1a.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderTabContent = () => {
    if (loadingProfile) {
      return <div className="flex items-center justify-center py-5"><Loader2 size={32} className="spinner" /></div>;
    }

    switch (activeTab) {
      case "view":
        return (
          <div className="card">
            <div className="card-body">
              <div className="flex items-center gap-4 mb-4">
                <div className="cell-icon primary" style={{ width: 56, height: 56, borderRadius: "50%" }}>
                  <User size={28} />
                </div>
                <div>
                  <h4 className="fw-bold mb-1">{profile?.nombres} {profile?.apellidos}</h4>
                  <div className="text-sm text-muted">{profile?.correo}</div>
                </div>
              </div>
              <div className="grid-2 gap-4">
                <div>
                  <div className="text-xs text-muted mb-1">Nombres</div>
                  <div className="fw-bold">{profile?.nombres || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Apellidos</div>
                  <div className="fw-bold">{profile?.apellidos || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Correo</div>
                  <div className="fw-bold flex items-center gap-2">
                    {profile?.correo || "-"}
                    {profile?.correoVerificado ? (
                      <span className="badge badge-success">Verificado</span>
                    ) : (
                      <span className="badge badge-warning">No verificado</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Teléfono</div>
                  <div className="fw-bold">{profile?.telefono || "-"}</div>
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Rol</div>
                  <RoleBadge role={profile?.rol} labels={ROLE_LABELS} />
                </div>
                <div>
                  <div className="text-xs text-muted mb-1">Condominio</div>
                  <div className="fw-bold">{profile?.idCondominio ? `ID: ${profile.idCondominio}` : "Plataforma Global"}</div>
                </div>
              </div>
            </div>
          </div>
        );

      case "edit":
        return (
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2 mb-4">
                <div className="cell-icon primary"><Phone size={16} /></div>
                Editar Datos Personales
              </h5>
              <form onSubmit={editForm.handleSubmit(handleEditProfile)}>
                <div className="grid-2">
                  <FormInput label="Nombres" name="nombres" register={editForm.register} validation={{ required: "Requerido" }} error={editForm.formState.errors.nombres} placeholder="Nombres" />
                  <FormInput label="Apellidos" name="apellidos" register={editForm.register} validation={{ required: "Requerido" }} error={editForm.formState.errors.apellidos} placeholder="Apellidos" />
                </div>
                <FormInput label="Tel\u00e9fono" name="telefono" register={editForm.register} placeholder="Ej: 999888777" />
                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spinner" /> Guardando...</> : <><Save size={16} /> Guardar Cambios</>}
                </button>
              </form>
            </div>
          </div>
        );

      case "email":
        return (
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2 mb-4">
                <div className="cell-icon primary"><Mail size={16} /></div>
                Cambiar Correo Electrónico
              </h5>
              <div className="security-tip mb-4">
                <div className="security-tip-icon"><Info size={16} /></div>
                <div className="security-tip-text">
                  <h6>Importante</h6>
                  <p>Se enviará un enlace de verificación al nuevo correo para confirmar el cambio.</p>
                </div>
              </div>
              <form onSubmit={emailForm.handleSubmit(handleChangeEmail)}>
                <FormInput label="Nuevo Correo" type="email" name="nuevoCorreo" register={emailForm.register} validation={{ required: "Requerido", pattern: { value: /^\S+@\S+$/i, message: "Correo inv\u00e1lido" } }} error={emailForm.formState.errors.nuevoCorreo} placeholder="nuevo@correo.com" />
                <FormInput label="Contrase\u00f1a Actual" type="password" name="contrasena" register={emailForm.register} validation={{ required: "Requerido" }} error={emailForm.formState.errors.contrasena} placeholder="Tu contrase\u00f1a actual" />
                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spinner" /> Enviando...</> : <><Mail size={16} /> Solicitar Cambio</>}
                </button>
              </form>
            </div>
          </div>
        );

      case "password":
        return (
          <div className="card">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2 mb-4">
                <div className="cell-icon primary"><Shield size={16} /></div>
                Cambiar Contraseña
              </h5>
              <div className="security-tip mb-4">
                <div className="security-tip-icon"><Info size={16} /></div>
                <div className="security-tip-text">
                  <h6>Recomendación</h6>
                  <p>Usa al menos 6 caracteres y combina letras con números para una mayor seguridad.</p>
                </div>
              </div>
              <form onSubmit={passwordForm.handleSubmit(handleChangePassword)}>
                <FormInput label="Contrase\u00f1a Actual" type="password" name="currentPassword" register={passwordForm.register} validation={{ required: "Requerido" }} error={passwordForm.formState.errors.currentPassword} placeholder="Tu contrase\u00f1a actual" />
                <FormInput label="Nueva Contrase\u00f1a" type="password" name="newPassword" register={passwordForm.register} validation={{ required: "Requerido", minLength: { value: 6, message: "M\u00ednimo 6 caracteres" } }} error={passwordForm.formState.errors.newPassword} placeholder="M\u00ednimo 6 caracteres" />
                <FormInput label="Confirmar Contrase\u00f1a" type="password" name="confirmPassword" register={passwordForm.register} validation={{ required: "Requerido", validate: (v) => v === newPassword || "No coinciden" }} error={passwordForm.formState.errors.confirmPassword} placeholder="Repite la contrase\u00f1a" />
                <button type="submit" className="btn btn-primary mt-3" disabled={submitting}>
                  {submitting ? <><Loader2 size={16} className="spinner" /> Actualizando...</> : <><Save size={16} /> Actualizar Contraseña</>}
                </button>
              </form>
            </div>
          </div>
        );
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader title="Mi Perfil" welcomeText="Gestiona tu informaci\u00f3n personal, correo y credenciales de acceso." />

        {error && <div className="alert alert-danger mb-3"><AlertTriangle size={14} /><span>{error}</span><button onClick={() => setError(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>&times;</button></div>}
        {success && <div className="alert alert-success mb-3"><CheckCircle size={14} /><span>{success}</span><button onClick={() => setSuccess(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}>&times;</button></div>}

        <div className="tabs mb-4">
          {TABS.map((tab) => (
            <button key={tab.key} className={`tab ${activeTab === tab.key ? "active" : ""}`} onClick={() => setActiveTab(tab.key)}>
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {renderTabContent()}
      </div>
    </AnimatedPage>
  );
};

export default PerfilPage;
