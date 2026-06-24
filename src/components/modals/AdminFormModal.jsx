import { X, UserPlus, Edit3, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../form/FormInput";

const AdminFormModal = ({ show, onHide, onSubmit, editingAdmin, authUser }) => {
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
    },
  });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingAdmin) {
        reset({
          nombres: editingAdmin.nombres || "",
          apellidos: editingAdmin.apellidos || "",
          correo: editingAdmin.correo || "",
          telefono: editingAdmin.telefono || "",
          contrasena: "",
          activo: editingAdmin.activo ?? true,
        });
      } else {
        reset({
          nombres: "",
          apellidos: "",
          correo: "",
          telefono: "",
          contrasena: "",
          activo: true,
        });
      }
    }
  }, [show, editingAdmin, reset, clearErrors]);

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
              {editingAdmin ? <Edit3 size={16} /> : <UserPlus size={16} />}
            </div>
            {editingAdmin ? "Editar Administrador" : "Nuevo Administrador"}
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
                placeholder="Ej: Perez Garcia"
              />
            </div>
            <div className="grid-2">
              {editingAdmin ? (
                <div className="form-group">
                  <label className="form-label">Correo Electronico</label>
                  <input
                    className="form-input"
                    value={editingAdmin.correo || ""}
                    disabled
                    style={{ background: "var(--bg)" }}
                  />
                  <div className="text-xs text-muted mt-1">
                    El correo no se puede modificar.
                  </div>
                </div>
              ) : (
                <FormInput
                  label="Correo Electronico"
                  name="correo"
                  type="email"
                  register={register}
                  validation={{
                    required: "El correo es requerido",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Correo invalido",
                    },
                  }}
                  error={errors.correo}
                  placeholder="ejemplo@correo.com"
                />
              )}
              <FormInput
                label="Telefono"
                name="telefono"
                register={register}
                placeholder="Ej: 999888777"
              />
            </div>

            {!editingAdmin && (
              <FormInput
                label="Contrasena"
                name="contrasena"
                type="password"
                register={register}
                validation={{
                  required: "La contrasena es requerida",
                  minLength: { value: 8, message: "Minimo 8 caracteres" },
                }}
                error={errors.contrasena}
                placeholder="Minimo 8 caracteres"
              />
            )}

            {editingAdmin && (
              <div className="switch-group mb-4">
                <div>
                  <div className="switch-label">Estado de la cuenta</div>
                  <div className="switch-desc">
                    {editingAdmin?.id === authUser?.id
                      ? "No puedes desactivar tu propia cuenta."
                      : "Los usuarios inactivos no podran iniciar sesion."}
                  </div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    {...register("activo")}
                    disabled={editingAdmin?.id === authUser?.id}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            )}

            <div className="modal-footer" style={{ padding: "16px 0 0", border: "none" }}>
              <button type="button" className="btn btn-outline" onClick={onHide}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> {editingAdmin ? "Actualizar Datos" : "Registrar Administrador"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminFormModal;
