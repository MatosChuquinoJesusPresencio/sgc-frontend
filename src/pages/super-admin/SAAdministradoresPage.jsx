import { useState, useEffect, useCallback } from "react";
import { Users, UserPlus, Edit3, Trash2, Building2, Loader2, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import AdminFormModal from "../../components/modals/AdminFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import RoleBadge from "../../components/ui/RoleBadge";

const ROLE_LABELS = {
  SUPER_ADMINISTRADOR: "Super Admin",
  ADMINISTRADOR_CONDOMINIO: "Admin Condominio",
};

const PAGE_SIZE = 10;

const SAAdministradoresPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [admins, setAdmins] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);

  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [unassignedCondos, setUnassignedCondos] = useState([]);
  const [selectedCondoId, setSelectedCondoId] = useState("");

  const fetchAdmins = useCallback(async () => {
    try {
      setLoading(true);
      const params = { page: currentPage - 1, size: PAGE_SIZE };
      if (searchTerm) params.search = searchTerm;
      if (activeFilter) params.active = activeFilter === "true";
      const res = await superAdminService.getAdministrators(params);
      setAdmins(res.items || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar administradores.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, activeFilter, currentPage]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setShowModal(true);
  };

  const handleDeleteClick = (admin) => {
    setAdminToDelete(admin);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await superAdminService.deleteAdministrator(adminToDelete.id);
      setShowConfirmDelete(false);
      setAdminToDelete(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Error al eliminar administrador.");
    }
  };

  const handleAssignCondo = async (admin) => {
    setAssignTarget(admin);
    setSelectedCondoId(admin.idCondominio?.toString() || "");
    try {
      const condos = await superAdminService.getUnassignedCondominiums();
      const list = Array.isArray(condos) ? [...condos] : [];
      if (admin.idCondominio && !list.some(c => c.id === admin.idCondominio)) {
        list.unshift({ id: admin.idCondominio, nombre: admin.nombreCondominio });
      }
      setUnassignedCondos(list);
    } catch (err) {
      setError(err.message || "Error al cargar condominios disponibles.");
    }
    setShowAssignModal(true);
  };

  const confirmAssign = async () => {
    if (!selectedCondoId || !assignTarget) return;
    try {
      await superAdminService.assignCondominium(assignTarget.id, { idCondominio: parseInt(selectedCondoId) });
      setShowAssignModal(false);
      setAssignTarget(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Error al asignar condominio.");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingAdmin) {
        await superAdminService.updateAdministrator(editingAdmin.id, {
          nombres: data.nombres,
          apellidos: data.apellidos,
          telefono: data.telefono || "",
        });
        if (data.activo !== editingAdmin.activo) {
          await superAdminService.toggleAdministratorStatus(editingAdmin.id, { activo: data.activo });
        }
      } else {
        await superAdminService.createAdministrator({
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          telefono: data.telefono || "",
          contrasena: data.contrasena,
        });
      }
      setShowModal(false);
      setEditingAdmin(null);
      fetchAdmins();
    } catch (err) {
      setError(err.message || "Error al guardar administrador.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={Users} title="Administradores" badgeText="Super Admin" welcomeText="Gestiona los administradores de condominio y sus asignaciones.">
          <button className="btn btn-primary" onClick={() => { setEditingAdmin(null); setShowModal(true); }}>
            <UserPlus size={16} /> <span>Nuevo Administrador</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <DataTable
          headers={["#", "Administrador", "Rol", "Condominio", "Estado", "Acciones"]}
          isEmpty={!loading && admins.length === 0}
          emptyMessage="No se encontraron administradores."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 6 }}>
                <SearchBar searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Buscar por nombre o correo..." />
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
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems, itemsShowing: admins.length }}
        >
          {loading ? (
            <tr><td colSpan={6} className="text-center py-4"><Loader2 size={24} className="spinner" /></td></tr>
          ) : (
            admins.map((admin, index) => {
              const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr key={admin.id}>
                  <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                  <td className="py-3">
                    <div className="fw-bold">{admin.nombres} {admin.apellidos}</div>
                    <div className="text-xs text-muted">{admin.correo}</div>
                  </td>
                  <td className="py-3"><RoleBadge role={admin.rol} labels={ROLE_LABELS} /></td>
                  <td className="py-3">
                    <div className="text-sm fw-medium text-secondary">
                      {admin.nombreCondominio || <span className="text-muted">No asignado</span>}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {admin.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleAssignCondo(admin)} disabled={admin.rol !== "ADMINISTRADOR_CONDOMINIO"}>
                        <Building2 size={14} /> <span>{admin.idCondominio ? "Condominio" : "Asignar"}</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(admin)}>
                        <Edit3 size={14} /> <span>Editar</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(admin)}>
                        <Trash2 size={14} /> <span>Eliminar</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>

      <AdminFormModal show={showModal} onHide={() => { setShowModal(false); setEditingAdmin(null); }} onSubmit={onSubmit} editingAdmin={editingAdmin} authUser={authUser} />

      <ConfirmDialog show={showConfirmDelete} onHide={() => { setShowConfirmDelete(false); setAdminToDelete(null); }} onConfirm={confirmDelete} title="Eliminar administrador" message={`Esta acci\u00f3n eliminar\u00e1 a ${adminToDelete?.nombres} ${adminToDelete?.apellidos} permanentemente.`} />

      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">{assignTarget?.idCondominio ? "Reasignar Condominio" : "Asignar Condominio"}</div>
              <button className="modal-close" onClick={() => setShowAssignModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <p className="text-secondary text-sm mb-3">
                {assignTarget?.idCondominio
                  ? `Reasignar condominio a`
                  : `Asignar condominio a`}{" "}
                <strong>{assignTarget?.nombres} {assignTarget?.apellidos}</strong>
                {assignTarget?.nombreCondominio && (
                  <span className="d-block text-xs text-muted mt-1">
                    Actual: {assignTarget.nombreCondominio}
                  </span>
                )}
              </p>
              <div className="form-group">
                <label className="form-label">Condominio Disponible</label>
                <select className="form-select" value={selectedCondoId} onChange={(e) => setSelectedCondoId(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {unassignedCondos.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setShowAssignModal(false)}>Cancelar</button>
              <button type="button" className="btn btn-primary" onClick={confirmAssign} disabled={!selectedCondoId}>{assignTarget?.idCondominio ? "Reasignar" : "Asignar"}</button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SAAdministradoresPage;
