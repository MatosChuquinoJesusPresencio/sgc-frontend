import { useState, useEffect } from "react";
import {
  Building2,
  Eye,
  Edit3,
  PlusCircle,
  Globe,
  MapPin,
  Calendar,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { usePagination } from "../../hooks/usePagination";

import {
  getCondominios,
  createCondominio,
  updateCondominio,
  deleteCondominio,
  getCondominioRelations,
} from "../../services/condominioService";
import { getUsuarios, updateUsuario } from "../../services/usuarioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import AnimatedPage from "../../components/animations/AnimatedPage";
import CondoDetailModal from "../../components/modals/CondoDetailModal";
import CondoFormModal from "../../components/modals/CondoFormModal";
import CondoRelationsModal from "../../components/modals/CondoRelationsModal";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";

const SACondominiosPage = () => {
  const { authUser } = useAuth();

  const [condominios, setCondominios] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [selectedCondoAdmin, setSelectedCondoAdmin] = useState(null);
  const [selectedCondoStats, setSelectedCondoStats] = useState(null);
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [condoToDelete, setCondoToDelete] = useState(null);
  const [relations, setRelations] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [condoRes, userRes] = await Promise.all([
        getCondominios({ pagina: 0, tamanio: 999 }),
        getUsuarios({ tamanio: 999 }),
      ]);
      setCondominios(condoRes.contenido || []);
      setUsuarios(userRes.contenido || []);
    } catch (err) {
      setError("Error al cargar los datos. Intente nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const adminUsers = usuarios
    .filter((u) => u.rol === "ADMINISTRADOR_CONDOMINIO")
    .map((u) => ({
      id: u.id,
      nombre: `${u.nombres} ${u.apellidos}`,
      email: u.correo,
      id_condominio: u.condominioId,
    }));

  const filteredCondominios = condominios.filter(
    (condo) =>
      condo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { currentPage, setCurrentPage, totalPages, paginatedData: currentItems, itemsPerPage } = usePagination(filteredCondominios);

  const handleDetailClick = async (condo) => {
    setSelectedCondo(condo);
    const admin = usuarios.find((u) => u.condominioId === condo.id && u.rol === "ADMINISTRADOR_CONDOMINIO");
    setSelectedCondoAdmin(
      admin
        ? { nombre: `${admin.nombres} ${admin.apellidos}`, email: admin.correo }
        : null,
    );
    try {
      const rels = await getCondominioRelations(condo.id);
      setSelectedCondoStats({
        torres: rels.torres || 0,
        pisos: 0,
        apartamentos: 0,
        usuarios: rels.usuarios || 0,
        carritos: rels.carritos || 0,
        config: null,
      });
    } catch {
      setSelectedCondoStats({ torres: 0, pisos: 0, apartamentos: 0, usuarios: 0, carritos: 0, config: null });
    }
    setShowDetailModal(true);
  };

  const handleDeleteClick = async (condo) => {
    try {
      setActionLoading(true);
      const rels = await getCondominioRelations(condo.id);
      const foundRelations = [];
      if (rels.usuarios > 0) foundRelations.push(`${rels.usuarios} Usuario(s) registrados`);
      if (rels.torres > 0) foundRelations.push(`${rels.torres} Torre(s) / Bloque(s)`);
      if (rels.configuraciones > 0) foundRelations.push("Configuración del sistema activa");
      if (rels.carritos > 0) foundRelations.push(`${rels.carritos} Carrito(s) de carga`);

      setCondoToDelete(condo);
      setRelations(foundRelations);
      if (foundRelations.length > 0) {
        setShowRelationsModal(true);
      } else {
        setShowConfirmDelete(true);
      }
    } catch (err) {
      setError("Error al verificar relaciones del condominio.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      await deleteCondominio(condoToDelete.id);
      setCondominios((prev) => prev.filter((c) => c.id !== condoToDelete.id));
      setShowConfirmDelete(false);
      setCondoToDelete(null);
    } catch (err) {
      setError("Error al eliminar el condominio.");
    } finally {
      setActionLoading(false);
    }
  };

  const onSubmit = async (data) => {
    const { id_administrador, ...condoData } = data;

    try {
      setActionLoading(true);
      let savedCondo;
      if (editingCondo) {
        await updateCondominio(editingCondo.id, condoData);
        savedCondo = editingCondo;
      } else {
        savedCondo = await createCondominio(condoData);
      }

      if (id_administrador) {
        const condoId = savedCondo.id;
        const prevAdmin = usuarios.find(
          (u) => u.condominioId === condoId && u.rol === "ADMINISTRADOR_CONDOMINIO" && u.id !== Number(id_administrador),
        );
        if (prevAdmin) {
          await updateUsuario(prevAdmin.id, { condominioId: null });
        }
        await updateUsuario(Number(id_administrador), { condominioId: condoId });
      }

      setShowModal(false);
      setEditingCondo(null);
      await loadData();
    } catch (err) {
      setError(err?.message || "Error al guardar el condominio.");
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
            <p className="text-muted">Cargando condominios...</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error && condominios.length === 0) {
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

  const handleEditClick = (condo) => {
    const admin = usuarios.find((u) => u.condominioId === condo.id && u.rol === "ADMINISTRADOR_CONDOMINIO");
    setEditingCondo({ ...condo, id_administrador: admin?.id?.toString() || "" });
    setShowModal(true);
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Building2}
          title="Gestión de Condominios"
          badgeText="Super Admin"
          welcomeText={`Bienvenido, ${authUser?.nombre || "Administrador"}. Aquí puedes gestionar todos los condominios del sistema.`}
        >
          <button className="btn btn-primary" onClick={() => { setEditingCondo(null); setShowModal(true); }}>
            <PlusCircle size={16} />
            <span>Nuevo Condominio</span>
          </button>
        </DashboardHeader>

        <DataTable
          headers={["#", "Condominio", "Ubicación", "Administrador", "Registro", "Acciones"]}
          isEmpty={currentItems.length === 0}
          emptyMessage={searchTerm ? `No se encontraron condominios que coincidan con "${searchTerm}"` : "No hay condominios registrados."}
          emptyIcon={Building2}
          searchBar={
            <div className="flex items-center gap-3">
              <div style={{ flex: 8 }}>
                <SearchBar
                  searchTerm={searchTerm}
                  onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                  placeholder="Buscar por nombre, país o dirección..."
                />
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredCondominios.length, itemsShowing: currentItems.length }}
        >
          {currentItems.map((condo, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const admin = adminUsers.find((u) => u.id_condominio === condo.id);
            return (
              <tr key={condo.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3">
                  <div className="fw-bold mb-0">{condo.nombre}</div>
                  <div className="text-xs text-muted flex items-center gap-1"><Globe size={10} /> {condo.pais}</div>
                </td>
                <td className="py-3">
                  <div className="text-sm fw-medium">{condo.direccion}</div>
                  <div className="text-xs text-muted flex items-center gap-1"><MapPin size={10} /> {condo.ciudad}</div>
                </td>
                <td className="py-3">
                  {admin ? (
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="text-sm fw-bold">{admin.nombre}</div>
                        <div className="text-xs text-muted">{admin.email}</div>
                      </div>
                    </div>
                  ) : (
                    <span className="badge badge-warning">Sin asignar</span>
                  )}
                </td>
                <td className="py-3">
                  <div className="text-sm flex items-center gap-2">
                    <Calendar size={12} />
                    {new Date(condo.fechaCreacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleDetailClick(condo)}>
                      <Eye size={14} /> <span>Detalles</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleEditClick(condo)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(condo)} disabled={actionLoading}>
                      <Trash2 size={14} /> <span>Borrar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <CondoDetailModal
        show={showDetailModal}
        onHide={() => { setShowDetailModal(false); setSelectedCondo(null); setSelectedCondoAdmin(null); setSelectedCondoStats(null); }}
        condo={selectedCondo}
        admin={selectedCondoAdmin}
        stats={selectedCondoStats}
      />
      <CondoFormModal show={showModal} onHide={() => { setShowModal(false); setEditingCondo(null); }} onSubmit={onSubmit} editingCondo={editingCondo} adminUsers={adminUsers} />
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
