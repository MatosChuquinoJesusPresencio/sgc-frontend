import { X, UserPlus, Edit3, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../form/FormInput";

const UserFormModal = ({
  show,
  onHide,
  onSubmit,
  editingUser,
  condominios,
  authUser,
  scope = "super-admin",
  condominio,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombres: "",
      apellidos: "",
      correo: "",
      telefono: "",
      contrasena: "",
      activo: true,
      rol: "ADMINISTRADOR_CONDOMINIO",
      idCondominio: "",
    },
  });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingUser) {
        reset({
          nombres: editingUser.nombres || "",
          apellidos: editingUser.apellidos || "",
          correo: editingUser.correo || "",
          telefono: editingUser.telefono || "",
          contrasena: "",
          activo: editingUser.activo ?? true,
          rol: editingUser.rol || "ADMINISTRADOR_CONDOMINIO",
          idCondominio: editingUser.idCondominio || "",
        });
      } else {
        reset({
          nombres: "",
          apellidos: "",
          correo: "",
          telefono: "",
          contrasena: "",
          activo: true,
          rol: "ADMINISTRADOR_CONDOMINIO",
          idCondominio: "",
        });
      }
    }
  }, [show, editingUser, reset, clearErrors]);

  if (!show) return null;

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              {editingUser ? <Edit3 size={16} /> : <UserPlus size={16} />}
            </div>
            {editingUser ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <div className="grid-2">
              <FormInput
                label="Nombres"
                name="nombres"
                register={register}
                validation={{ required: "Los nombres son requeridos" }}
                error={errors.nombres}
                placeholder="Ej: Juan Carlos"
              />
              <FormInput
                label="Apellidos"
                name="apellidos"
                register={register}
                validation={{ required: "Los apellidos son requeridos" }}
                error={errors.apellidos}
                placeholder="Ej: Pérez García"
              />
            </div>
            <div className="grid-2">
              <FormInput
                label="Correo Electrónico"
                name="correo"
                type="email"
                register={register}
                validation={{
                  required: "El correo es requerido",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Correo inválido",
                  },
                }}
                error={errors.correo}
                placeholder="ejemplo@correo.com"
              />
              <FormInput
                label="Teléfono"
                name="telefono"
                register={register}
                placeholder="Ej: 999888777"
              />
            </div>

            {!editingUser && (
              <FormInput
                label="Contraseña"
                name="contrasena"
                type="password"
                register={register}
                validation={{
                  required: "La contraseña es requerida",
                  minLength: { value: 8, message: "Mínimo 8 caracteres" },
                }}
                error={errors.contrasena}
                placeholder="Mínimo 8 caracteres"
              />
            )}

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  {scope === "condo-admin" ? "Tipo de Usuario" : "Rol en el Sistema"}
                </label>
                <select
                  className={`form-select ${errors.rol ? "error" : ""}`}
                  {...register("rol", { required: "Selecciona un rol" })}
                >
                  {scope === "condo-admin" ? (
                    <>
                      <option value="PROPIETARIO">Propietario / Residente</option>
                      <option value="AGENTE_SEGURIDAD">Agente de Seguridad</option>
                      <option value="ADMINISTRADOR_CONDOMINIO">Administrador</option>
                    </>
                  ) : scope === "super-admin" ? (
                    <>
                      <option value="ADMINISTRADOR_CONDOMINIO">Admin Condominio</option>
                      <option value="SUPER_ADMINISTRADOR">Super Admin</option>
                    </>
                  ) : (
                    <>
                      <option value="PROPIETARIO">Propietario</option>
                      <option value="AGENTE_SEGURIDAD">Agente Seguridad</option>
                      <option value="ADMINISTRADOR_CONDOMINIO">Admin Condominio</option>
                    </>
                  )}
                </select>
                {errors.rol && <div className="form-error">{errors.rol.message}</div>}
              </div>

              {scope === "condo-admin" ? (
                <div className="form-group">
                  <label className="form-label">Condominio</label>
                  <input
                    className="form-input"
                    value={condominio?.nombre || ""}
                    disabled
                    style={{ background: "var(--bg)" }}
                  />
                  <div className="text-xs text-muted mt-1">
                    El usuario se registrará automáticamente en este condominio.
                  </div>
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Condominio Asignado</label>
                  <select
                    className="form-select"
                    {...register("idCondominio")}
                  >
                    <option value="">Ninguno (Acceso Global)</option>
                    {(condominios || []).map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                  <div className="text-xs text-muted mt-1">
                    Obligatorio para Admins de Condo y Residentes.
                  </div>
                </div>
              )}
            </div>

            <div className="switch-group mb-4">
              <div>
                <div className="switch-label">Estado de la cuenta</div>
                <div className="switch-desc">
                  {editingUser?.id === authUser?.id
                    ? "No puedes desactivar tu propia cuenta."
                    : "Los usuarios inactivos no podrán iniciar sesión."}
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  {...register("activo")}
                  disabled={editingUser?.id === authUser?.id}
                />
                <span className="switch-slider" />
              </label>
            </div>

            <div className="modal-footer" style={{ padding: "16px 0 0", border: "none" }}>
              <button type="button" className="btn btn-outline" onClick={onHide}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> {editingUser ? "Actualizar Datos" : "Registrar Usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
