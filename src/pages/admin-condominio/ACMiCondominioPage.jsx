import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  Building2,
  MapPin,
  Settings,
  Info,
  Edit3,
  Save,
  X,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { adminCondominioService } from "../../services/adminCondominioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";

const ACMiCondominioPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [condominioInfo, setCondominioInfo] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await adminCondominioService.getMyCondominiumInfo();
        setCondominioInfo(data);
      } catch (err) {
        setError(err.message || "Error al cargar informaci\u00f3n.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleShowEdit = () => {
    setValue("nombre", condominioInfo?.nombre || "");
    setValue("direccion", condominioInfo?.direccion || "");
    setValue("maxAutos", condominioInfo?.maxAutos ?? 2);
    setValue("maxMotos", condominioInfo?.maxMotos ?? 2);
    setValue("maxTiempoPrestamoMin", condominioInfo?.maxTiempoPrestamoMin ?? 30);
    setValue("penalizacionPorMin", condominioInfo?.penalizacionPorMin ?? 0.5);
    setShowEditModal(true);
  };

  const onSubmit = async (data) => {
    try {
      setSaving(true);
      await adminCondominioService.updateMyCondominium({
        nombre: data.nombre,
        direccion: data.direccion,
      });
      setShowEditModal(false);
      const updated = await adminCondominioService.getMyCondominiumInfo();
      setCondominioInfo(updated);
    } catch (err) {
      setError(err.message || "Error al guardar.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Mi Condominio"
          badgeText="Administrador"
          welcomeText={`Gesti\u00f3n y vista general de ${condominioInfo?.nombre || ""}.`}
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-2 gap-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2">
                <div className="cell-icon primary">
                  <Info size={14} />
                </div>
                Informaci\u00f3n General
              </h5>
              <div className="p-4 mb-4">
                <h3 className="fw-bold text-accent mb-1">
                  {condominioInfo?.nombre}
                </h3>
                <p className="text-secondary mb-3 flex items-center gap-2">
                  <MapPin className="text-danger" size={14} />
                  {condominioInfo?.direccion}, {condominioInfo?.nombreCiudad} ({condominioInfo?.nombrePais})
                </p>
              </div>
            </div>
          </div>

          <div className="card h-100">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <h5 className="fw-bold flex items-center gap-2">
                  <div className="cell-icon warning">
                    <Settings size={14} />
                  </div>
                  Configuraci\u00f3n del Sistema
                </h5>
                <button className="btn btn-outline btn-sm" onClick={handleShowEdit}>
                  <Edit3 size={14} /> Editar
                </button>
              </div>
              <div className="grid grid-2 gap-4 mt-3">
                <div className="p-4">
                  <div className="text-muted text-sm fw-bold mb-3">Límites de Vehículos</div>
                  <div className="flex text-center">
                    <div style={{ flex: 1 }}>
                      <div className="fw-bold">{condominioInfo?.maxAutos ?? "-"}</div>
                      <div className="text-xs text-muted fw-bold">AUTOS</div>
                    </div>
                    <div className="vr mx-2"></div>
                    <div style={{ flex: 1 }}>
                      <div className="fw-bold">{condominioInfo?.maxMotos ?? "-"}</div>
                      <div className="text-xs text-muted fw-bold">MOTOS</div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-muted text-sm fw-bold mb-3">Servicio de Carritos</div>
                  <div className="flex items-baseline gap-2">
                    <span className="fw-bold">{condominioInfo?.maxTiempoPrestamoMin ?? "-"}</span>
                    <span className="text-sm text-muted fw-bold">minutos máx.</span>
                  </div>
                  <div className="mt-2 pt-2 text-sm text-secondary">
                    Penalizaci\u00f3n: <strong>S/ {condominioInfo?.penalizacionPorMin?.toFixed(2) ?? "-"}</strong> / min.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title flex items-center gap-2">
                <div className="cell-icon warning"><Settings size={14} /></div>
                Editar Condominio
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormInput label="Nombre" name="nombre" register={register} validation={{ required: "Requerido" }} error={errors.nombre} />
                <FormInput label="Direcci\u00f3n" name="direccion" register={register} validation={{ required: "Requerido" }} error={errors.direccion} />
                <div className="flex justify-end gap-2 mt-3">
                  <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}><X size={14} /> Cancelar</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    <Save size={14} /> {saving ? "Guardando..." : "Guardar Cambios"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default ACMiCondominioPage;
