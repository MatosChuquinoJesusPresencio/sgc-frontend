import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  Car,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Eye,
  X,
  Save,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import NoCondoWarning from "../../components/ui/NoCondoWarning";
import { usePagination } from "../../hooks/usePagination";
import ConfirmDialog from "../../components/modals/ConfirmDialog";

const ACEstacionamientosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const estacionamientos = getTable("estacionamientos");
  const apartamentos = getTable("apartamentos");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const usuarios = getTable("usuarios");
  const vehiculos = getTable("vehiculos");
  const condominio = getTable("condominios").find(
    (c) => c.id === authUser?.id_condominio,
  );

  if (!condominio) return <NoCondoWarning />;

  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [editingEstacionamiento, setEditingEstacionamiento] = useState(null);
  const [selectedEstacionamiento, setSelectedEstacionamiento] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const configuraciones = getTable("configuraciones");
  const config = useMemo(
    () =>
      configuraciones.find((c) => c.id_condominio === authUser?.id_condominio),
    [configuraciones, authUser],
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [estacionamientoToDelete, setEstacionamientoToDelete] = useState(null);

  const torresCondo = useMemo(() => {
    if (!authUser?.id_condominio) return [];
    return torres.filter((t) => t.id_condominio === authUser.id_condominio);
  }, [torres, authUser]);

  const torresIds = useMemo(() => torresCondo.map((t) => t.id), [torresCondo]);
  const pisosIds = useMemo(
    () => pisos.filter((p) => torresIds.includes(p.id_torre)).map((p) => p.id),
    [pisos, torresIds],
  );

  const apartamentosCondo = useMemo(
    () => apartamentos.filter((a) => pisosIds.includes(a.id_piso)),
    [apartamentos, pisosIds],
  );

  const estacionamientosCondo = useMemo(() => {
    const aptosIds = apartamentosCondo.map((a) => a.id);

    return estacionamientos
      .filter((e) => aptosIds.includes(e.id_apartamento))
      .map((e) => {
        const apto = apartamentos.find((a) => a.id === e.id_apartamento);
        const piso = pisos.find((p) => p.id === apto?.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        const owner = usuarios.find((u) => u.id === apto?.id_usuario);

        const residents = getTable("inquilinos_temporales").filter(
          (i) => i.id_apartamento === e.id_apartamento,
        );
        const residentIds = residents.map((r) => r.id);

        const ownerVehicles = owner
          ? vehiculos.filter((v) => v.id_usuario === owner.id)
          : [];
        const residentVehicles = vehiculos.filter((v) =>
          residentIds.includes(v.id_inquilino_temporal),
        );

        const allVehicles = [...ownerVehicles, ...residentVehicles];

        const isFull =
          e.cantidad_vehiculos > 0 &&
          ((e.tipo_vehiculo === "Auto" &&
            e.cantidad_vehiculos >= (config?.max_autos || 0)) ||
            (e.tipo_vehiculo === "Moto" &&
              e.cantidad_vehiculos >= (config?.max_motos || 0)));

        return {
          ...e,
          ocupado: isFull,
          aptoNumero: apto?.numero,
          torreNombre: torre?.nombre,
          ownerName: owner?.nombre || "Sin Propietario",
          ownerVehicles: allVehicles,
        };
      });
  }, [
    estacionamientos,
    apartamentosCondo,
    apartamentos,
    pisos,
    torres,
    usuarios,
    vehiculos,
    config,
  ]);

  const stats = useMemo(
    () => ({
      total: estacionamientosCondo.length,
      ocupados: estacionamientosCondo.filter((e) => e.ocupado).length,
      disponibles: estacionamientosCondo.filter((e) => !e.ocupado).length,
      conVehiculos: estacionamientosCondo.filter(
        (e) => e.cantidad_vehiculos > 0,
      ).length,
    }),
    [estacionamientosCondo],
  );

  const filteredEstacionamientos = useMemo(() => {
    return estacionamientosCondo.filter((e) => {
      const matchesSearch =
        e.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.aptoNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTower =
        towerFilter === "all" || e.torreNombre === towerFilter;

      return matchesSearch && matchesTower;
    });
  }, [estacionamientosCondo, searchTerm, towerFilter]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData,
    itemsPerPage,
  } = usePagination(filteredEstacionamientos);

  const handleOpenCreate = () => {
    setEditingEstacionamiento(null);
    reset({
      numero: "",
      id_apartamento: "",
    });
    setShowFormModal(true);
  };

  const handleOpenEdit = (est) => {
    if (est.cantidad_vehiculos > 0) return;
    setEditingEstacionamiento(est);
    reset({
      numero: est.numero,
      id_apartamento: est.id_apartamento,
    });
    setShowFormModal(true);
  };

  const handleOpenVehicles = (est) => {
    setSelectedEstacionamiento(est);
    setShowVehiclesModal(true);
  };

  const handleOpenDelete = (est) => {
    if (est.cantidad_vehiculos > 0) return;
    setEstacionamientoToDelete(est);
    setShowDeleteModal(true);
  };

  const onSubmit = (data) => {
    const aptoId = parseInt(data.id_apartamento);
    if (editingEstacionamiento) {
      const updated = estacionamientos.map((e) =>
        e.id === editingEstacionamiento.id
          ? {
            ...e,
            numero: data.numero,
            id_apartamento: aptoId,
          }
          : e,
      );
      updateTable("estacionamientos", updated);
    } else {
      const newId =
        estacionamientos.length > 0
          ? Math.max(...estacionamientos.map((e) => e.id)) + 1
          : 1;
      const newEst = {
        id: newId,
        numero: data.numero,
        id_apartamento: aptoId,
        tipo_vehiculo: "Auto",
        cantidad_vehiculos: 0,
        ocupado: false,
      };
      updateTable("estacionamientos", [...estacionamientos, newEst]);
    }
    setShowFormModal(false);
  };

  const confirmDelete = () => {
    if (estacionamientoToDelete) {
      const updated = estacionamientos.filter(
        (e) => e.id !== estacionamientoToDelete.id,
      );
      updateTable("estacionamientos", updated);
      setShowDeleteModal(false);
      setEstacionamientoToDelete(null);
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Car}
          title="Gestión de Estacionamientos"
          badgeText={condominio?.nombre || "Condominio"}
          welcomeText="Administra los espacios de parqueo, asígnatos a unidades y visualiza la ocupación vehicular."
        >
          <button
            className="btn btn-primary"
            onClick={handleOpenCreate}
          >
            <Car size={16} />
            <span>Nuevo Estacionamiento</span>
          </button>
        </DashboardHeader>

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard
            icon={Car}
            label="Total Espacios"
            value={stats.total}
            colorClass="primary-theme"
          />
          <StatCard
            icon={CheckCircle}
            label="Ocupados"
            value={stats.ocupados}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Info}
            label="Disponibles"
            value={stats.disponibles}
            colorClass="primary-theme"
          />
          <StatCard
            icon={AlertTriangle}
            label="Con Vehículos"
            value={stats.conVehiculos}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={[
            "#",
            "Nro. Estacionamiento",
            "Unidad Asignada",
            "Propietario",
            "Estado",
            "Vehículos",
            "Acciones",
          ]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No se encontraron estacionamientos."
          emptyIcon={Car}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por número, apto o propietario..."
              filterValue={towerFilter}
              onFilterChange={setTowerFilter}
              filterOptions={[
                { value: "all", label: "Todas las Torres" },
                ...torresCondo.map((t) => ({
                  value: t.nombre,
                  label: t.nombre,
                })),
              ]}
              colSize={{ search: 5, filter: 3 }}
            />
          }
          paginationProps={{
            currentPage: currentPage,
            totalPages: totalPages,
            onPageChange: setCurrentPage,
            totalItems: filteredEstacionamientos.length,
            itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((est, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={est.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td className="py-3">
                  <div className="fw-bold">{est.numero}</div>
                  <div className="text-xs text-muted">
                    {est.cantidad_vehiculos > 0
                      ? est.tipo_vehiculo
                      : "Sin vehículos"}
                  </div>
                </td>
                <td className="py-3">
                  <span className="badge badge-info">
                    Apto {est.aptoNumero}
                  </span>
                  <div className="text-xs text-muted mt-1">
                    {est.torreNombre}
                  </div>
                </td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">
                    {est.ownerName}
                  </div>
                </td>
                <td className="py-3">
                  <span className={`badge ${est.ocupado ? "badge-danger" : "badge-success"}`}>
                    {est.ocupado ? "Ocupado" : "Disponible"}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="text-center">
                    {est.cantidad_vehiculos > 0 ? (
                      <>
                        <span className="fw-bold text-accent">
                          {est.cantidad_vehiculos}
                        </span>
                        <span className="text-muted text-xs">
                          {" "}
                          /{" "}
                          {est.tipo_vehiculo === "Auto"
                            ? config?.max_autos || "-"
                            : config?.max_motos || "-"}
                        </span>
                      </>
                    ) : (
                      <span className="text-muted fw-bold">0</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenVehicles(est)}
                      disabled={est.cantidad_vehiculos === 0}
                    >
                      <Eye size={14} /> <span>Detalles</span>
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenEdit(est)}
                      disabled={est.cantidad_vehiculos > 0}
                    >
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenDelete(est)}
                      disabled={est.cantidad_vehiculos > 0}
                    >
                      <Trash2 size={14} /> <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {showFormModal && (
        <div className="modal-overlay" onClick={() => setShowFormModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                {editingEstacionamiento
                  ? "Editar Estacionamiento"
                  : "Nuevo Estacionamiento"}
              </div>
              <button className="modal-close" onClick={() => setShowFormModal(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="grid-2 gap-3">
                  <div>
                    <FormInput
                      label="Número de Estacionamiento"
                      name="numero"
                      register={register}
                      validation={{ required: "El número es requerido" }}
                      error={errors.numero}
                      placeholder="Ej: E-101"
                    />
                  </div>
                  <div>
                    <div className="form-group mb-3">
                      <label className="form-label fw-semibold text-sm text-secondary">
                        Apartamento Asignado
                      </label>
                      <select
                        className="form-select"
                        {...register("id_apartamento", {
                          required: "Debe asignar un apartamento",
                        })}
                      >
                        <option value="">Seleccionar apartamento...</option>
                        {apartamentosCondo.map((a) => (
                          <option key={a.id} value={a.id}>
                            Apto {a.numero} -{" "}
                            {
                              torres.find(
                                (t) =>
                                  t.id ===
                                  pisos.find((p) => p.id === a.id_piso)?.id_torre,
                              )?.nombre
                            }
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowFormModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingEstacionamiento
                    ? "Guardar Cambios"
                    : "Crear Estacionamiento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showVehiclesModal && (
        <div className="modal-overlay" onClick={() => setShowVehiclesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title flex items-center gap-2">
                <Car size={16} /> Vehículos en {selectedEstacionamiento?.numero}
              </div>
              <button className="modal-close" onClick={() => setShowVehiclesModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <span className="text-muted text-sm">Propietario: </span>
                <span className="fw-bold">
                  {selectedEstacionamiento?.ownerName}
                </span>
              </div>
              <div className="p-3">
                {selectedEstacionamiento?.ownerVehicles.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {selectedEstacionamiento.ownerVehicles.map((v) => (
                      <div
                        key={v.id}
                        className="flex items-center gap-3 p-2"
                      >
                        <div className="cell-icon primary">
                          <Car size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="fw-bold">
                            {v.marca} {v.modelo}
                          </div>
                          <div className="text-xs text-muted">
                            Color: {v.color} • Placa:{" "}
                            <span className="fw-bold">{v.placa}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle
                      className="text-warning mb-2"
                      size={24}
                    />
                    <div className="text-muted text-sm">
                      No hay vehículos registrados para este propietario.
                    </div>
                    <div className="text-xs text-secondary">
                      La cantidad indicada (
                      {selectedEstacionamiento?.cantidad_vehiculos}) puede ser
                      informativa o de inquilinos.
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary w-full"
                onClick={() => setShowVehiclesModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que deseas eliminar el estacionamiento ${estacionamientoToDelete?.numero}?`}
      />
    </AnimatedPage>
  );
};

export default ACEstacionamientosPage;
