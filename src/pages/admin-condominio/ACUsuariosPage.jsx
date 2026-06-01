import { useState, useMemo } from "react";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  CheckCircle,
  Home,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import UserFormModal from "../../components/modals/UserFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";
import RoleBadge from "../../components/ui/RoleBadge";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const ACUsuariosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const usuarios = getTable("usuarios");
  const apartamentos = getTable("apartamentos");
  const condominio = getTable("condominios").find(
    (c) => c.id === authUser?.id_condominio,
  );

  const residentes = useMemo(() => {
    if (!authUser?.id_condominio) return [];
    return usuarios.filter((u) => u.id_condominio === authUser.id_condominio);
  }, [usuarios, authUser]);

  const stats = useMemo(
    () => ({
      total: residentes.length,
      propietarios: residentes.filter((u) => u.id_rol === 3).length,
      seguridad: residentes.filter((u) => u.id_rol === 4).length,
      activos: residentes.filter((u) => u.activo).length,
    }),
    [residentes],
  );

  const filteredResidentes = useMemo(() => {
    return residentes.filter((user) => {
      const matchesSearch =
        user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole =
        roleFilter === "all" || user.id_rol.toString() === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [residentes, searchTerm, roleFilter]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedResidentes,
    itemsPerPage,
  } = usePagination(filteredResidentes);

  if (!condominio) return <NoCondoWarning />;

  const handleShowModal = (user = null) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const onSubmit = (data) => {
    if (editingUser) {
      const updated = usuarios.map((u) =>
        u.id === editingUser.id
          ? {
              ...u,
              ...data,
              id_rol: parseInt(data.id_rol),
            }
          : u,
      );
      updateTable("usuarios", updated);
    } else {
      const newId =
        usuarios.length > 0 ? Math.max(...usuarios.map((u) => u.id)) + 1 : 1;
      const newUser = {
        id: newId,
        ...data,
        id_rol: parseInt(data.id_rol),
        id_condominio: authUser.id_condominio,
        contraseña: "123123",
        activo: true,
      };
      updateTable("usuarios", [...usuarios, newUser]);

      console.group("Simulación: Correo Enviado (Residente)");
      console.log(`Para: ${data.email}`);
      console.log(
        `Asunto: Acceso al Sistema de Gestión - ${condominio?.nombre}`,
      );
      console.log(
        `Mensaje: Hola ${data.nombre}, el administrador te ha registrado.`,
      );
      console.log(`Tus credenciales son:`);
      console.log(`- Email: ${data.email}`);
      console.log(`- Contraseña: 123123`);
      console.log("¡Cambie la contraseña en cuanto inicie sesión!");
      console.groupEnd();
    }
    handleCloseModal();
  };

  const handleDeleteClick = (user) => {
    const hasAptos = apartamentos.some((a) => a.id_usuario === user.id);
    if (hasAptos)
      return alert(
        "No puedes eliminar a este propietario porque tiene apartamentos asignados. Desvincúlalo de la infraestructura primero.",
      );

    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    const updated = usuarios.filter((u) => u.id !== userToDelete.id);
    updateTable("usuarios", updated);
    setShowConfirmDelete(false);
    setUserToDelete(null);
  };

  const getAptosString = (userId) => {
    const userAptos = apartamentos.filter((a) => a.id_usuario === userId);
    if (userAptos.length === 0) return "Sin asignar";
    return userAptos.map((a) => a.numero).join(", ");
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Users}
          title="Gestión de Usuarios"
          badgeText={condominio?.nombre || "Condominio"}
          welcomeText="Administra a los propietarios, residentes y personal de seguridad de tu condominio."
        >
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleShowModal()}
          >
            <UserPlus size={14} />
            <span>Nuevo Usuario</span>
          </button>
        </DashboardHeader>

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard
            icon={Users}
            label="Total Usuarios"
            value={stats.total}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Home}
            label="Propietarios"
            value={stats.propietarios}
            colorClass="primary-theme"
          />
          <StatCard
            icon={Shield}
            label="Seguridad"
            value={stats.seguridad}
            colorClass="primary-theme"
          />
          <StatCard
            icon={CheckCircle}
            label="Activos"
            value={stats.activos}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={[
            "#",
            "Residente",
            "Rol",
            "Apartamentos",
            "Estado",
            "Acciones",
          ]}
          isEmpty={paginatedResidentes.length === 0}
          emptyMessage="No se encontraron residentes en este condominio."
          emptyIcon={Users}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={(val) => {
                setSearchTerm(val);
                setCurrentPage(1);
              }}
              placeholder="Buscar residente por nombre o email..."
              filterValue={roleFilter}
              onFilterChange={(val) => {
                setRoleFilter(val);
                setCurrentPage(1);
              }}
              filterOptions={[
                { value: "all", label: "Todos los Roles" },
                { value: "3", label: "Propietario" },
                { value: "4", label: "Seguridad" },
                { value: "2", label: "Administrador" },
              ]}
              colSize={{ search: 9, filter: 3 }}
            />
          }
          paginationProps={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            totalItems: filteredResidentes.length,
            itemsShowing: paginatedResidentes.length,
          }}
        >
          {paginatedResidentes.map((user, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={user.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="fw-bold">{user.nombre}</div>
                      <div className="text-xs text-muted">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <RoleBadge roleId={user.id_rol} />
                </td>
                <td>
                  <div className="text-sm text-muted">
                    {getAptosString(user.id)}
                  </div>
                </td>
                <td className="text-center">
                  {user.activo ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-neutral">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleShowModal(user)}
                    >
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeleteClick(user)}
                    >
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
        scope="condo-admin"
        condominio={condominio}
        show={showModal}
        onHide={handleCloseModal}
        onSubmit={onSubmit}
        editingUser={editingUser}
        authUser={authUser}
      />

      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Residente"
        message={`¿Estás seguro de eliminar a ${userToDelete?.nombre}?`}
      />
    </AnimatedPage>
  );
};

export default ACUsuariosPage;
