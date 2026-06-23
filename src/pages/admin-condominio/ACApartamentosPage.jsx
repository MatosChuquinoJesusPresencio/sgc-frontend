import { useState, useEffect, useMemo } from "react";
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
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { adminCondominioService } from "../../services/adminCondominioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import FormInput from "../../components/form/FormInput";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";

const ACApartamentosPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [structure, setStructure] = useState(null);
  const [apartments, setApartments] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const [showResidentModal, setShowResidentModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedAptoId, setSelectedAptoId] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [struct, aptos] = await Promise.all([
        adminCondominioService.getStructure(),
        adminCondominioService.getApartments(),
      ]);
      setStructure(struct);
      setApartments(aptos);
    } catch (err) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const torresCondo = useMemo(() => {
    if (!structure?.torres) return [];
    return structure.torres.map((t) => ({
      id: t.id,
      nombre: t.nombre,
    }));
  }, [structure]);

  const pisosMap = useMemo(() => {
    const map = {};
    if (structure?.torres) {
      structure.torres.forEach((t) => {
        (t.pisos || []).forEach((p) => {
          map[p.id] = { ...p, torreId: t.id, torreNombre: t.nombre };
        });
      });
    }
    return map;
  }, [structure]);

  const aptosCondo = useMemo(() => {
    if (!apartments.length) return [];
    return apartments.map((a) => {
      const ownerName = a.propietario
        ? `${a.propietario.nombres || ""} ${a.propietario.apellidos || ""}`.trim()
        : "Sin Propietario";
      return {
        id: a.id,
        numero: a.numero,
        metraje: a.metraje,
        id_usuario: a.idPropietario,
        idUsuario: a.idPropietario,
        id_piso: a.pisoId,
        idPiso: a.pisoId,
        torreNombre: a.torreNombre || pisosMap[a.pisoId]?.torreNombre,
        pisoNumero: a.pisoNumero || a.numeroPiso || pisosMap[a.pisoId]?.numero,
        ownerName,
        residents: a.ocupantes || [],
      };
    });
  }, [apartments, pisosMap]);

  const currentApto = useMemo(() => {
    return aptosCondo.find((a) => a.id === selectedAptoId);
  }, [aptosCondo, selectedAptoId]);

  const stats = useMemo(() => ({
    total: aptosCondo.length,
    ocupados: aptosCondo.filter((a) => a.id_usuario).length,
    sinPropietario: aptosCondo.filter((a) => !a.id_usuario).length,
    totalResidentes: aptosCondo.reduce((acc, a) => acc + (a.residents?.length || 0), 0),
  }), [aptosCondo]);

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

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const handleManageResidents = (aptoId) => {
    setSelectedAptoId(aptoId);
    setShowResidentModal(true);
  };

  const handleAddResident = async (data) => {
    try {
      const current = currentApto?.residents || [];
      const updated = [...current, { nombre: data.nombre, dni: data.dni }];
      await adminCondominioService.updateOccupants(selectedAptoId, { ocupantes: updated });
      reset();
      fetchData();
    } catch (err) {
      setError(err.message || "Error al agregar residente.");
    }
  };

  const handleRemoveResident = (resident) => {
    setResidentToDelete(resident);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!residentToDelete || !selectedAptoId) return;
    try {
      const current = currentApto?.residents || [];
      const updated = current.filter((r) => r.id !== residentToDelete.id && r.dni !== residentToDelete.dni);
      await adminCondominioService.updateOccupants(selectedAptoId, { ocupantes: updated });
      setShowDeleteConfirm(false);
      setResidentToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al eliminar residente.");
    }
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
          title="Gesti\u00f3n de Inquilinos"
          badgeText={structure?.condominioNombre || "Condominio"}
          welcomeText="Administra los inquilinos y residentes registrados en cada unidad habitacional."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Building2} label="Total Unidades" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Ocupados" value={stats.ocupados} colorClass="primary-theme" />
          <StatCard icon={Info} label="Sin Propietario" value={stats.sinPropietario} colorClass="primary-theme" />
          <StatCard icon={Users} label="Poblaci\u00f3n Estimada" value={stats.totalResidentes} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Unidad", "Ubicaci\u00f3n", "Propietario Legal", "Inquilinos/Residentes", "Acciones"]}
          isEmpty={paginatedAptos.length === 0}
          emptyMessage="No se encontraron unidades con los filtros aplicados."
          emptyIcon={Home}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por n\u00famero o propietario..."
              filterValue={towerFilter}
              onFilterChange={setTowerFilter}
              filterOptions={[
                { value: "all", label: "Todas las Torres" },
                ...torresCondo.map((t) => ({ value: t.nombre, label: t.nombre })),
              ]}
              colSize={{ search: 5, filter: 3 }}
            />
          }
          paginationProps={{
            currentPage, totalPages, onPageChange: setCurrentPage,
            totalItems: filteredAptos.length, itemsShowing: paginatedAptos.length,
          }}
        >
          {paginatedAptos.map((apto, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={apto.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="fw-bold">Apto {apto.numero}</div>
                    <div><div className="text-xs text-muted">{apto.metraje} m\u00b2</div></div>
                  </div>
                </td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">
                    {apto.torreNombre} \u2022 Piso {apto.pisoNumero}
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <User size={10} className="text-muted" />
                    <span className={`text-sm ${apto.id_usuario ? "fw-semibold" : "text-danger"}`}>
                      {apto.ownerName}
                    </span>
                  </div>
                </td>
                <td className="py-3">
                  <div className="flex flex-wrap gap-1">
                    {apto.residents?.length > 0 ? (
                      apto.residents.map((r, i) => (
                        <span key={r.id || i} className="badge badge-info">
                          {r.nombre?.split(" ")[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-muted">Sin residentes</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="btn btn-outline btn-sm" onClick={() => handleManageResidents(apto.id)}>
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
              <div className="modal-title">Residentes - Unidad {currentApto?.numero}</div>
              <button className="modal-close" onClick={() => setShowResidentModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <h6 className="fw-bold text-secondary mb-3">Residentes Actuales</h6>
                <div className="p-3">
                  {currentApto?.residents?.length > 0 ? (
                    <table className="data-table">
                      <thead>
                        <tr className="text-sm text-muted">
                          <th className="text-start">Nombre</th>
                          <th className="text-start">DNI</th>
                          <th className="text-right">Acci\u00f3n</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentApto.residents.map((r) => (
                          <tr key={r.id || r.dni}>
                            <td className="py-2 fw-medium">{r.nombre}</td>
                            <td className="py-2 text-muted text-sm">{r.dni}</td>
                            <td className="py-2 text-right">
                              <button className="btn btn-ghost btn-sm text-danger" onClick={() => handleRemoveResident(r)}>
                                <Trash2 size={12} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-3 text-muted text-sm">No hay inquilinos registrados para esta unidad.</div>
                  )}
                </div>
              </div>
              <hr className="my-4" />
              <div>
                <h6 className="fw-bold text-secondary mb-3">Agregar Nuevo Inquilino / Residente</h6>
                <form onSubmit={handleSubmit(handleAddResident)}>
                  <div className="grid-2 gap-3">
                    <FormInput label="Nombre del Inquilino" name="nombre" register={register} validation={{ required: "Requerido" }} error={errors.nombre} placeholder="Ej: Sof\u00eda P\u00e9rez" />
                    <FormInput label="DNI / Identificaci\u00f3n" name="dni" register={register} validation={{ required: "Requerido" }} error={errors.dni} placeholder="N\u00famero de documento" />
                  </div>
                  <div className="flex justify-end mt-3">
                    <button type="submit" className="btn btn-primary btn-sm"><Plus size={14} /> Agregar Residente</button>
                  </div>
                </form>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowResidentModal(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteConfirm}
        onHide={handleCloseConfirm}
        onConfirm={confirmDelete}
        title={`\u00bfEliminar a ${residentToDelete?.nombre}?`}
        message="Esta acci\u00f3n es irreversible. El residente perder\u00e1 el acceso a los servicios del condominio."
        confirmText="Confirmar Eliminaci\u00f3n"
      />
    </AnimatedPage>
  );
};

export default ACApartamentosPage;
