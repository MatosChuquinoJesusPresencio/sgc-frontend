import { useState, useEffect, useCallback } from "react";
import {
  Building2,
  Edit3,
  PlusCircle,
  Globe,
  MapPin,
  Users,
  UserPlus,
  Calendar,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";
import { catalogService } from "../../services/catalogService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import CondoFormModal from "../../components/modals/CondoFormModal";
import CondoRelationsModal from "../../components/modals/CondoRelationsModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";

const PAGE_SIZE = 10;

const SACondominiosPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [condominios, setCondominios] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [activeFilter, setActiveFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [condoToDelete, setCondoToDelete] = useState(null);
  const [relations, setRelations] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [availableAdmins, setAvailableAdmins] = useState([]);
  const [selectedAdminId, setSelectedAdminId] = useState("");

  const fetchCondominiums = useCallback(async () => {
    try {
      setLoading(true);
      const params = { search: searchTerm || undefined, page: currentPage - 1, size: PAGE_SIZE };
      if (activeFilter) params.active = activeFilter === "true";
      const res = await superAdminService.getCondominiums(params);
      setCondominios(res.items || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar condominios.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter, currentPage]);

  useEffect(() => {
    fetchCondominiums();
  }, [fetchCondominiums]);

  const openCreateModal = async () => {
    setEditingCondo(null);
    setCities([]);
    try {
      const countriesData = await catalogService.getCountries();
      setCountries(countriesData || []);
    } catch (e) {
      console.warn("Error loading countries", e);
    }
    setShowModal(true);
  };

  const openEditModal = async (condo) => {
    setEditingCondo(condo);
    setCities([]);
    try {
      const countriesData = await catalogService.getCountries();
      setCountries(countriesData || []);
      if (condo.idPais) {
        const citiesData = await catalogService.getCities(condo.idPais);
        setCities(citiesData || []);
      }
    } catch (e) {
      console.warn("Error loading form data", e);
    }
    setShowModal(true);
  };

  const handleCountryChange = useCallback(async (countryId) => {
    if (!countryId) { setCities([]); return; }
    setLoadingCities(true);
    try {
      const data = await catalogService.getCities(Number(countryId));
      setCities(data || []);
    } catch (e) {
      setCities([]);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const handleAssignAdmin = async (condo) => {
    setAssignTarget(condo);
    setSelectedAdminId("");
    try {
      const admins = await superAdminService.getUnassignedAdministrators();
      setAvailableAdmins(Array.isArray(admins) ? admins : []);
    } catch (err) {
      setError(err.message || "Error al cargar administradores disponibles.");
    }
    setShowAssignModal(true);
  };

  const confirmAssign = async () => {
    if (!selectedAdminId || !assignTarget) return;
    try {
      await superAdminService.assignCondominium(Number(selectedAdminId), { idCondominio: assignTarget.id });
      setShowAssignModal(false);
      setAssignTarget(null);
      fetchCondominiums();
    } catch (err) {
      setError(err.message || "Error al asignar administrador.");
    }
  };

  const handleDeleteClick = async (condo) => {
    setCondoToDelete(condo);
    setRelations([]);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await superAdminService.deleteCondominium(condoToDelete.id);
      setShowConfirmDelete(false);
      setCondoToDelete(null);
      fetchCondominiums();
    } catch (err) {
      setError(err.message || "Error al eliminar condominio.");
    }
  };

  const onSubmit = async (data) => {
    try {
      const body = {
        nombre: data.nombre,
        idPais: Number(data.idPais),
        idCiudad: Number(data.idCiudad),
        direccion: data.direccion,
      };

      if (editingCondo) {
        await superAdminService.updateCondominium(editingCondo.id, body);
      } else {
        await superAdminService.createCondominium(body);
      }

      setShowModal(false);
      setEditingCondo(null);
      fetchCondominiums();
    } catch (err) {
      setError(err.message || "Error al guardar condominio.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const currentItems = condominios;

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Gestión de Condominios"
          badgeText="Super Admin"
          welcomeText={`Bienvenido, ${authUser?.nombre || "Administrador"}. Aquí puedes gestionar todos los condominios del sistema.`}
        >
          <button className="btn btn-primary" onClick={openCreateModal}>
            <PlusCircle size={16} />
            <span>Nuevo Condominio</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <DataTable
          headers={["#", "Condominio", "Ubicación", "Administrador", "Registro", "Estado", "Acciones"]}
          isEmpty={!loading && currentItems.length === 0}
          emptyMessage={searchTerm ? `No se encontraron condominios que coincidan con "${searchTerm}"` : "No hay condominios registrados."}
          emptyIcon={Building2}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 6 }}>
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                  placeholder="Buscar por nombre, país o dirección..."
                />
              </div>
              <div style={{ flex: 3 }}>
                <select className="form-select" value={activeFilter} onChange={(e) => { setActiveFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems, itemsShowing: currentItems.length }}
        >
          {loading ? (
            <tr><td colSpan={7} className="text-center py-4"><Loader2 size={24} className="spinner" /></td></tr>
          ) : (
            currentItems.map((condo, index) => {
              const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr key={condo.id}>
                  <td className="px-4 py-3 text-center">
                    <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold mb-0">{condo.nombre}</div>
                    <div className="text-xs text-muted flex items-center gap-1"><Globe size={10} /> {condo.nombrePais}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm fw-medium">{condo.direccion}</div>
                    <div className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {condo.nombreCiudad}</div>
                  </td>
                  <td className="py-3">
                    {condo.nombreAdministrador ? (
                      <div className="text-sm fw-bold">{condo.nombreAdministrador}</div>
                    ) : (
                      <span className="badge badge-warning">Sin asignar</span>
                    )}
                  </td>
                  <td className="py-3">
                    <div className="text-sm flex items-center gap-2">
                      <Calendar size={12} />
                      {condo.fechaCreacion ? new Date(condo.fechaCreacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" }) : "-"}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {condo.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleAssignAdmin(condo)}>
                        <UserPlus size={14} /> <span>{condo.idAdministrador ? "Admin" : "Asignar"}</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => openEditModal(condo)}>
                        <Edit3 size={14} /> <span>Editar</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(condo)}>
                        <Trash2 size={14} /> <span>Borrar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>


      <CondoFormModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditingCondo(null); }}
        onSubmit={onSubmit}
        editingCondo={editingCondo}
        countries={countries}
        cities={cities}
        onCountryChange={handleCountryChange}
        loadingCities={loadingCities}
      />
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{assignTarget?.idAdministrador ? "Reasignar Administrador" : "Asignar Administrador"}</div>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p className="text-secondary text-sm mb-3">
                {assignTarget?.idAdministrador ? "Reasignar administrador a" : "Asignar administrador a"}{" "}
                <strong>{assignTarget?.nombre}</strong>
                {assignTarget?.nombreAdministrador && (
                  <span className="d-block text-xs text-muted mt-1">
                    Actual: {assignTarget.nombreAdministrador}
                  </span>
                )}
              </p>
              <div className="form-group">
                <label className="form-label">Administrador Disponible</label>
                <select className="form-select" value={selectedAdminId} onChange={(e) => setSelectedAdminId(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {availableAdmins.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombres} {a.apellidos} ({a.correo})
                    </option>
                  ))}
                </select>
                {availableAdmins.length === 0 && (
                  <div className="text-xs text-muted mt-1">No hay administradores disponibles.</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={confirmAssign} disabled={!selectedAdminId}>{assignTarget?.idAdministrador ? "Reasignar" : "Asignar"}</button>
            </div>
          </div>
        </div>
      )}
      <CondoRelationsModal show={showRelationsModal} onHide={() => { setShowRelationsModal(false); setCondoToDelete(null); setRelations([]); }} condoName={condoToDelete?.nombre} relations={relations} />
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => { setShowConfirmDelete(false); setCondoToDelete(null); }}
        onConfirm={confirmDelete}
        title="¿Estás seguro?"
        message={`Estás a punto de eliminar el condominio ${condoToDelete?.nombre}. Esta acción no se puede deshacer.`}
        confirmText="Sí, Eliminar"
        Icon={AlertTriangle}
      />
    </AnimatedPage>
  );
};

export default SACondominiosPage;
