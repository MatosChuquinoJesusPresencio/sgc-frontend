import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  Building2,
  Layers,
  Home,
  Plus,
  Save,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";
import TowerTable from "../../components/tables/TowerTable";
import FloorTable from "../../components/tables/FloorTable";
import AptoTable from "../../components/tables/AptoTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const ACInfraestructuraPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

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

  const torres = getTable("torres");
  const pisos = getTable("pisos");
  const apartamentos = getTable("apartamentos");
  const usuarios = getTable("usuarios");
  const condominio = getTable("condominios").find(
    (c) => c.id === authUser?.id_condominio,
  );

  const torresCondo = useMemo(() => {
    if (!authUser?.id_condominio) return [];
    return torres.filter((t) => t.id_condominio === authUser.id_condominio);
  }, [torres, authUser]);

  const pisosCondo = useMemo(
    () =>
      pisos.filter((p) => torresCondo.map((t) => t.id).includes(p.id_torre)),
    [pisos, torresCondo],
  );
  const aptosCondo = useMemo(
    () =>
      apartamentos.filter((a) =>
        pisosCondo.map((p) => p.id).includes(a.id_piso),
      ),
    [apartamentos, pisosCondo],
  );

  const propietarios = useMemo(() => {
    if (!authUser?.id_condominio) return [];
    return usuarios.filter(
      (u) =>
        u.id_rol === 3 &&
        (u.id_condominio === authUser.id_condominio || !u.id_condominio),
    );
  }, [usuarios, authUser]);

  if (!condominio) return <NoCondoWarning />;

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      if (type === "torre") setValue("nombre", item.nombre);
      if (type === "piso") {
        setValue("numero_piso", item.numero_piso);
        setValue("id_torre", item.id_torre);
      }
      if (type === "apto") {
        setValue("numero", item.numero);
        setValue("metraje", item.metraje);
        setValue("id_piso", item.id_piso);
        setValue("id_usuario", item.id_usuario || "");
      }
    } else {
      reset();
    }
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (modalType === "torre") {
      if (editingItem) {
        updateTable(
          "torres",
          torres.map((t) => (t.id === editingItem.id ? { ...t, ...data } : t)),
        );
      } else {
        const newId =
          torres.length > 0 ? Math.max(...torres.map((t) => t.id)) + 1 : 1;
        updateTable("torres", [
          ...torres,
          { id: newId, id_condominio: authUser.id_condominio, ...data },
        ]);
      }
    } else if (modalType === "piso") {
      const floorData = {
        ...data,
        numero_piso: parseInt(data.numero_piso),
        id_torre: parseInt(data.id_torre),
      };
      if (editingItem) {
        updateTable(
          "pisos",
          pisos.map((p) =>
            p.id === editingItem.id ? { ...p, ...floorData } : p,
          ),
        );
      } else {
        const newId =
          pisos.length > 0 ? Math.max(...pisos.map((p) => p.id)) + 1 : 1;
        updateTable("pisos", [...pisos, { id: newId, ...floorData }]);
      }
    } else if (modalType === "apto") {
      const aptoData = {
        ...data,
        metraje: parseFloat(data.metraje),
        id_piso: parseInt(data.id_piso),
        id_usuario: data.id_usuario ? parseInt(data.id_usuario) : null,
      };
      if (editingItem) {
        updateTable(
          "apartamentos",
          apartamentos.map((a) =>
            a.id === editingItem.id ? { ...a, ...aptoData } : a,
          ),
        );
      } else {
        const newId =
          apartamentos.length > 0
            ? Math.max(...apartamentos.map((a) => a.id)) + 1
            : 1;
        updateTable("apartamentos", [
          ...apartamentos,
          { id: newId, ...aptoData },
        ]);
      }
    }
    setShowModal(false);
  };

  const handleDeleteClick = (type, item) => {
    setModalType(type);
    setItemToDelete(item);
    setShowConfirmDelete(true);
  };

  const confirmDelete = () => {
    if (modalType === "torre")
      updateTable(
        "torres",
        torres.filter((t) => t.id !== itemToDelete.id),
      );
    if (modalType === "piso")
      updateTable(
        "pisos",
        pisos.filter((p) => p.id !== itemToDelete.id),
      );
    if (modalType === "apto")
      updateTable(
        "apartamentos",
        apartamentos.filter((a) => a.id !== itemToDelete.id),
      );
    setShowConfirmDelete(false);
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Infraestructura y Unidades"
          badgeText={condominio?.nombre || "Admin"}
          welcomeText="Define la estructura de torres, pisos y apartamentos de tu condominio."
        />

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard
            icon={Building2}
            label="Torres"
            value={torresCondo.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Layers}
            label="Pisos Totales"
            value={pisosCondo.length}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Home}
            label="Apartamentos"
            value={aptosCondo.length}
            colorClass="primary-theme"
          />
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="tabs">
                <button
                  className={`tab ${activeTab === "torres" ? "active" : ""}`}
                  onClick={() => setActiveTab("torres")}
                >
                  <Building2 size={14} /> Torres
                </button>
                <button
                  className={`tab ${activeTab === "pisos" ? "active" : ""}`}
                  onClick={() => setActiveTab("pisos")}
                >
                  <Layers size={14} /> Pisos
                </button>
                <button
                  className={`tab ${activeTab === "apartamentos" ? "active" : ""}`}
                  onClick={() => setActiveTab("apartamentos")}
                >
                  <Home size={14} /> Apartamentos
                </button>
              </div>
              <button
                className="btn btn-primary"
                onClick={() =>
                  handleOpenModal(
                    activeTab === "torres"
                      ? "torre"
                      : activeTab === "pisos"
                        ? "piso"
                        : "apto",
                  )
                }
              >
                <Plus size={14} />{" "}
                {activeTab === "torres"
                  ? "Nueva Torre"
                  : activeTab === "pisos"
                    ? "Nuevo Piso"
                    : "Nuevo Apartamento"}
              </button>
            </div>

            {activeTab === "torres" && (
              <TowerTable
                data={torresCondo}
                onEdit={(item) => handleOpenModal("torre", item)}
                onDelete={(item) => handleDeleteClick("torre", item)}
              />
            )}
            {activeTab === "pisos" && (
              <FloorTable
                data={pisosCondo}
                torres={torresCondo}
                onEdit={(item) => handleOpenModal("piso", item)}
                onDelete={(item) => handleDeleteClick("piso", item)}
              />
            )}
            {activeTab === "apartamentos" && (
              <AptoTable
                data={aptosCondo}
                pisos={pisosCondo}
                torres={torresCondo}
                usuarios={propietarios}
                onEdit={(item) => handleOpenModal("apto", item)}
                onDelete={(item) => handleDeleteClick("apto", item)}
              />
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingItem ? "Editar" : "Crear"}{" "}
                {modalType === "torre"
                  ? "Torre"
                  : modalType === "piso"
                    ? "Piso"
                    : "Apartamento"}
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(onSubmit)}>
                {modalType === "torre" && (
                  <FormInput
                    label="Nombre de la Torre"
                    name="nombre"
                    register={register}
                    validation={{ required: "Requerido" }}
                    error={errors.nombre}
                    placeholder="Ej: Torre A, Bloque 1..."
                  />
                )}

                {modalType === "piso" && (
                  <>
                    <FormInput
                      label="Número de Piso"
                      name="numero_piso"
                      type="number"
                      register={register}
                      validation={{ required: "Requerido" }}
                      error={errors.numero_piso}
                    />
                    <div className="form-group">
                      <label className="form-label text-secondary fw-semibold text-sm mb-1">
                        Torre
                      </label>
                      <select
                        className="form-select"
                        {...register("id_torre", { required: "Requerido" })}
                      >
                        <option value="">Selecciona torre...</option>
                        {torresCondo.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                {modalType === "apto" && (
                  <>
                    <FormInput
                      label="Número de Apartamento"
                      name="numero"
                      register={register}
                      validation={{ required: "Requerido" }}
                      error={errors.numero}
                      placeholder="Ej: 101, A-301..."
                    />
                    <div className="grid-2 gap-3">
                      <div>
                        <FormInput
                          label="Superficie (m²)"
                          type="number"
                          step="0.01"
                          name="metraje"
                          register={register}
                          validation={{ required: "Requerido" }}
                          error={errors.metraje}
                        />
                      </div>
                      <div>
                        <div className="form-group">
                          <label className="form-label text-secondary fw-semibold text-sm mb-1">
                            Piso
                          </label>
                          <select
                            className="form-select"
                            {...register("id_piso", { required: "Requerido" })}
                          >
                            <option value="">Selecciona piso...</option>
                            {pisosCondo.map((p) => {
                              const t = torresCondo.find(
                                (torre) => torre.id === p.id_torre,
                              );
                              return (
                                <option key={p.id} value={p.id}>
                                  {t?.nombre} - Piso {p.numero_piso}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="form-group">
                      <label className="form-label text-secondary fw-semibold text-sm mb-1">
                        Propietario
                      </label>
                      <select
                        className="form-select"
                        {...register("id_usuario")}
                      >
                        <option value="">Sin asignar</option>
                        {propietarios.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.nombre}
                          </option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    <Save size={14} /> Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        onConfirm={confirmDelete}
        title="¿Confirmar eliminación?"
        message="Esta acción es irreversible y podría afectar a elementos vinculados."
      />
    </AnimatedPage>
  );
};

export default ACInfraestructuraPage;
