import { useState, useEffect, useMemo } from "react";
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
import { usePagination } from "../../hooks/usePagination";
import ConfirmDialog from "../../components/modals/ConfirmDialog";

const ACEstacionamientosPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);
  const [structure, setStructure] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [towerFilter, setTowerFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showVehiclesModal, setShowVehiclesModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, struct] = await Promise.all([
        adminCondominioService.getAssets(),
        adminCondominioService.getStructure(),
      ]);
      setAssets(Array.isArray(assetsRes) ? assetsRes : []);
      setStructure(struct);
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
    return structure.torres.map((t) => ({ id: t.id, nombre: t.nombre }));
  }, [structure]);

  const aptosMap = useMemo(() => {
    const map = {};
    if (structure?.torres) {
      structure.torres.forEach((t) => {
        (t.pisos || []).forEach((p) => {
          (p.apartamentos || []).forEach((a) => {
            map[a.id] = {
              ...a,
              pisoNumero: p.numero,
              torreNombre: t.nombre,
            };
          });
        });
      });
    }
    return map;
  }, [structure]);

  const estacionamientosCondo = useMemo(() => {
    return (assets || [])
      .filter((a) => a.tipo === "ESTACIONAMIENTO" || !a.tipo)
      .map((e) => {
        const apto = aptosMap[e.idApartamento || e.id_apartamento];
        return {
          id: e.id,
          numero: e.numero || e.codigo,
          idApartamento: e.idApartamento || e.id_apartamento,
          id_apartamento: e.idApartamento || e.id_apartamento,
          tipoVehiculo: e.tipoVehiculo || e.tipo_vehiculo || "Auto",
          cantidadVehiculos: e.cantidadVehiculos || e.cantidad_vehiculos || 0,
          cantidad_vehiculos: e.cantidadVehiculos || e.cantidad_vehiculos || 0,
          ocupado: e.ocupado || (e.cantidadVehiculos || e.cantidad_vehiculos || 0) > 0,
          aptoNumero: apto?.numero,
          torreNombre: apto?.torreNombre,
          ownerName: apto?.propietario
            ? `${apto.propietario.nombres || ""} ${apto.propietario.apellidos || ""}`.trim()
            : apto?.idPropietario
              ? "Asignado"
              : "Sin Propietario",
          vehiculos: e.vehiculos || e.ownerVehicles || [],
        };
      });
  }, [assets, aptosMap]);

  const stats = useMemo(() => ({
    total: estacionamientosCondo.length,
    ocupados: estacionamientosCondo.filter((e) => e.ocupado).length,
    disponibles: estacionamientosCondo.filter((e) => !e.ocupado).length,
    conVehiculos: estacionamientosCondo.filter((e) => e.cantidadVehiculos > 0).length,
  }), [estacionamientosCondo]);

  const filteredEstacionamientos = useMemo(() => {
    return estacionamientosCondo.filter((e) => {
      const matchesSearch =
        e.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.aptoNumero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.ownerName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTower =
        towerFilter === "all" || e.torreNombre === towerFilter;
      return matchesSearch && matchesTower;
    });
  }, [estacionamientosCondo, searchTerm, towerFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData, itemsPerPage } = usePagination(filteredEstacionamientos);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const handleOpenCreate = () => {
    setEditingAsset(null);
    reset({ numero: "", idApartamento: "" });
    setShowFormModal(true);
  };

  const handleOpenEdit = (est) => {
    if (est.cantidadVehiculos > 0) return;
    setEditingAsset(est);
    reset({ numero: est.numero, idApartamento: est.idApartamento || "" });
    setShowFormModal(true);
  };

  const handleOpenVehicles = (est) => {
    setSelectedAsset(est);
    setShowVehiclesModal(true);
  };

  const handleOpenDelete = (est) => {
    if (est.cantidadVehiculos > 0) return;
    setAssetToDelete(est);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingAsset) {
        await adminCondominioService.updateAssetStatus(editingAsset.id, {
          numero: data.numero,
          idApartamento: parseInt(data.idApartamento),
        });
      } else {
        await adminCondominioService.createAsset({
          tipo: "ESTACIONAMIENTO",
          numero: data.numero,
          idApartamento: parseInt(data.idApartamento),
        });
      }
      setShowFormModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al guardar.");
    }
  };

  const confirmDelete = async () => {
    try {
      await adminCondominioService.deleteAsset(assetToDelete.id);
      setShowDeleteModal(false);
      setAssetToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al eliminar.");
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Car}
          title="Gesti\u00f3n de Estacionamientos"
          badgeText={structure?.condominioNombre || "Condominio"}
          welcomeText="Administra los espacios de parqueo, as\u00edgnalos a unidades y visualiza la ocupaci\u00f3n vehicular."
        >
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <Car size={16} /><span>Nuevo Estacionamiento</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Car} label="Total Espacios" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Ocupados" value={stats.ocupados} colorClass="primary-theme" />
          <StatCard icon={Info} label="Disponibles" value={stats.disponibles} colorClass="primary-theme" />
          <StatCard icon={AlertTriangle} label="Con Veh\u00edculos" value={stats.conVehiculos} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Nro. Estacionamiento", "Unidad Asignada", "Propietario", "Estado", "Veh\u00edculos", "Acciones"]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No se encontraron estacionamientos."
          emptyIcon={Car}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por n\u00famero, apto o propietario..."
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
            totalItems: filteredEstacionamientos.length, itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((est, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={est.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3">
                  <div className="fw-bold">{est.numero}</div>
                  <div className="text-xs text-muted">
                    {est.cantidadVehiculos > 0 ? est.tipoVehiculo : "Sin veh\u00edculos"}
                  </div>
                </td>
                <td className="py-3">
                  <span className="badge badge-info">Apto {est.aptoNumero}</span>
                  <div className="text-xs text-muted mt-1">{est.torreNombre}</div>
                </td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">{est.ownerName}</div>
                </td>
                <td className="py-3">
                  <span className={`badge ${est.ocupado ? "badge-danger" : "badge-success"}`}>
                    {est.ocupado ? "Ocupado" : "Disponible"}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <div className="text-center">
                    {est.cantidadVehiculos > 0 ? (
                      <><span className="fw-bold text-accent">{est.cantidadVehiculos}</span></>
                    ) : (
                      <span className="text-muted fw-bold">0</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenVehicles(est)} disabled={est.cantidadVehiculos === 0}>
                      <Eye size={14} /> <span>Detalles</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(est)} disabled={est.cantidadVehiculos > 0}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenDelete(est)} disabled={est.cantidadVehiculos > 0}>
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
              <div className="modal-title">{editingAsset ? "Editar Estacionamiento" : "Nuevo Estacionamiento"}</div>
              <button className="modal-close" onClick={() => setShowFormModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="grid-2 gap-3">
                  <FormInput label="N\u00famero de Estacionamiento" name="numero" register={register} validation={{ required: "Requerido" }} error={errors.numero} placeholder="Ej: E-101" />
                  <div className="form-group mb-3">
                    <label className="form-label fw-semibold text-sm text-secondary">Apartamento Asignado</label>
                    <select className="form-select" {...register("idApartamento", { required: "Debe asignar un apartamento" })}>
                      <option value="">Seleccionar apartamento...</option>
                      {Object.entries(aptosMap).map(([id, a]) => (
                        <option key={id} value={id}>Apto {a.numero} - {a.torreNombre}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowFormModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingAsset ? "Guardar Cambios" : "Crear Estacionamiento"}</button>
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
                <Car size={16} /> Veh\u00edculos en {selectedAsset?.numero}
              </div>
              <button className="modal-close" onClick={() => setShowVehiclesModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <span className="text-muted text-sm">Propietario: </span>
                <span className="fw-bold">{selectedAsset?.ownerName}</span>
              </div>
              <div className="p-3">
                {selectedAsset?.vehiculos?.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {selectedAsset.vehiculos.map((v, i) => (
                      <div key={v.id || i} className="flex items-center gap-3 p-2">
                        <div className="cell-icon primary"><Car size={20} /></div>
                        <div style={{ flex: 1 }}>
                          <div className="fw-bold">{v.marca || ""} {v.modelo || ""}</div>
                          <div className="text-xs text-muted">
                            {v.color ? `Color: ${v.color} \u2022 ` : ""}
                            Placa: <span className="fw-bold">{v.placa || v.matricula || "-"}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="text-warning mb-2" size={24} />
                    <div className="text-muted text-sm">No hay vehículos registrados para este propietario.</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-full" onClick={() => setShowVehiclesModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminaci\u00f3n"
        message={"\u00bfEst\u00e1s seguro de que deseas eliminar el estacionamiento " + (assetToDelete?.numero || "") + "?"}
      />
    </AnimatedPage>
  );
};

export default ACEstacionamientosPage;
