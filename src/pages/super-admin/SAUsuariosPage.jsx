import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  ShieldCheck,
  Building2,
  CheckCircle,
  Loader2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { usePagination } from "../../hooks/usePagination";

import {
  getUsuarios,
  createUsuario,
  updateUsuario,
  deleteUsuario,
} from "../../services/usuarioService";
import { getCondominios } from "../../services/condominioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import UserFormModal from "../../components/modals/UserFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import RoleBadge from "../../components/ui/RoleBadge";

const ROL_ENUM_TO_LABEL = {
  SUPER_ADMINISTRADOR: "Super Administrador",
  ADMINISTRADOR_CONDOMINIO: "Administrador Condominio",
  PROPIETARIO: "Propietario",
  AGENTE_SEGURIDAD: "Agente de Seguridad",
};

const SAUsuariosPage = () => {
  const { authUser } = useAuth();
  const [searchParams] = useSearchParams();

  const [usuarios, setUsuarios] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "");
  const [roleFilter, setRoleFilter] = useState("all");
  const [condoFilter, setCondoFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [userRes, condoRes] = await Promise.all([
        getUsuarios({ tamanio: 999 }),
        getCondominios({ pagina: 0, tamanio: 999 }),
      ]);
      setUsuarios(userRes.contenido || []);
      setCondominios(condoRes.contenido || []);
    } catch {
      setError("Error al cargar los datos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => ({
    total: usuarios.length,
    admins: usuarios.filter((u) => u.rol === "ADMINISTRADOR_CONDOMINIO").length,
    propietarios: usuarios.filter((u) => u.rol === "PROPIETARIO").length,
    activos: usuarios.filter((u) => u.activo).length,
  }), [usuarios]);

  const filteredUsers = useMemo(() => {
    return usuarios.filter((user) => {
      const fullName = `${user.nombres} ${user.apellidos}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
        user.correo.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.rol === roleFilter;
      const matchesCondo = condoFilter === "all" ||
        (condoFilter === "none" ? user.condominioId === null : user.condominioId?.toString() === condoFilter);
      return matchesSearch && matchesRole && matchesCondo;
    });
  }, [usuarios, searchTerm, roleFilter, condoFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedUsers, itemsPerPage } = usePagination(filteredUsers);

  const onSubmit = async (data) => {
    try {
      setActionLoading(true);
      if (editingUser) {
        await updateUsuario(editingUser.id, {
          nombres: data.nombres,
          apellidos: data.apellidos,
          telefono: data.telefono || null,
          rol: data.rol,
          condominioId: data.id_condominio ? Number(data.id_condominio) : null,
        });
      } else {
        await createUsuario({
          nombres: data.nombres,
          apellidos: data.apellidos,
          correo: data.correo,
          telefono: data.telefono || null,
          rol: data.rol,
          condominioId: data.id_condominio ? Number(data.id_condominio) : null,
          contrasena: (() => {
            const raw = (data.nombres + data.apellidos).toLowerCase();
            const sinAcentos = raw.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const soloLetras = sinAcentos.replace(/[^a-z0-9]/g, "");
            return soloLetras + "123";
          })(),
        });
      }
      toast.success(editingUser ? "Usuario actualizado correctamente." : "Usuario creado correctamente.");
      setShowModal(false);
      setEditingUser(null);
      await loadData();
    } catch {
      toast.error("Error al guardar el usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deleteUsuario(userToDelete.id);
      toast.success("Usuario eliminado correctamente.");
      setUsuarios((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setShowConfirmDelete(false);
      setUserToDelete(null);
    } catch {
      toast.error("Error al eliminar el usuario.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={32} className="text-accent" style={{ animation: "spin 1s linear infinite" }} />
            <p className="text-muted">Cargando usuarios...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error && usuarios.length === 0) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <div className="flex flex-col items-center gap-3">
            <AlertTriangle size={32} className="text-danger" />
            <p className="text-danger">{error}</p>
            <button className="btn btn-primary" onClick={loadData}>Reintentar</button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const condoMap = {};
  condominios.forEach((c) => { condoMap[c.id] = c.nombre; });

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={Users} title="Gestión de Usuarios" badgeText="Administración" welcomeText="Gestiona todos los usuarios del sistema, sus roles y condominios asignados.">
          <button className="btn btn-primary" onClick={() => { setEditingUser(null); setShowModal(true); }}>
            <UserPlus size={16} /> <span>Nuevo Usuario</span>
          </button>
        </DashboardHeader>

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Users} label="Total Usuarios" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={ShieldCheck} label="Administradores" value={stats.admins} colorClass="primary-theme" />
          <StatCard icon={Building2} label="Propietarios" value={stats.propietarios} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Cuentas Activas" value={stats.activos} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Usuario", "Rol", "Condominio", "Estado", "Acciones"]}
          isEmpty={paginatedUsers.length === 0}
          emptyMessage="No se encontraron usuarios con los criterios de búsqueda."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 6 }}>
                <SearchBar searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Buscar por nombre o email..." />
              </div>
              <div style={{ flex: 3 }}>
                <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="all">Todos los Roles</option>
                  {Object.entries(ROL_ENUM_TO_LABEL).map(([enumVal, label]) => (
                    <option key={enumVal} value={enumVal}>{label}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 3 }}>
                <select className="form-select" value={condoFilter} onChange={(e) => { setCondoFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="all">Todos los Condominios</option>
                  <option value="none">Sin Condominio</option>
                  {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                </select>
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredUsers.length, itemsShowing: paginatedUsers.length }}
        >
          {paginatedUsers.map((user, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={user.id}>
                <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                <td className="py-3">
                  <div className="fw-bold">{user.nombres} {user.apellidos}</div>
                  <div className="text-xs text-muted">{user.correo}</div>
                </td>
                <td className="py-3"><RoleBadge rol={user.rol} /></td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">
                    {user.condominioId ? condoMap[user.condominioId] || "Desconocido" : "Ninguno"}
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
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(user)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setUserToDelete(user); setShowConfirmDelete(true); }} disabled={actionLoading}>
                      <Trash2 size={14} /> <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <UserFormModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditingUser(null); }}
        onSubmit={onSubmit}
        editingUser={editingUser}
        condominios={condominios}
        authUser={authUser}
        useApiFields
        actionLoading={actionLoading}
      />
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => { setShowConfirmDelete(false); setUserToDelete(null); }}
        onConfirm={confirmDelete}
        title="¿Eliminar usuario?"
        message={`Esta acción borrará al usuario ${userToDelete?.nombres} ${userToDelete?.apellidos} permanentemente.`}
        actionLoading={actionLoading}
      />
    </AnimatedPage>
  );
};

export default SAUsuariosPage;