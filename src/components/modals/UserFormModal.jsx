import { X, UserPlus, Edit3, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect, useMemo } from "react";
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
  useApiFields = false,
}) => {
  const defaultValues = useMemo(
    () => useApiFields
      ? { nombres: "", apellidos: "", correo: "", activo: true, rol: "ADMINISTRADOR_CONDOMINIO", id_condominio: "" }
      : { nombre: "", email: "", activo: true, id_rol: 2, id_condominio: "" },
    [useApiFields]
  );

  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingUser) {
        if (useApiFields) {
          reset({
            nombres: editingUser.nombres || "",
            apellidos: editingUser.apellidos || "",
            correo: editingUser.correo || editingUser.email || "",
            telefono: editingUser.telefono || "",
            rol: editingUser.rol || editingUser.id_rol || "ADMINISTRADOR_CONDOMINIO",
            id_condominio: editingUser.condominioId ?? editingUser.id_condominio ?? "",
            activo: editingUser.activo ?? true,
          });
        } else {
          reset({
            nombre: editingUser.nombre || "",
            email: editingUser.email || "",
            id_rol: editingUser.id_rol || 2,
            id_condominio: editingUser.id_condominio ?? "",
            activo: editingUser.activo ?? true,
          });
        }
      } else {
        reset(defaultValues);
      }
    }
  }, [show, editingUser, reset, clearErrors, useApiFields, defaultValues]);

  const handleFormSubmit = (data) => {
    if (useApiFields) {
      const rolNumerico = {
        SUPER_ADMINISTRADOR: 1,
        ADMINISTRADOR_CONDOMINIO: 2,
        PROPIETARIO: 3,
        AGENTE_SEGURIDAD: 4,
      }[data.rol] || 2;
      onSubmit({
        ...data,
        id_rol: rolNumerico,
        id_condominio: data.id_condominio || "",
      });
    } else {
      onSubmit(data);
    }
  };

  if (!show) return null;

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
              {useApiFields ? (
                <>
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
                </>
              ) : (
                <FormInput
                  label="Nombre Completo"
                  name="nombre"
                  register={register}
                  validation={{ required: "El nombre es requerido" }}
                  error={errors.nombre}
                  placeholder="Nombre y Apellidos"
                />
              )}
              <FormInput
                label="Correo Electrónico"
                name={useApiFields ? "correo" : "email"}
                type="email"
                register={register}
                validation={{
                  required: "El correo es requerido",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Correo inválido",
                  },
                }}
                error={useApiFields ? errors.correo : errors.email}
                placeholder="ejemplo@correo.com"
              />
              {useApiFields && (
                <FormInput
                  label="Teléfono"
                  name="telefono"
                  register={register}
                  placeholder="Ej: +58 412 123 4567"
                />
              )}
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">
                  {scope === "condo-admin" ? "Tipo de Usuario" : "Rol en el Sistema"}
                </label>
                <select
                  className={`form-select ${errors.id_rol || errors.rol ? "error" : ""}`}
                  {...register(useApiFields ? "rol" : "id_rol", { required: "Selecciona un rol" })}
                >
                  {useApiFields ? (
                    scope === "condo-admin" ? (
                      <>
                        <option value="ADMINISTRADOR_CONDOMINIO">Administrador Condominio</option>
                        <option value="PROPIETARIO">Propietario</option>
                        <option value="AGENTE_SEGURIDAD">Agente de Seguridad</option>
                      </>
                    ) : (
                      <>
                        <option value="ADMINISTRADOR_CONDOMINIO">Administrador Condominio</option>
                        <option value="PROPIETARIO">Propietario</option>
                        <option value="AGENTE_SEGURIDAD">Agente de Seguridad</option>
                      </>
                    )
                  ) : scope === "condo-admin" ? (
                    <>
                      <option value="3">Propietario</option>
                      <option value="4">Agente de Seguridad</option>
                    </>
                  ) : (
                    <>
                      <option value="1">Super Administrador</option>
                      <option value="2">Administrador Condominio</option>
                      <option value="3">Propietario</option>
                      <option value="4">Agente de Seguridad</option>
                    </>
                  )}
                </select>
                {useApiFields
                  ? errors.rol && <div className="form-error">{errors.rol.message}</div>
                  : errors.id_rol && <div className="form-error">{errors.id_rol.message}</div>
                }
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
                    {...register("id_condominio")}
                  >
                    <option value="">Ninguno</option>
                    {condominios.map((c) => (
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