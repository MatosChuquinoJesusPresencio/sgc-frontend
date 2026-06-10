import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";

import {
  Home,
  User,
  Users,
  Plus,
  Trash2,
  Info,
  Building2,
  CheckCircle,
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
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import NoCondoWarning from "../../components/ui/NoCondoWarning";
import { usePagination } from "../../hooks/usePagination";

const ACApartamentosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const [showResidentModal, setShowResidentModal] = useState(false);
  const [showDeleteWarning, setShowDeleteWarning] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAptoId, setSelectedAptoId] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const apartamentos = getTable("apartamentos");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const usuarios = getTable("usuarios");
  const inquilinosTemporales = getTable("inquilinos_temporales");
  const vehiculos = getTable("vehiculos");
  const condominio = getTable("condominios").find(
    (c) => c.id === authUser?.id_condominio,
  );

  const torresCondo = useMemo(() => {
    if (!authUser?.id_condominio) return [];
    return torres.filter((t) => t.id_condominio === authUser.id_condominio);
  }, [torres, authUser]);

  const aptosCondo = useMemo(() => {
    const torresIds = torresCondo.map((t) => t.id);
    const pisosIds = pisos
      .filter((p) => torresIds.includes(p.id_torre))
      .map((p) => p.id);

    return apartamentos
      .filter((a) => pisosIds.includes(a.id_piso))
      .map((a) => {
        const piso = pisos.find((p) => p.id === a.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        const owner = usuarios.find((u) => u.id === a.id_usuario);

        const residents = inquilinosTemporales.filter(
          (i) => i.id_apartamento === a.id,
        );

        return {
          ...a,
          torreNombre: torre?.nombre,
          pisoNumero: piso?.numero_piso,
          ownerName: owner?.nombre || "Sin Propietario",
          residents: residents,
        };
      });
  }, [apartamentos, pisos, torresCondo, usuarios, inquilinosTemporales]);

  const currentApto = useMemo(() => {
    return aptosCondo.find((a) => a.id === selectedAptoId);
  }, [aptosCondo, selectedAptoId]);

  const stats = useMemo(
    () => ({
      total: aptosCondo.length,
      ocupados: aptosCondo.filter((a) => a.id_usuario !== null).length,
      sinPropietario: aptosCondo.filter((a) => a.id_usuario === null).length,
      totalResidentes: inquilinosTemporales.filter((i) => {
        const apto = apartamentos.find((a) => a.id === i.id_apartamento);
        const piso = pisos.find((p) => p.id === apto?.id_piso);
        const torre = torres.find((t) => t.id === piso?.id_torre);
        return torre?.id_condominio === authUser?.id_condominio;
      }).length,
    }),
    [aptosCondo, inquilinosTemporales, apartamentos, pisos, torres, authUser],
  );

  const filteredAptos = useMemo(() => {
    return aptosCondo.filter((apto) => {
      const matchesSearch =
        apto.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        apto.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTower =
        towerFilter === "all" || apto.torreNombre === towerFilter;

      return matchesSearch && matchesTower;
    });
  }, [aptosCondo, searchTerm, towerFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedAptos, itemsPerPage } = usePagination(filteredAptos);

  if (!condominio) return <NoCondoWarning />;

  const handleManageResidents = (aptoId) => {
    setSelectedAptoId(aptoId);
    setShowResidentModal(true);
  };

  const handleAddResident = (data) => {
    const newId =
      inquilinosTemporales.length > 0
        ? Math.max(...inquilinosTemporales.map((i) => i.id)) + 1
        : 1;
    const newInquilino = {
      id: newId,
      id_apartamento: selectedAptoId,
      nombre: data.nombre,
      dni: data.dni,
    };

    updateTable("inquilinos_temporales", [
      ...inquilinosTemporales,
      newInquilino,
    ]);
    reset();
  };

  const handleRemoveResident = (resident) => {
    setResidentToDelete(resident);
    const hasVehicles = vehiculos.some((v) => v.id_inquilino_temporal === resident.id);
    if (hasVehicles) {
      setShowDeleteWarning(true);
    } else {
      setShowDeleteConfirm(true);
    }
  };

  const confirmDelete = () => {
    if (!residentToDelete) return;
    const updated = inquilinosTemporales.filter((i) => i.id !== residentToDelete.id);
    updateTable("inquilinos_temporales", updated);
    setShowDeleteConfirm(false);
    setResidentToDelete(null);
  };

  const handleCloseWarning = () => {
    setShowDeleteWarning(false);
    setResidentToDelete(null);
  };

  const handleCloseConfirm = () => {
    setShowDeleteConfirm(false);
    setResidentToDelete(null);
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Home}
          title="Gestión de Inquilinos"
          badgeText={condominio?.nombre || "Condominio"}
          welcomeText="Administra los inquilinos y residentes registrados en cada unidad habitacional."
        />

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard
            icon={Building2}
            label="Total Unidades"
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
            label="Sin Propietario"
            value={stats.sinPropietario}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Users}
            label="Población Estimada"
            value={stats.totalResidentes}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={[
            "#",
            "Unidad",
            "Ubicación",
            "Propietario Legal",
            "Inquilinos/Residentes",
            "Acciones",
          ]}
          isEmpty={paginatedAptos.length === 0}
          emptyMessage="No se encontraron unidades con los filtros aplicados."
          emptyIcon={Home}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por número o propietario..."
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
            totalItems: filteredAptos.length,
            itemsShowing: paginatedAptos.length,
          }}
        >
          {paginatedAptos.map((apto, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={apto.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="fw-bold">
                      Apto {apto.numero}
                    </div>
                    <div>
                      <div className="text-xs text-muted">
                        {apto.metraje} m²
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">
                    {apto.torreNombre} • Piso {apto.pisoNumero}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <User size={10} className="text-muted" />
                    <span
                      className={`text-sm ${apto.id_usuario ? "fw-semibold" : "text-danger"}`}
                    >
                      {apto.ownerName}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {apto.residents.length > 0 ? (
                      apto.residents.map((r) => (
                        <span
                          key={r.id}
                          className="badge badge-info"
                        >
                          {r.nombre.split(" ")[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted">Sin residentes</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleManageResidents(apto.id)}
                  >
                    Gestionar
                  </button>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {showResidentModal && (
        <div className="modal-overlay" onClick={() => setShowResidentModal(false)}>
          <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                Residentes - Unidad {currentApto?.numero}
              </div>
              <button className="modal-close" onClick={() => setShowResidentModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-3">Residentes Actuales</h6>
                <div className="p-3">
                  {currentApto?.residents.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr className="text-sm text-muted">
                          <th className="text-start">Nombre</th>
                          <th className="text-start">DNI</th>
                          <th className="text-right">Acción</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApto.residents.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 fw-medium">{r.nombre}</td>
                            <td className="py-2 text-muted text-sm">{r.dni}</td>
                            <td className="py-2 text-right">
                              <button
                                className="btn btn-ghost btn-sm text-danger"
                                onClick={() => handleRemoveResident(r)}
                              >
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-3 text-muted text-sm">
                      No hay inquilinos registrados para esta unidad.
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-4" />

              <div>
                <h6 className="fw-bold text-secondary mb-3">
                  Agregar Nuevo Inquilino / Residente
                </h6>
                <form onSubmit={handleSubmit(handleAddResident)}>
                  <div className="grid-2 gap-3">
                    <div>
                      <FormInput
                        label="Nombre del Inquilino"
                        name="nombre"
                        register={register}
                        validation={{ required: "Requerido" }}
                        error={errors.nombre}
                        placeholder="Ej: Sofía Pérez"
                      />
                    </div>
                    <div>
                      <FormInput
                        label="DNI / Identificación"
                        name="dni"
                        register={register}
                        validation={{ required: "Requerido" }}
                        error={errors.dni}
                        placeholder="Número de documento"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                    >
                      <Plus size={14} /> Agregar Residente
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowResidentModal(false)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteWarning && (
        <div className="modal-overlay" onClick={handleCloseWarning}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title text-warning">
                Acción Bloqueada
              </div>
              <button className="modal-close" onClick={handleCloseWarning}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              {residentToDelete && (
                <div className="text-center py-3">
                  <div className="auth-success-icon warning d-inline-block mb-3">
                    <Info size={40} />
                  </div>
                  <h5 className="fw-bold">No se puede eliminar</h5>
                  <div className="alert alert-warning text-sm text-start mt-3">
                    El residente <strong>{residentToDelete.nombre}</strong>{" "}
                    tiene vehículos registrados en el sistema. Por seguridad,
                    debes eliminar sus vehículos antes de poder dar de baja al
                    residente.
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer flex gap-2">
              <button
                className="btn btn-outline"
                onClick={handleCloseWarning}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={handleCloseConfirm}
        onConfirm={confirmDelete}
        title={`¿Eliminar a ${residentToDelete?.nombre}?`}
        message="Esta acción es irreversible. El residente perderá el acceso a los servicios del condominio."
        confirmText="Confirmar Eliminación"
      />
    </AnimatedPage>
  );
};

export default ACApartamentosPage;
