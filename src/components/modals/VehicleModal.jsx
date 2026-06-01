import { X, Edit3, Plus, Save, Car, Bike } from "lucide-react";
import { useForm } from "react-hook-form";
import FormInput from "../form/FormInput";
import { useEffect } from "react";

const VehicleModal = ({ show, onHide, onSubmit, editingVehicle = null, residents = [] }) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    formState: { errors },
  } = useForm({
    defaultValues: { placa: "", tipo: "Auto", marca: "", modelo: "", color: "", id_usuario: "" },
  });

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingVehicle) {
        reset({
          placa: editingVehicle.placa,
          tipo: editingVehicle.tipo,
          marca: editingVehicle.marca,
          modelo: editingVehicle.modelo,
          color: editingVehicle.color,
          id_usuario: editingVehicle.id_usuario || "",
        });
      } else {
        reset({ placa: "", tipo: "Auto", marca: "", modelo: "", color: "", id_usuario: "" });
      }
    }
  }, [show, editingVehicle, reset, clearErrors]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              {editingVehicle ? <Edit3 size={16} /> : <Plus size={16} />}
            </div>
            {editingVehicle ? "Editar Vehículo" : "Registrar Vehículo"}
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid-2">
              <FormInput
                label="Placa"
                name="placa"
                register={register}
                validation={{ required: "La placa es requerida" }}
                error={errors.placa}
                placeholder="ABC-123"
              />
              <div className="form-group">
                <label className="form-label">Tipo de Vehículo</label>
                <div className="flex gap-2">
                  <label className={`btn ${editingVehicle?.tipo === "Auto" || "Auto" ? "btn-primary" : "btn-outline"} btn-sm`} style={{ flex: 1 }}>
                    <input
                      type="radio"
                      value="Auto"
                      {...register("tipo", { required: true })}
                      style={{ display: "none" }}
                    />
                    <Car size={14} /> Auto
                  </label>
                  <label className={`btn btn-outline btn-sm`} style={{ flex: 1 }}>
                    <input
                      type="radio"
                      value="Moto"
                      {...register("tipo", { required: true })}
                      style={{ display: "none" }}
                    />
                    <Bike size={14} /> Moto
                  </label>
                </div>
              </div>
              <FormInput
                label="Marca"
                name="marca"
                register={register}
                validation={{ required: "La marca es requerida" }}
                error={errors.marca}
                placeholder="Toyota"
              />
              <FormInput
                label="Modelo"
                name="modelo"
                register={register}
                validation={{ required: "El modelo es requerido" }}
                error={errors.modelo}
                placeholder="Corolla"
              />
              <FormInput
                label="Color"
                name="color"
                register={register}
                validation={{ required: "El color es requerido" }}
                error={errors.color}
                placeholder="Rojo"
              />
            </div>

            {residents.length > 0 && (
              <div className="form-group">
                <label className="form-label">Propietario / Residente</label>
                <select
                  className="form-select"
                  {...register("id_usuario")}
                >
                  <option value="">Seleccionar propietario...</option>
                  {residents.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="modal-footer" style={{ padding: "16px 0 0", border: "none" }}>
              <button type="button" className="btn btn-outline" onClick={onHide}>Cancelar</button>
              <button type="submit" className="btn btn-primary">
                <Save size={16} /> {editingVehicle ? "Actualizar Vehículo" : "Registrar Vehículo"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VehicleModal;
