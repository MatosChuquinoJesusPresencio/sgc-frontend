import { useState, useEffect, useMemo } from "react";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  CheckCircle,
  Home,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { adminCondominioService } from "../../services/adminCondominioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import UserFormModal from "../../components/modals/UserFormModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";
import RoleBadge from "../../components/ui/RoleBadge";

const PAGE_SIZE = 10;

const ACUsuariosPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usersData, setUsersData] = useState({ items: [], total: 0 });
  const [structure, setStructure] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage - 1,
        size: PAGE_SIZE,
        search: searchTerm || undefined,
        role: roleFilter !== "all" ? roleFilter : undefined,
      };
      const [usersRes, struct] = await Promise.all([
        adminCondominioService.getUsers(params),
        adminCondominioService.getStructure().catch(() => null),
      ]);
      setUsersData({
        items: usersRes.items || usersRes,
        total: usersRes.total || (Array.isArray(usersRes) ? usersRes.length : 0),
      });
      if (struct) setStructure(struct);
    } catch (err) {
      setError(err.message || "Error al cargar usuarios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, roleFilter]);

  const aptosMap = useMemo(() => {
    const map = {};
    if (structure?.torres) {
      structure.torres.forEach((t) => {
        (t.pisos || []).forEach((p) => {
          (p.apartamentos || []).forEach((a) => {
            if (a.idPropietario) {
              if (!map[a.idPropietario]) map[a.idPropietario] = [];
              map[a.idPropietario].push(a.numero);
            }
          });
        });
      });
    }
    return map;
  }, [structure]);

  const residentes = useMemo(() => usersData.items || [], [usersData]);

  const stats = useMemo(() => ({
    total: usersData.total,
    propietarios: residentes.filter((u) => u.rol === "PROPIETARIO").length,
    seguridad: residentes.filter((u) => u.rol === "AGENTE_SEGURIDAD").length,
    activos: residentes.filter((u) => u.activo !== false).length,
  }), [residentes, usersData.total]);

  const totalPages = Math.ceil(usersData.total / PAGE_SIZE) || 1;

  if (loading && residentes.length === 0) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const handleShowModal = (user = null) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const onSubmit = async (data) => {
    try {
      if (editingUser) {
        await adminCondominioService.updateUser(editingUser.id, data);
      } else {
        await adminCondominioService.createUser(data);
      }
      handleCloseModal();
      fetchUsers();
    } catch (err) {
      setError(err.message || "Error al guardar usuario.");
    }
  };

  const handleDeleteClick = (user) => {
    if (aptosMap[user.id]?.length) {
      return alert(
        "No puedes eliminar a este propietario porque tiene apartamentos asignados. Desvincúlalo de la infraestructura primero.",
      );
    }
    setUserToDelete(user);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await adminCondominioService.deleteUser(userToDelete.id);
      setShowConfirmDelete(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || "Error al eliminar usuario.");
    }
  };

  const getAptosString = (userId) => {
    const aptos = aptosMap[userId];
    if (!aptos?.length) return "Sin asignar";
    return aptos.join(", ");
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Users}
          title="Gesti\u00f3n de Usuarios"
          badgeText={structure?.condominioNombre || "Condominio"}
          welcomeText="Administra a los propietarios, residentes y personal de seguridad de tu condominio."
        >
          <button className="btn btn-primary btn-sm" onClick={() => handleShowModal()}>
            <UserPlus size={14} />
            <span>Nuevo Usuario</span>
          </button>
        </DashboardHeader>

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Users} label="Total Usuarios" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={Home} label="Propietarios" value={stats.propietarios} colorClass="primary-theme" />
          <StatCard icon={Shield} label="Seguridad" value={stats.seguridad} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Activos" value={stats.activos} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Residente", "Rol", "Apartamentos", "Estado", "Acciones"]}
          isEmpty={residentes.length === 0}
          emptyMessage="No se encontraron residentes en este condominio."
          emptyIcon={Users}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar residente por nombre o email..."
              filterValue={roleFilter}
              onFilterChange={(val) => { setRoleFilter(val); setCurrentPage(1); }}
              filterOptions={[
                { value: "all", label: "Todos los Roles" },
                { value: "PROPIETARIO", label: "Propietario" },
                { value: "AGENTE_SEGURIDAD", label: "Seguridad" },
                { value: "ADMINISTRADOR_CONDOMINIO", label: "Administrador" },
              ]}
              colSize={{ search: 9, filter: 3 }}
            />
          }
          paginationProps={{
            currentPage, totalPages, onPageChange: setCurrentPage,
            totalItems: usersData.total, itemsShowing: residentes.length,
          }}
        >
          {residentes.map((user, index) => {
            const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
            return (
              <tr key={user.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="fw-bold">{user.nombres || user.nombre} {user.apellidos || ""}</div>
                      <div className="text-xs text-muted">{user.correo || user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <RoleBadge role={user.rol} roleId={user.id_rol} />
                </td>
                <td>
                  <div className="text-sm text-muted">{getAptosString(user.id)}</div>
                </td>
                <td className="text-center">
                  {user.activo !== false ? (
                    <span className="badge badge-success">Activo</span>
                  ) : (
                    <span className="badge badge-neutral">Inactivo</span>
                  )}
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleShowModal(user)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(user)}>
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
        condominio={{ nombre: structure?.condominioNombre || "" }}
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
        message={"\u00bfEst\u00e1s seguro de eliminar a " + (userToDelete?.nombres || userToDelete?.nombre || "") + "?"}
      />
    </AnimatedPage>
  );
};

export default ACUsuariosPage;
