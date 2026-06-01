import { useState } from "react";
import { useForm } from "react-hook-form";

import {
  Building2,
  MapPin,
  Calendar,
  Settings,
  PlusCircle,
  Users,
  Wrench,
  AlertTriangle,
  Info,
  Edit3,
  Save,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const ACMiCondominioPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();
  const [showEditModal, setShowEditModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const condominio = getTable("condominios").find(
    (c) => c.id === authUser?.id_condominio,
  );
  const configuraciones = getTable("configuraciones");
  const config = configuraciones.find(
    (c) => c.id_condominio === condominio?.id,
  );

  const handleShowEdit = () => {
    if (config) {
      setValue("max_autos", config.max_autos);
      setValue("max_motos", config.max_motos);
      setValue("tiempo_max_prestamo_min", config.tiempo_max_prestamo_min);
      setValue("penalizacion_por_minuto", config.penalizacion_por_minuto);
    } else {
      reset({
        max_autos: 2,
        max_motos: 2,
        tiempo_max_prestamo_min: 30,
        penalizacion_por_minuto: 0.5,
      });
    }
    setShowEditModal(true);
  };

  const onSubmit = (data) => {
    const numericData = {
      max_autos: parseInt(data.max_autos),
      max_motos: parseInt(data.max_motos),
      tiempo_max_prestamo_min: parseInt(data.tiempo_max_prestamo_min),
      penalizacion_por_minuto: parseFloat(data.penalizacion_por_minuto),
    };

    if (config) {
      const updatedConfigs = configuraciones.map((c) =>
        c.id === config.id ? { ...c, ...numericData } : c,
      );
      updateTable("configuraciones", updatedConfigs);
    } else {
      const newId =
        configuraciones.length > 0
          ? Math.max(...configuraciones.map((c) => c.id)) + 1
          : 1;
      const newConfig = {
        id: newId,
        id_condominio: condominio.id,
        ...numericData,
      };
      updateTable("configuraciones", [...configuraciones, newConfig]);
    }
    setShowEditModal(false);
  };

  if (!condominio) return <NoCondoWarning />;

  const torres = getTable("torres").filter(
    (t) => t.id_condominio === condominio.id,
  );
  const torreIds = torres.map((t) => t.id);
  const pisos = getTable("pisos").filter((p) => torreIds.includes(p.id_torre));
  const pisoIds = pisos.map((p) => p.id);
  const aptos = getTable("apartamentos").filter((a) =>
    pisoIds.includes(a.id_piso),
  );
  const usersInCondo = getTable("usuarios").filter(
    (u) => u.id_condominio === condominio.id,
  );
  const carts = getTable("carritos_carga").filter(
    (c) => c.id_condominio === condominio.id,
  );

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Mi Condominio"
          badgeText="Administrador"
          welcomeText={`Gestión y vista general de ${condominio.nombre}.`}
        />

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard
            icon={Building2}
            label="Torres / Bloques"
            value={torres.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={PlusCircle}
            label="Total Apartamentos"
            value={aptos.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Users}
            label="Usuarios Registrados"
            value={usersInCondo.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Wrench}
            label="Carritos de Carga"
            value={carts.length}
            colorClass="primary-theme"
          />
        </div>

        <div className="grid grid-2 gap-4">
          <div className="card h-100">
            <div className="card-body">
              <h5 className="fw-bold flex items-center gap-2">
                <div className="cell-icon primary">
                  <Info size={14} />
                </div>
                Información General
              </h5>
              <div className="p-4 mb-4">
                <h3 className="fw-bold text-accent mb-1">
                  {condominio.nombre}
                </h3>
                <p className="text-secondary mb-3 flex items-center gap-2">
                  <MapPin className="text-danger" size={14} />
                  {condominio.direccion}, {condominio.ciudad} (
                  {condominio.pais})
                </p>
                <span className="badge badge-neutral text-sm fw-bold">
                  <Calendar size={12} className="text-accent" />
                  Registrado el{" "}
                  {new Date(condominio.fecha_creacion).toLocaleDateString(
                    "es-ES",
                    { day: "2-digit", month: "long", year: "numeric" },
                  )}
                </span>
              </div>

              <h6 className="text-muted text-sm fw-bold mb-3">
                Detalles de Infraestructura
              </h6>
              <div className="flex flex-col">
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary text-sm">Total de Pisos</span>
                  <span className="fw-bold">{pisos.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary text-sm">
                    Apartamentos Activos
                  </span>
                  <span className="fw-bold">{aptos.length}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-secondary text-sm">
                    Puntos de Acceso Vehicular
                  </span>
                  <span className="fw-bold">
                    2 (Entrada/Salida)
                  </span>
                </div>
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
                  Configuración del Sistema
                </h5>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={handleShowEdit}
                >
                  <Edit3 size={14} /> {config ? "Editar" : "Configurar"}
                </button>
              </div>
              {config ? (
                <div className="grid grid-2 gap-4 mt-3">
                  <div className="p-4">
                    <div className="text-muted text-sm fw-bold mb-3">
                      Límites de Vehículos
                    </div>
                    <div className="flex text-center">
                      <div style={{ flex: 1 }}>
                        <div className="fw-bold">{config.max_autos}</div>
                        <div className="text-xs text-muted fw-bold">AUTOS</div>
                      </div>
                      <div className="vr mx-2"></div>
                      <div style={{ flex: 1 }}>
                        <div className="fw-bold">{config.max_motos}</div>
                        <div className="text-xs text-muted fw-bold">MOTOS</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-muted text-sm fw-bold mb-3">
                      Servicio de Carritos
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="fw-bold">
                        {config.tiempo_max_prestamo_min}
                      </span>
                      <span className="text-sm text-muted fw-bold">
                        minutos máx.
                      </span>
                    </div>
                    <div className="mt-2 pt-2 text-sm text-secondary">
                      Penalización:{" "}
                      <strong>
                        S/ {config.penalizacion_por_minuto.toFixed(2)}
                      </strong>{" "}
                      / min.
                    </div>
                  </div>
                  <div>
                    <div className="alert alert-info flex items-center gap-3">
                      <Info className="text-info" size={20} />
                      <div>
                        <h6 className="fw-bold mb-1">
                          Personalización
                        </h6>
                        <p className="text-sm text-secondary mb-0">
                          Como administrador, puedes ajustar estos parámetros
                          para que se adapten a las reglas internas de tu
                          condominio.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="auth-success-icon warning d-inline-block mb-3">
                    <AlertTriangle size={30} />
                  </div>
                  <h5 className="fw-bold">
                    Pendiente de Configuración
                  </h5>
                  <p className="text-secondary text-sm">
                    Establece los límites de vehículos y reglas de carritos
                    para comenzar la gestión operativa.
                  </p>
                  <button
                    className="btn btn-accent"
                    onClick={handleShowEdit}
                  >
                    Establecer Configuración
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title flex items-center gap-2">
                <div className="cell-icon warning">
                  <Settings size={14} />
                </div>
                Configuración del Sistema
              </div>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                <h6 className="text-muted text-sm fw-bold mb-3">
                  Límites de Estacionamiento
                </h6>
                <div className="grid-2 gap-3">
                  <div>
                    <FormInput
                      label="Máx. Autos por Apto."
                      type="number"
                      name="max_autos"
                      register={register}
                      validation={{
                        required: "Requerido",
                        min: { value: 0, message: "Mínimo 0" },
                      }}
                      error={errors.max_autos}
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Máx. Motos por Apto."
                      type="number"
                      name="max_motos"
                      register={register}
                      validation={{
                        required: "Requerido",
                        min: { value: 0, message: "Mínimo 0" },
                      }}
                      error={errors.max_motos}
                    />
                  </div>
                </div>

                <h6 className="text-muted text-sm fw-bold mb-3 mt-2">
                  Reglas de Carritos de Carga
                </h6>
                <div className="grid-2 gap-3">
                  <div>
                    <FormInput
                      label="Tiempo Máx (Minutos)"
                      type="number"
                      name="tiempo_max_prestamo_min"
                      register={register}
                      validation={{
                        required: "Requerido",
                        min: { value: 1, message: "Mínimo 1" },
                      }}
                      error={errors.tiempo_max_prestamo_min}
                    />
                  </div>
                  <div>
                    <FormInput
                      label="Penalidad por Minuto (S/)"
                      type="number"
                      step="0.01"
                      name="penalizacion_por_minuto"
                      register={register}
                      validation={{
                        required: "Requerido",
                        min: { value: 0, message: "Mínimo 0" },
                      }}
                      error={errors.penalizacion_por_minuto}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-3">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowEditModal(false)}
                  >
                    <X size={14} /> Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Save size={14} /> Guardar Cambios
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
