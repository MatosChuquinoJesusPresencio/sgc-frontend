import { useState, useEffect, useCallback } from "react";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import UserFormModal from "../../components/modals/UserFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import RoleBadge from "../../components/ui/RoleBadge";

const ROLE_LABELS = {
  SUPER_ADMINISTRADOR: "Super Admin",
  ADMINISTRADOR_CONDOMINIO: "Admin Condominio",
  PROPIETARIO: "Propietario",
  AGENTE_SEGURIDAD: "Seguridad",
};

const ROLE_OPTIONS = [
  { value: "", label: "Todos los Roles" },
  { value: "SUPER_ADMINISTRADOR", label: "Super Admin" },
  { value: "ADMINISTRADOR_CONDOMINIO", label: "Admin Condominio" },
  { value: "PROPIETARIO", label: "Propietario" },
  { value: "AGENTE_SEGURIDAD", label: "Seguridad" },
];

const PAGE_SIZE = 10;

const SAUsuariosPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await superAdminService.getUsers({
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        page: currentPage - 1,
        size: PAGE_SIZE,
      });
      setUsers(res.items || []);
      setTotalItems(res.total || 0);
    } catch (err) {
      setError(err.message || "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  }, [searchTerm, roleFilter, currentPage]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const confirmDelete = async () => {
    try {
      await superAdminService.deleteAdministrator(userToDelete.id);
      setShowConfirmDelete(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Error al eliminar usuario.");
    }
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await superAdminService.updateAdministrator(editingUser.id, {
          nombres: data.nombres,
          apellidos: data.apellidos,
          telefono: data.telefono || "",
        });
        if (data.activo !== editingUser.activo) {
          await superAdminService.toggleAdministratorStatus(editingUser.id, { activo: data.activo });
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
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Error al guardar usuario.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={Users} title="Gesti\u00f3n de Usuarios" badgeText="Administraci\u00f3n" welcomeText="Gestiona todos los usuarios del sistema, sus roles y condominios asignados.">
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            <UserPlus size={16} /> <span>Nuevo Usuario</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <DataTable
          headers={["#", "Usuario", "Rol", "Condominio", "Estado", "Acciones"]}
          isEmpty={!loading && users.length === 0}
          emptyMessage="No se encontraron usuarios con los criterios de b\u00fasqueda."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 6 }}>
                <SearchBar searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Buscar por nombre o correo..." />
              </div>
              <div style={{ flex: 3 }}>
                <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems, itemsShowing: users.length }}
        >
          {loading ? (
            <tr><td colSpan={6} className="text-center py-4"><Loader2 size={24} className="spinner" /></td></tr>
          ) : (
            users.map((user, index) => {
              const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                  <td className="py-3">
                    <div className="fw-bold">{user.nombres} {user.apellidos}</div>
                    <div className="text-xs text-muted">{user.correo}</div>
                  </td>
                  <td className="py-3"><RoleBadge role={user.rol} labels={ROLE_LABELS} /></td>
                  <td className="py-3">
                    <div className="text-sm fw-medium text-secondary">
                      {user.nombreCondominio || "Plataforma Global"}
                    </div>
                  </td>
                  <td className="py-3 text-center">
                    {user.activo ? (
                      <span className="badge badge-success">Activo</span>
                    ) : (
                      <span className="badge badge-danger">Inactivo</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(user)}>
                        <Edit3 size={14} /> <span>Editar</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(user)}>
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

      <UserFormModal show={showModal} onHide={() => { setShowModal(false); setEditingUser(null); }} onSubmit={onSubmit} editingUser={editingUser} condominios={[]} authUser={authUser} />
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => { setShowConfirmDelete(false); setUserToDelete(null); }}
        onConfirm={confirmDelete}
        title="\u00bfEliminar usuario?"
        message={`Esta acci\u00f3n borrar\u00e1 al usuario ${userToDelete?.nombres} ${userToDelete?.apellidos} permanentemente.`}
      />
    </AnimatedPage>
  );
};

export default SAUsuariosPage;
