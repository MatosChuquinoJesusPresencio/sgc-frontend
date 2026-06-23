import { useState, useMemo, useEffect } from "react";
import { useForm } from "react-hook-form";

import {
  ShoppingCart,
  Trash2,
  Info,
  CheckCircle,
  AlertTriangle,
  Edit3,
  Wrench,
  PlusCircle,
  Eye,
  User,
  Clock,
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
import { formatDateTime } from "../../utils/formatters";

const ACCarritosPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [assets, setAssets] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showFormModal, setShowFormModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingCarrito, setEditingCarrito] = useState(null);
  const [carritoToDelete, setCarritoToDelete] = useState(null);
  const [selectedCarrito, setSelectedCarrito] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await adminCondominioService.getAssets();
      setAssets(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const carritosCondo = useMemo(() => {
    return (assets || [])
      .filter((a) => (a.tipo || "").toUpperCase() === "CARRITO" || !a.tipo)
      .map((c) => {
        const activeLoan = c.prestamoActivo || c.activeLoan || null;
        let currentUser = null;
        let fine = 0;
        if (activeLoan) {
          currentUser = {
            nombre: activeLoan.usuario?.nombres
              ? `${activeLoan.usuario.nombres} ${activeLoan.usuario.apellidos || ""}`.trim()
              : activeLoan.solicitante || activeLoan.usuario?.nombre || "Desconocido",
            aptoNumero: activeLoan.apartamento?.numero || activeLoan.numeroApartamento || "-",
            fechaEntrada: activeLoan.fechaSalida || activeLoan.fecha_entrada || activeLoan.fechaEntrada,
            solicitante: activeLoan.solicitante || "Propietario",
            fine: activeLoan.multa || 0,
          };
          fine = activeLoan.multa || 0;
        }
        return {
          id: c.id,
          codigo: c.codigo || c.numero || c.nombre,
          estado: c.estado || "Disponible",
          currentUser,
          activeLoan,
          fine,
        };
      });
  }, [assets]);

  const stats = useMemo(() => ({
    total: carritosCondo.length,
    disponibles: carritosCondo.filter((c) => c.estado === "Disponible").length,
    enUso: carritosCondo.filter((c) => c.estado === "En uso").length,
    mantenimiento: carritosCondo.filter((c) => c.estado === "Mantenimiento").length,
  }), [carritosCondo]);

  const filteredCarritos = useMemo(() => {
    return carritosCondo.filter((c) => {
      const matchesSearch = c.codigo?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || c.estado === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [carritosCondo, searchTerm, statusFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData, itemsPerPage } = usePagination(filteredCarritos);

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
    setEditingCarrito(null);
    reset({ codigo: "", estado: "Disponible" });
    setShowFormModal(true);
  };

  const handleOpenEdit = (carrito) => {
    setEditingCarrito(carrito);
    reset({ codigo: carrito.codigo, estado: carrito.estado });
    setShowFormModal(true);
  };

  const handleOpenDetails = (carrito) => {
    setSelectedCarrito(carrito);
    setShowDetailsModal(true);
  };

  const handleOpenDelete = (carrito) => {
    if (carrito.estado === "En uso") return;
    setCarritoToDelete(carrito);
    setShowDeleteModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingCarrito) {
        await adminCondominioService.updateAssetStatus(editingCarrito.id, {
          codigo: data.codigo,
          estado: data.estado,
        });
      } else {
        await adminCondominioService.createAsset({
          tipo: "CARRITO",
          codigo: data.codigo,
          estado: data.estado,
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
      await adminCondominioService.deleteAsset(carritoToDelete.id);
      setShowDeleteModal(false);
      setCarritoToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al eliminar.");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Disponible":
        return <span className="badge badge-success">Disponible</span>;
      case "En uso":
        return <span className="badge badge-info">En uso</span>;
      case "Mantenimiento":
        return <span className="badge badge-warning">Mantenimiento</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={ShoppingCart}
          title="Gesti\u00f3n de Carritos de Carga"
          badgeText="Condominio"
          welcomeText="Administra la flota de carritos disponibles para los residentes y monitorea su estado operativo."
        >
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <PlusCircle size={16} /><span>Nuevo Carrito</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={ShoppingCart} label="Total Carritos" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Disponibles" value={stats.disponibles} colorClass="primary-theme" />
          <StatCard icon={Info} label="En Uso" value={stats.enUso} colorClass="primary-theme" />
          <StatCard icon={Wrench} label="En Mantenimiento" value={stats.mantenimiento} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "C\u00f3digo de Carrito", "Estado Actual", "Usuario Actual", "Multa (S/)", "Acciones"]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No se encontraron carritos registrados."
          emptyIcon={ShoppingCart}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar por c\u00f3digo (Ej: C001)..."
              filterValue={statusFilter}
              onFilterChange={setStatusFilter}
              filterOptions={[
                { value: "all", label: "Todos los Estados" },
                { value: "Disponible", label: "Disponible" },
                { value: "En uso", label: "En uso" },
                { value: "Mantenimiento", label: "Mantenimiento" },
              ]}
              colSize={{ search: 5, filter: 3 }}
            />
          }
          paginationProps={{
            currentPage, totalPages, onPageChange: setCurrentPage,
            totalItems: filteredCarritos.length, itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((carrito, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={carrito.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3">
                  <div className="flex items-center gap-3">
                    <div className="cell-icon primary"><ShoppingCart size={14} /></div>
                    <div>
                      <div className="fw-bold">{carrito.codigo}</div>
                      <div className="text-xs text-muted">ID: {carrito.id}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">{getStatusBadge(carrito.estado)}</td>
                <td className="py-3">
                  {carrito.currentUser ? (
                    <div>
                      <div className="text-sm fw-bold">{carrito.currentUser.nombre}</div>
                      <div className="text-xs text-muted">Apto {carrito.currentUser.aptoNumero}</div>
                    </div>
                  ) : (
                    <span className="text-muted text-sm">\u2014</span>
                  )}
                </td>
                <td className="py-3">
                  {carrito.fine > 0 ? (
                    <span className="badge badge-danger">S/. {carrito.fine.toFixed(2)}</span>
                  ) : (
                    <span className="text-muted text-sm">S/ 0.00</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenDetails(carrito)} disabled={!carrito.currentUser}>
                      <Eye size={14} /> <span>Detalles</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenEdit(carrito)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenDelete(carrito)} disabled={carrito.estado === "En uso"}>
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
              <div className="modal-title">{editingCarrito ? "Editar Carrito" : "Nuevo Carrito"}</div>
              <button className="modal-close" onClick={() => setShowFormModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="grid-2 gap-3">
                  <FormInput label="C\u00f3digo del Carrito" name="codigo" register={register} validation={{ required: "Requerido" }} error={errors.codigo} placeholder="Ej: C-101" />
                  <div className="form-group">
                    <label className="form-label fw-semibold text-sm text-secondary">Estado Inicial</label>
                    <select className="form-select" {...register("estado", { required: "Requerido" })}>
                      <option value="Disponible">Disponible</option>
                      <option value="En uso">En uso</option>
                      <option value="Mantenimiento">Mantenimiento</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowFormModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editingCarrito ? "Guardar Cambios" : "Crear Carrito"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title="Confirmar Eliminaci\u00f3n"
        message={"\u00bfEst\u00e1s seguro de que deseas eliminar el carrito " + (carritoToDelete?.codigo || "") + "?"}
      />

      {showDetailsModal && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title flex items-center gap-2">
                <Info size={16} /> Detalle de Uso
              </div>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="cell-icon primary"><ShoppingCart size={24} /></div>
                <div>
                  <div className="fw-bold">Carrito {selectedCarrito?.codigo}</div>
                  <div className="text-sm text-muted">ID Sistema: {selectedCarrito?.id}</div>
                </div>
              </div>
              {selectedCarrito?.currentUser ? (
                <div className="flex flex-col gap-4">
                  <section>
                    <h6 className="fw-bold text-secondary mb-3 text-sm">Usuario en Posesión</h6>
                    <div className="flex items-center gap-3 p-3">
                      <div className="cell-icon primary"><User size={14} /></div>
                      <div style={{ flex: 1 }}>
                        <div className="fw-bold">{selectedCarrito.currentUser.nombre}</div>
                        <div className="text-sm text-muted">
                          {selectedCarrito.currentUser.solicitante} \u2022 Apto {selectedCarrito.currentUser.aptoNumero}
                        </div>
                      </div>
                    </div>
                  </section>
                  <section>
                    <h6 className="fw-bold text-secondary mb-3 text-sm">Detalles del Préstamo</h6>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm text-muted flex items-center gap-2">
                          <Clock size={12} className="text-accent" /> Fecha de Salida
                        </div>
                        <div className="text-sm fw-bold">
                          {selectedCarrito.currentUser.fechaEntrada ? formatDateTime(selectedCarrito.currentUser.fechaEntrada) : "-"}
                        </div>
                      </div>
                      {selectedCarrito.fine > 0 && (
                        <div className="flex items-center justify-between mb-2 text-danger">
                          <div className="text-sm flex items-center gap-2">
                            <AlertTriangle size={12} /> Multa Acumulada
                          </div>
                          <div className="text-sm fw-bold">S/ {selectedCarrito.fine.toFixed(2)}</div>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-2">
                        <div className="text-sm text-muted">Estado del Préstamo</div>
                        <span className="badge badge-info">Activo</span>
                      </div>
                    </div>
                  </section>
                </div>
              ) : (
                <div className="text-center py-4">
                  <CheckCircle className="text-success mb-2" size={32} />
                  <div className="fw-bold">Carrito Disponible</div>
                  <p className="text-muted text-sm">Este carrito no se encuentra en uso actualmente.</p>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-full" onClick={() => setShowDetailsModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default ACCarritosPage;
