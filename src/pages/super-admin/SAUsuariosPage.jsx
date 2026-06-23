import { useState, useEffect, useCallback } from "react";
import {
  Users,
  ShieldBan,
  KeyRound,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import RoleBadge from "../../components/ui/RoleBadge";
import { useForm } from "react-hook-form";

const ROLE_LABELS = {
  SUPER_ADMINISTRADOR: "Super Admin",
  ADMINISTRADOR_CONDOMINIO: "Admin Condominio",
  PROPIETARIO: "Propietario",
  AGENTE_SEGURIDAD: "Seguridad",
};

const PAGE_SIZE = 10;

const SAUsuariosPage = () => {
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [users, setUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

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

  const handleInvalidateSession = async (user) => {
    try {
      await superAdminService.invalidateSession(user.id);
      setSuccess(`Sesi\u00f3n invalidada para ${user.nombres} ${user.apellidos}.`);
    } catch (err) {
      setError(err.message || "Error al invalidar sesi\u00f3n.");
    }
  };

  const handleForcePassword = (user) => {
    setPasswordTarget(user);
    reset({ nuevaContrasena: "" });
    setShowPasswordModal(true);
  };

  const onSubmitForcePassword = async (data) => {
    try {
      await superAdminService.forcePasswordChange(passwordTarget.id, { nuevaContrasena: data.nuevaContrasena });
      setShowPasswordModal(false);
      setPasswordTarget(null);
      setSuccess(`Contrase\u00f1a actualizada forzosamente para ${passwordTarget.nombres} ${passwordTarget.apellidos}.`);
    } catch (err) {
      setError(err.message || "Error al forzar cambio de contrase\u00f1a.");
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={Users} title="Usuarios Globales" badgeText="Super Admin" welcomeText="Visualiza todos los usuarios del sistema. Puedes invalidar sesiones o forzar cambios de contrase\u00f1a." />

        {error && <div className="alert alert-danger mb-3">{error}</div>}
        {success && <div className="alert alert-success mb-3">{success}</div>}

        <DataTable
          headers={["#", "Usuario", "Rol", "Condominio", "Estado", "Acciones"]}
          isEmpty={!loading && users.length === 0}
          emptyMessage="No se encontraron usuarios."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 6 }}>
                <SearchBar searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Buscar por nombre o correo..." />
              </div>
              <div style={{ flex: 3 }}>
                <select className="form-select" value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setCurrentPage(1); }}>
                  <option value="">Todos los Roles</option>
                  <option value="SUPER_ADMINISTRADOR">Super Admin</option>
                  <option value="ADMINISTRADOR_CONDOMINIO">Admin Condominio</option>
                  <option value="PROPIETARIO">Propietario</option>
                  <option value="AGENTE_SEGURIDAD">Seguridad</option>
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
                      <button className="btn btn-outline btn-sm" onClick={() => handleInvalidateSession(user)} title="Invalidar sesi\u00f3n">
                        <ShieldBan size={14} /> <span>Invalidar</span>
                      </button>
                      <button className="btn btn-outline btn-sm" onClick={() => handleForcePassword(user)} title="Forzar cambio de contrase\u00f1a">
                        <KeyRound size={14} /> <span>Forzar Pass</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </DataTable>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <div className="modal-title">Forzar Cambio de Contraseña</div>
              <button className="modal-close" onClick={() => setShowPasswordModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={handleSubmit(onSubmitForcePassword)}>
              <div className="modal-body">
                <p className="text-secondary text-sm mb-3">
                  Nueva contraseña para <strong>{passwordTarget?.nombres} {passwordTarget?.apellidos}</strong>
                </p>
                <div className="form-group">
                  <label className="form-label">Nueva Contraseña</label>
                  <input
                    className={`form-input ${errors.nuevaContrasena ? "error" : ""}`}
                    type="password"
                    placeholder="M\u00ednimo 8 caracteres"
                    {...register("nuevaContrasena", { required: "Requerido", minLength: { value: 8, message: "M\u00ednimo 8 caracteres" } })}
                  />
                  {errors.nuevaContrasena && <div className="form-error">{errors.nuevaContrasena.message}</div>}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Actualizar Contraseña</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SAUsuariosPage;
