import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  Building2,
  Layers,
  Home,
  Plus,
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
import TowerTable from "../../components/tables/TowerTable";
import FloorTable from "../../components/tables/FloorTable";
import AptoTable from "../../components/tables/AptoTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";

const ACInfraestructuraPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structure, setStructure] = useState(null);

  const [activeTab, setActiveTab] = useState("torres");
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  const fetchStructure = async () => {
    try {
      setLoading(true);
      const data = await adminCondominioService.getStructure();
      setStructure(data);
    } catch (err) {
      setError(err.message || "Error al cargar estructura.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructure();
  }, []);

  const torresCondo = useMemo(() => {
    if (!structure?.torres) return [];
    return structure.torres.map((t) => ({
      id: t.id,
      nombre: t.nombre,
      idCondominio: structure.condominioId,
    }));
  }, [structure]);

  const pisosCondo = useMemo(() => {
    if (!structure?.torres) return [];
    const result = [];
    structure.torres.forEach((t) => {
      (t.pisos || []).forEach((p) => {
        result.push({
          id: p.id,
          numeroPiso: p.numero,
          numero_piso: p.numero,
          idTorre: t.id,
          id_torre: t.id,
        });
      });
    });
    return result;
  }, [structure]);

  const aptosCondo = useMemo(() => {
    if (!structure?.torres) return [];
    const result = [];
    structure.torres.forEach((t) => {
      (t.pisos || []).forEach((p) => {
        (p.apartamentos || []).forEach((a) => {
          result.push({
            id: a.id,
            numero: a.numero,
            metraje: a.metraje,
            idPiso: p.id,
            id_piso: p.id,
            idUsuario: a.idPropietario,
            id_usuario: a.idPropietario,
            derechoEstacionamiento: a.derechoEstacionamiento,
          });
        });
      });
    });
    return result;
  }, [structure]);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      if (type === "torre") setValue("nombre", item.nombre);
      if (type === "piso") {
        setValue("numeroPiso", item.numeroPiso || item.numero_piso);
        setValue("idTorre", item.idTorre || item.id_torre);
      }
      if (type === "apto") {
        setValue("numero", item.numero);
        setValue("metraje", item.metraje);
        setValue("idPiso", item.idPiso || item.id_piso);
        setValue("idUsuario", item.idUsuario || item.id_usuario || "");
      }
    } else {
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (modalType === "torre") {
        await adminCondominioService.createNode({
          tipo: "TORRE",
          nombre: data.nombre,
        });
      } else if (modalType === "piso") {
        await adminCondominioService.createNode({
          tipo: "PISO",
          numeroPiso: parseInt(data.numeroPiso),
          nombreTorre: torresCondo.find((t) => t.id === parseInt(data.idTorre))?.nombre,
        });
      } else if (modalType === "apto") {
        await adminCondominioService.createNode({
          tipo: "APARTAMENTO",
          numeroApartamento: parseInt(data.numero),
          metraje: parseFloat(data.metraje),
          numeroPiso: parseInt(data.idPiso),
        });
      }
      setShowModal(false);
      fetchStructure();
    } catch (err) {
      setError(err.message || "Error al guardar.");
    }
  };

  const handleDeleteClick = (type, item) => {
    setModalType(type);
    setItemToDelete(item);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      const typeMap = { torre: "TORRE", piso: "PISO", apto: "APARTAMENTO" };
      await adminCondominioService.deleteNode(itemToDelete.id, typeMap[modalType]);
      setShowConfirmDelete(false);
      fetchStructure();
    } catch (err) {
      setError(err.message || "Error al eliminar.");
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Infraestructura y Unidades"
          badgeText={structure?.condominioNombre || "Admin"}
          welcomeText="Define la estructura de torres, pisos y apartamentos de tu condominio."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard icon={Building2} label="Torres" value={torresCondo.length} colorClass="primary-theme" />
          <StatCard icon={Layers} label="Pisos Totales" value={pisosCondo.length} colorClass="primary-theme" />
          <StatCard icon={Home} label="Apartamentos" value={aptosCondo.length} colorClass="primary-theme" />
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="tabs">
                <button className={`tab ${activeTab === "torres" ? "active" : ""}`} onClick={() => setActiveTab("torres")}>
                  <Building2 size={14} /> Torres
                </button>
                <button className={`tab ${activeTab === "pisos" ? "active" : ""}`} onClick={() => setActiveTab("pisos")}>
                  <Layers size={14} /> Pisos
                </button>
                <button className={`tab ${activeTab === "apartamentos" ? "active" : ""}`} onClick={() => setActiveTab("apartamentos")}>
                  <Home size={14} /> Apartamentos
                </button>
              </div>
              <button className="btn btn-primary" onClick={() => handleOpenModal(activeTab === "torres" ? "torre" : activeTab === "pisos" ? "piso" : "apto")}>
                <Plus size={14} /> {activeTab === "torres" ? "Nueva Torre" : activeTab === "pisos" ? "Nuevo Piso" : "Nuevo Apartamento"}
              </button>
            </div>

            {activeTab === "torres" && <TowerTable data={torresCondo} onEdit={(item) => handleOpenModal("torre", item)} onDelete={(item) => handleDeleteClick("torre", item)} />}
            {activeTab === "pisos" && <FloorTable data={pisosCondo} torres={torresCondo} onEdit={(item) => handleOpenModal("piso", item)} onDelete={(item) => handleDeleteClick("piso", item)} />}
            {activeTab === "apartamentos" && <AptoTable data={aptosCondo} pisos={pisosCondo} torres={torresCondo} usuarios={[]} onEdit={(item) => handleOpenModal("apto", item)} onDelete={(item) => handleDeleteClick("apto", item)} />}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingItem ? "Editar" : "Crear"} {modalType === "torre" ? "Torre" : modalType === "piso" ? "Piso" : "Apartamento"}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                {modalType === "torre" && (
                  <FormInput label="Nombre de la Torre" name="nombre" register={register} validation={{ required: "Requerido" }} error={errors.nombre} placeholder="Ej: Torre A, Bloque 1..." />
                )}
                {modalType === "piso" && (
                  <>
                    <FormInput label="N\u00famero de Piso" name="numeroPiso" type="number" register={register} validation={{ required: "Requerido" }} error={errors.numeroPiso} />
                    <div className="form-group">
                      <label className="form-label text-secondary fw-semibold text-sm mb-1">Torre</label>
                      <select className="form-select" {...register("idTorre", { required: "Requerido" })}>
                        <option value="">Selecciona torre...</option>
                        {torresCondo.map((t) => (<option key={t.id} value={t.id}>{t.nombre}</option>))}
                      </select>
                    </div>
                  </>
                )}
                {modalType === "apto" && (
                  <>
                    <FormInput label="N\u00famero de Apartamento" name="numero" register={register} validation={{ required: "Requerido" }} error={errors.numero} placeholder="Ej: 101, A-301..." />
                    <div className="grid-2 gap-3">
                      <FormInput label="Superficie (m\u00b2)" type="number" step="0.01" name="metraje" register={register} validation={{ required: "Requerido" }} error={errors.metraje} />
                      <div className="form-group">
                        <label className="form-label text-secondary fw-semibold text-sm mb-1">Piso</label>
                        <select className="form-select" {...register("idPiso", { required: "Requerido" })}>
                          <option value="">Selecciona piso...</option>
                          {pisosCondo.map((p) => {
                            const t = torresCondo.find((torre) => torre.id === (p.idTorre || p.id_torre));
                            return (<option key={p.id} value={p.id}>{t?.nombre} - Piso {p.numeroPiso || p.numero_piso}</option>);
                          })}
                        </select>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex justify-end gap-2 mt-4">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary"><Save size={14} /> Guardar</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog show={showConfirmDelete} onHide={() => setShowConfirmDelete(false)} onConfirm={confirmDelete} title="\u00bfConfirmar eliminaci\u00f3n?" message="Esta acci\u00f3n es irreversible y podr\u00eda afectar a elementos vinculados." />
    </AnimatedPage>
  );
};

export default ACInfraestructuraPage;
