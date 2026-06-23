import { useState, useEffect, useMemo } from "react";

import {
  Home,
  Users,
  Plus,
  Edit3,
  Trash2,
  Info,
  UserCheck,
  CreditCard,
  Building2,
  Layers,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { propietarioService } from "../../services/propietarioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";
import FormInput from "../../components/form/FormInput";
import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";

const PRMiApartamentoPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aptoData, setAptoData] = useState(null);
  const [tenants, setTenants] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
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
      const [apto, tenantsList] = await Promise.all([
        propietarioService.getApartmentDetails(),
        propietarioService.getTenants().catch(() => []),
      ]);
      setAptoData(apto);
      setTenants(Array.isArray(tenantsList) ? tenantsList : []);
    } catch (err) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const miApto = aptoData?.apartamento || aptoData;
  const miTorre = aptoData?.torre;
  const miPiso = aptoData?.piso;
  const miCondo = aptoData?.condominio;

  const misResidentes = useMemo(() => tenants || [], [tenants]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedResidentes, itemsPerPage } = usePagination(misResidentes);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  if (!miApto) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center">
          <div className="card card-custom p-5 text-center">
            <Home size={60} className="text-muted mb-3" />
            <h3 className="fw-bold">Sin Unidad Asignada</h3>
            <p className="text-muted">No se encontró una unidad vinculada a tu cuenta. Contacta con administración.</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const handleOpenModal = (resident = null) => {
    setEditingResident(resident);
    reset(resident
      ? { nombres: resident.nombres || resident.nombre?.split(" ")[0] || "", apellidos: resident.apellidos || resident.nombre?.split(" ").slice(1).join(" ") || "", tipoDocumento: resident.tipoDocumento || "DNI", numeroDocumento: resident.numeroDocumento || resident.dni || "" }
      : { nombres: "", apellidos: "", tipoDocumento: "DNI", numeroDocumento: "" });
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingResident) {
        setTenants((prev) => prev.map((r) => (r.id === editingResident.id ? { ...r, nombres: data.nombres, apellidos: data.apellidos, numeroDocumento: data.numeroDocumento } : r)));
      } else {
        await propietarioService.createTenant({
          nombres: data.nombres,
          apellidos: data.apellidos,
          tipoDocumento: data.tipoDocumento,
          numeroDocumento: data.numeroDocumento,
        });
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al guardar.");
    }
  };

  const handleDelete = (resident) => {
    setResidentToDelete(resident);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!residentToDelete) return;
    try {
      await propietarioService.deleteTenant(residentToDelete.id);
      setShowDeleteModal(false);
      setResidentToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al eliminar.");
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Home}
          title="Detalles de mi Unidad"
          badgeText={`Unidad ${miApto.numero}`}
          welcomeText={`Informaci\u00f3n general y gesti\u00f3n de residentes para tu unidad en ${miCondo?.nombre || ""}.`}
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <div className="card card-custom" style={{ gridColumn: "span 2" }}>
            <div className="card-body">
              <h5 className="fw-bold mb-3">Información de la Propiedad</h5>
              <div className="grid grid-2 gap-3">
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary"><Building2 size={18} /></div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Torre / Bloque</div>
                    <div className="fw-bold">{miTorre?.nombre || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary"><Layers size={18} /></div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Nivel / Piso</div>
                    <div className="fw-bold">Piso {miPiso?.numero || miPiso?.numero_piso || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary"><Home size={18} /></div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Número de Unidad</div>
                    <div className="fw-bold">{miApto.numero}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary"><Info size={18} /></div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Superficie</div>
                    <div className="fw-bold">{miApto.metraje} m²</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <StatCard icon={Users} label="Residentes Registrados" value={misResidentes.length} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Residente", "Identificaci\u00f3n", "Rol", "Acciones"]}
          isEmpty={misResidentes.length === 0}
          emptyMessage="No hay residentes registrados. Haz clic en 'A\u00f1adir Residente' para empezar."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center justify-between">
              <div>
                <h5 className="fw-bold mb-1">Residentes Autorizados</h5>
                <p className="text-muted text-sm mb-0">Gestiona las personas que viven en tu unidad.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
                <Plus size={14} /> Residente
              </button>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: misResidentes.length, itemsShowing: paginatedResidentes.length }}
        >
          {paginatedResidentes.map((resident, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={resident.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="cell-icon primary"><UserCheck size={14} /></div>
                    <div className="fw-bold">{resident.nombres || resident.nombre} {resident.apellidos || ""}</div>
                  </div>
                </td>
                <td>
                  <div className="text-sm text-muted"><CreditCard size={14} /> {resident.numeroDocumento || resident.dni}</div>
                </td>
                <td><span className="badge badge-info">Residente</span></td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(resident)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDelete(resident)}>
                      <Trash2 size={14} /> <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{editingResident ? "Editar Residente" : "A\u00f1adir Residente"}</div>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="grid-2 gap-3">
                  <FormInput label="Nombres" name="nombres" register={register} validation={{ required: "Requerido" }} error={errors.nombres} placeholder="Nombres" />
                  <FormInput label="Apellidos" name="apellidos" register={register} validation={{ required: "Requerido" }} error={errors.apellidos} placeholder="Apellidos" />
                </div>
                <div className="grid-2 gap-3">
                  <div className="form-group">
                    <label className="form-label">Tipo Doc.</label>
                    <select className="form-select" {...register("tipoDocumento")}>
                      <option value="DNI">DNI</option>
                      <option value="CE">Carné Extranjería</option>
                      <option value="Pasaporte">Pasaporte</option>
                    </select>
                  </div>
                  <FormInput label="N\u00famero Documento" name="numeroDocumento" register={register} validation={{ required: "Requerido" }} error={errors.numeroDocumento} placeholder="N\u00famero de documento" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Save size={14} /> Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        title={`\u00bfEliminar a ${residentToDelete?.nombre}?`}
        message="Esta acci\u00f3n es irreversible. El residente perder\u00e1 el acceso a los servicios del condominio vinculados a tu unidad."
        confirmText="Confirmar Eliminaci\u00f3n"
      />
    </AnimatedPage>
  );
};

export default PRMiApartamentoPage;
