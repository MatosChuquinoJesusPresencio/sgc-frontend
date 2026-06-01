import { X, UserPlus, Edit3, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../form/FormInput";

const ResidentModal = ({ show, onHide, onSubmit, editingResident = null }) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { nombre: "", dni: "", id_apartamento: "" },
  });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingResident) {
        reset({
          nombre: editingResident.nombre,
          dni: editingResident.dni,
          id_apartamento: editingResident.id_apartamento || "",
        });
      } else {
        reset({ nombre: "", dni: "", id_apartamento: "" });
      }
    }
  }, [show, editingResident, reset, clearErrors]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              {editingResident ? <Edit3 size={16} /> : <UserPlus size={16} />}
            </div>
            {editingResident ? "Editar Inquilino" : "Registrar Inquilino"}
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="Nombre Completo"
              name="nombre"
              register={register}
              validation={{ required: "El nombre es requerido" }}
              error={errors.nombre}
              placeholder="Nombre del inquilino"
            />
            <FormInput
              label="Documento (DNI)"
              name="dni"
              register={register}
              validation={{ required: "El DNI es requerido" }}
              error={errors.dni}
              placeholder="00000000"
            />
            <FormInput
              label="ID Apartamento"
              name="id_apartamento"
              type="number"
              register={register}
              validation={{ required: "ID de apartamento requerido" }}
              error={errors.id_apartamento}
              placeholder="1"
            />
            <div className="modal-footer" style={{ padding: "16px 0 0", border: "none" }}>
              <button type="button" className="btn btn-outline" onClick={onHide}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> {editingResident ? "Actualizar" : "Registrar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResidentModal;
