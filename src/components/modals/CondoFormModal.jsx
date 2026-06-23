import { X, Building2, Save, Info, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import FormInput from "../form/FormInput";

const CondoFormModal = ({ show, onHide, onSubmit, editingCondo, countries, cities, onCountryChange, loadingCities, availableAdmins }) => {
  const {
    register,
    handleSubmit,
    reset,
    clearErrors,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { nombre: "", idPais: "", idCiudad: "", direccion: "", idAdministrador: "" },
  });

  const selectedCountry = watch("idPais");

  useEffect(() => {
    if (show) {
      clearErrors();
      if (editingCondo) {
        reset({
          nombre: editingCondo.nombre,
          idPais: editingCondo.idPais || "",
          idCiudad: editingCondo.idCiudad || "",
          direccion: editingCondo.direccion,
          idAdministrador: editingCondo.idAdministrador || "",
        });
      } else {
        reset({ nombre: "", idPais: "", idCiudad: "", direccion: "", idAdministrador: "" });
      }
    }
  }, [show, editingCondo, reset, clearErrors]);

  useEffect(() => {
    if (show && selectedCountry) {
      onCountryChange?.(selectedCountry);
    }
  }, [selectedCountry, show, onCountryChange]);

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              <Building2 size={16} />
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
                label="Dirección"
                name="direccion"
                register={register}
                validation={{ required: "La dirección es requerida" }}
                error={errors.direccion}
                placeholder="Ej: Av. Principal 123"
              />
            </div>

            <div className="form-group">
              <label className="form-label">País</label>
              <select
                className="form-select"
                {...register("idPais", { required: "El país es requerido" })}
              >
                <option value="">Seleccionar país...</option>
                {(countries || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {errors.idPais && <span className="text-danger text-xs">{errors.idPais.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Ciudad</label>
              <select
                className="form-select"
                {...register("idCiudad", { required: "La ciudad es requerida" })}
                disabled={!selectedCountry || loadingCities}
              >
                <option value="">
                  {loadingCities ? "Cargando ciudades..." : (selectedCountry ? "Seleccionar ciudad..." : "Seleccione un país primero")}
                </option>
                {(cities || []).map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
              {loadingCities && <Loader2 size={12} className="spinner mt-1" />}
              {errors.idCiudad && <span className="text-danger text-xs">{errors.idCiudad.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Administrador del Condominio</label>
              <select
                className="form-select"
                {...register("idAdministrador")}
              >
                <option value="">Seleccionar administrador...</option>
                {(availableAdmins || []).map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombres} {u.apellidos} ({u.correo})
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
