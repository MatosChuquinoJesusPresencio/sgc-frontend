import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  ShieldCheck,
  Building2,
  CheckCircle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";
import { usePagination } from "../../hooks/usePagination";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import UserFormModal from "../../components/modals/UserFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import RoleBadge from "../../components/ui/RoleBadge";

const SAUsuariosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();
  const [searchParams] = useSearchParams();

  const usuarios = getTable("usuarios");
  const condominios = getTable("condominios");

  const initialSearch = searchParams.get("search") || "";
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  useEffect(() => {
    const search = searchParams.get("search");
    if (search) setSearchTerm(search);
  }, [searchParams]);

  const [roleFilter, setRoleFilter] = useState("all");
  const [condoFilter, setCondoFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const stats = useMemo(() => ({
    total: usuarios.length,
    admins: usuarios.filter((u) => u.id_rol === 2).length,
    propietarios: usuarios.filter((u) => u.id_rol === 3).length,
    activos: usuarios.filter((u) => u.activo).length,
  }), [usuarios]);

  const filteredUsers = useMemo(() => {
    return usuarios.filter((user) => {
      const matchesSearch = user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "all" || user.id_rol.toString() === roleFilter;
      const matchesCondo = condoFilter === "all" ||
        (condoFilter === "none" ? user.id_condominio === null : user.id_condominio?.toString() === condoFilter);
      return matchesSearch && matchesRole && matchesCondo;
    });
  }, [usuarios, searchTerm, roleFilter, condoFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedUsers, itemsPerPage } = usePagination(filteredUsers);

  const onSubmit = (data) => {
    if (editingUser) {
      updateTable("usuarios", usuarios.map((u) =>
        u.id === editingUser.id
          ? { ...u, ...data, id_rol: parseInt(data.id_rol), id_condominio: data.id_condominio ? parseInt(data.id_condominio) : null }
          : u,
      ));
    } else {
      const newId = usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
      updateTable("usuarios", [...usuarios, { id: newId, ...data, id_rol: parseInt(data.id_rol), id_condominio: data.id_condominio ? parseInt(data.id_condominio) : null, contraseña: "123123" }]);
    }
    setShowModal(false);
    setEditingUser(null);
  };

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
                  <option value="1">Super Admin</option>
                  <option value="2">Admin Condo</option>
                  <option value="3">Propietario</option>
                  <option value="4">Seguridad</option>
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
                  <div className="fw-bold">{user.nombre}</div>
                  <div className="text-xs text-muted">{user.email}</div>
                </td>
                <td className="py-3"><RoleBadge roleId={user.id_rol} /></td>
                <td className="py-3">
                  <div className="text-sm fw-medium text-secondary">
                    {user.id_condominio ? condominios.find((c) => c.id === user.id_condominio)?.nombre : "Plataforma Global"}
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
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingUser(user); setShowModal(true); }}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setUserToDelete(user); setShowConfirmDelete(true); }}>
                      <Trash2 size={14} /> <span>Eliminar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <UserFormModal show={showModal} onHide={() => { setShowModal(false); setEditingUser(null); }} onSubmit={onSubmit} editingUser={editingUser} condominios={condominios} authUser={authUser} />
      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => { setShowConfirmDelete(false); setUserToDelete(null); }}
        onConfirm={() => { updateTable("usuarios", usuarios.filter((u) => u.id !== userToDelete.id)); setShowConfirmDelete(false); setUserToDelete(null); }}
        title="¿Eliminar usuario?"
        message={`Esta acción borrará al usuario ${userToDelete?.nombre} permanentemente.`}
      />
    </AnimatedPage>
  );
};

export default SAUsuariosPage;
