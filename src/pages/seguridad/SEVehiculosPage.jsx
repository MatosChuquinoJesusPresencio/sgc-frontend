import { useState } from "react";
import { useForm } from "react-hook-form";
import { Car, Search, LogIn, LogOut, Loader2, ShieldCheck, AlertTriangle } from "lucide-react";
import { securityService } from "../../services/securityService";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";

const SEVehiculosPage = () => {
  const [searchPlate, setSearchPlate] = useState("");
  const [vehicle, setVehicle] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [lastLogId, setLastLogId] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const handleSearch = async () => {
    if (!searchPlate.trim()) return;
    setSearching(true);
    setSearchError(null);
    setVehicle(null);
    setLastLogId(null);
    setSuccessMsg(null);
    try {
      const res = await securityService.verifyVehicle(searchPlate.trim());
      setVehicle(res);
    } catch (err) {
      setSearchError(err.message || "Veh\u00edculo no encontrado.");
    } finally {
      setSearching(false);
    }
  };

  const handleEntry = async (data) => {
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      const res = await securityService.registerVehicleEntry({
        placa: searchPlate.trim(),
        metodo: data.metodo || "MANUAL",
        ocupante: data.ocupante || undefined,
        datosInquilino: data.datosInquilino || undefined,
      });
      setLastLogId(res.id);
      setSuccessMsg(`Entrada registrada exitosamente. ID Log: ${res.id}`);
      reset({ metodo: "MANUAL", ocupante: "", datosInquilino: "" });
    } catch (err) {
      setSearchError(err.message || "Error al registrar entrada.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExit = async () => {
    if (!lastLogId) return;
    setSubmitting(true);
    setSuccessMsg(null);
    try {
      await securityService.registerVehicleExit({ idLogAcceso: lastLogId });
      setSuccessMsg("Salida registrada exitosamente.");
      setLastLogId(null);
      setVehicle(null);
      setSearchPlate("");
    } catch (err) {
      setSearchError(err.message || "Error al registrar salida.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewSearch = () => {
    setVehicle(null);
    setSearchError(null);
    setSuccessMsg(null);
    setLastLogId(null);
    setSearchPlate("");
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Car}
          title="Verificaci\u00f3n Vehicular"
          welcomeText="Busca una placa para verificar el veh\u00edculo y registrar entrada o salida."
        />

        {successMsg && <div className="alert alert-success mb-3">{successMsg}</div>}
        {searchError && <div className="alert alert-danger mb-3">{searchError}</div>}

        {!vehicle ? (
          <div className="widget-card">
            <div className="widget-body">
              <div className="flex gap-3 items-end">
                <div style={{ flex: 1 }}>
                  <label className="form-label fw-semibold text-sm text-secondary">Placa del Veh\u00edculo</label>
                  <input
                    className="form-input"
                    placeholder="Ingrese la placa..."
                    value={searchPlate}
                    onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    disabled={searching}
                  />
                </div>
                <button className="btn btn-primary" onClick={handleSearch} disabled={searching || !searchPlate.trim()}>
                  {searching ? <Loader2 size={16} className="spinner" /> : <Search size={16} />}
                  <span>Buscar</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid-2 gap-4">
            <div className="widget-card">
              <div className="widget-header">
                <span className="widget-title"><ShieldCheck size={16} /> Datos del Veh\u00edculo</span>
              </div>
              <div className="widget-body">
                <div className="p-3" style={{ background: "var(--bg-secondary)", borderRadius: 8 }}>
                  <div className="grid-2 gap-3">
                    <div>
                      <div className="text-xs text-muted">Placa</div>
                      <div className="fw-bold text-lg">{vehicle.placa}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Tipo</div>
                      <div className="fw-bold">{vehicle.tipo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Marca</div>
                      <div className="fw-bold">{vehicle.marca || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Modelo</div>
                      <div className="fw-bold">{vehicle.modelo || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Color</div>
                      <div className="fw-bold">{vehicle.color || "-"}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted">Propietario</div>
                      <div className="fw-bold">{vehicle.nombrePropietario || "No asignado"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="widget-card">
              <div className="widget-header">
                <span className="widget-title"><LogIn size={16} /> Registrar Movimiento</span>
              </div>
              <div className="widget-body">
                {!lastLogId ? (
                  <form onSubmit={handleSubmit(handleEntry)}>
                    <div className="grid-2 gap-3 mb-3">
                      <FormInput
                        label="M\u00e9todo de Entrada"
                        name="metodo"
                        type="select"
                        register={register}
                        placeholder="Seleccionar..."
                      >
                        <option value="MANUAL">Manual</option>
                        <option value="AUTOMATICO">Autom\u00e1tico</option>
                      </FormInput>
                      <FormInput
                        label="Ocupante"
                        name="ocupante"
                        type="select"
                        register={register}
                        placeholder="Seleccionar..."
                      >
                        <option value="">Ninguno</option>
                        <option value="RESIDENTE">Residente</option>
                        <option value="VISITA">Visita</option>
                        <option value="TRABAJADOR">Trabajador</option>
                      </FormInput>
                    </div>
                    <FormInput
                      label="Datos del Inquilino (opcional)"
                      name="datosInquilino"
                      register={register}
                      placeholder="Nombre, DNI, etc."
                    />
                    <div className="flex gap-2 mt-3">
                      <button type="submit" className="btn btn-success" disabled={submitting}>
                        {submitting ? <Loader2 size={16} className="spinner" /> : <LogIn size={16} />}
                        <span>Registrar Entrada</span>
                      </button>
                      <button type="button" className="btn btn-outline" onClick={handleNewSearch}>
                        Nueva B\u00fasqueda
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="status-banner success mb-3">
                      <AlertTriangle size={16} />
                      Entrada registrada. Confirma la salida cuando corresponda.
                    </div>
                    <div className="flex gap-2">
                      <button className="btn btn-warning" onClick={handleExit} disabled={submitting}>
                        {submitting ? <Loader2 size={16} className="spinner" /> : <LogOut size={16} />}
                        <span>Registrar Salida</span>
                      </button>
                      <button type="button" className="btn btn-outline" onClick={handleNewSearch}>
                        Nueva B\u00fasqueda
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AnimatedPage>
  );
};

export default SEVehiculosPage;
