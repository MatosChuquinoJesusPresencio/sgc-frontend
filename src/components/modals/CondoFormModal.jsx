import { X, Building2, Save, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../form/FormInput";

const CondoFormModal = ({ show, onHide, onSubmit, editingCondo, adminUsers }) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { nombre: "", pais: "", ciudad: "", direccion: "", id_administrador: "" },
  });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingCondo) {
        reset({
          nombre: editingCondo.nombre,
          pais: editingCondo.pais,
          ciudad: editingCondo.ciudad,
          direccion: editingCondo.direccion,
          id_administrador: editingCondo.id_administrador || "",
        });
      } else {
        reset({ nombre: "", pais: "", ciudad: "", direccion: "", id_administrador: "" });
      }
    }
  }, [show, editingCondo, reset, clearErrors]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              {editingCondo ? <Building2 size={16} /> : <Building2 size={16} />}
            </div>
            {editingCondo ? "Editar Condominio" : "Nuevo Condominio"}
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <FormInput
                label="Nombre del Condominio"
                name="nombre"
                register={register}
                validation={{ required: "El nombre es requerido" }}
                error={errors.nombre}
                placeholder="Ej: Condominio Las Palmas"
              />
              <FormInput
                label="País"
                name="pais"
                register={register}
                validation={{ required: "El país es requerido" }}
                error={errors.pais}
                placeholder="Ej: Perú"
              />
              <FormInput
                label="Ciudad"
                name="ciudad"
                register={register}
                validation={{ required: "La ciudad es requerida" }}
                error={errors.ciudad}
                placeholder="Ej: Lima"
              />
              <FormInput
                label="Dirección"
                name="direccion"
                register={register}
                validation={{ required: "La dirección es requerida" }}
                error={errors.direccion}
                placeholder="Ej: Av. Principal 123"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Administrador del Condominio</label>
              <select
                className="form-select"
                {...register("id_administrador")}
              >
                <option value="">Seleccionar administrador...</option>
                {adminUsers
                  .filter((u) => !u.id_condominio || (editingCondo && u.id_condominio === editingCondo.id))
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre} ({u.email})
                    </option>
                  ))}
              </select>
              <div className="flex items-center gap-1 mt-1">
                <Info size={11} className="text-muted" />
                <span className="text-xs text-muted">Solo se muestran los administradores disponibles.</span>
              </div>
            </div>

            <div className="modal-footer" style={{ padding: "16px 0 0", border: "none" }}>
              <button type="button" className="btn btn-outline" onClick={onHide}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> {editingCondo ? "Actualizar" : "Crear Condominio"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CondoFormModal;
