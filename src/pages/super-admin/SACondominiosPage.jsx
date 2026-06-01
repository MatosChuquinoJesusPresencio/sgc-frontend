import { useState } from "react";
import {
  Building2,
  Eye,
  Edit3,
  PlusCircle,
  Globe,
  MapPin,
  Users,
  Calendar,
  Trash2,
  AlertTriangle,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";
import { usePagination } from "../../hooks/usePagination";

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
  const { getTable, updateTable } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingCondo, setEditingCondo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedCondo, setSelectedCondo] = useState(null);
  const [showRelationsModal, setShowRelationsModal] = useState(false);
  const [condoToDelete, setCondoToDelete] = useState(null);
  const [relations, setRelations] = useState([]);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const condominios = getTable("condominios");
  const usuarios = getTable("usuarios");
  const adminUsers = usuarios.filter((u) => u.id_rol === 2);

  const filteredCondominios = condominios.filter(
    (condo) =>
      condo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.pais.toLowerCase().includes(searchTerm.toLowerCase()) ||
      condo.ciudad.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const { currentPage, setCurrentPage, totalPages, paginatedData: currentItems, itemsPerPage } = usePagination(filteredCondominios);

  const handleDetailClick = (condo) => {
    setSelectedCondo(condo);
    setShowDetailModal(true);
  };

  const handleDeleteClick = (condo) => {
    const foundRelations = [];
    const users = getTable("usuarios").filter((u) => u.id_condominio === condo.id);
    if (users.length > 0) foundRelations.push(`${users.length} Usuario(s) registrados`);
    const towers = getTable("torres").filter((t) => t.id_condominio === condo.id);
    if (towers.length > 0) foundRelations.push(`${towers.length} Torre(s) / Bloque(s)`);
    const configs = getTable("configuraciones").filter((c) => c.id_condominio === condo.id);
    if (configs.length > 0) foundRelations.push("Configuración del sistema activa");
    const carts = getTable("carritos_carga").filter((c) => c.id_condominio === condo.id);
    if (carts.length > 0) foundRelations.push(`${carts.length} Carrito(s) de carga`);

    setCondoToDelete(condo);
    setRelations(foundRelations);
    if (foundRelations.length > 0) {
      setShowRelationsModal(true);
    } else {
      setShowConfirmDelete(true);
    }
  };

  const confirmDelete = () => {
    updateTable("condominios", condominios.filter((c) => c.id !== condoToDelete.id));
    setShowConfirmDelete(false);
    setCondoToDelete(null);
  };

  const onSubmit = (data) => {
    const { id_administrador, ...condoData } = data;
    let condoId;

    if (editingCondo) {
      condoId = editingCondo.id;
      updateTable("condominios", condominios.map((c) =>
        c.id === editingCondo.id ? { ...c, ...condoData } : c,
      ));
    } else {
      condoId = condominios.length > 0 ? Math.max(...condominios.map((c) => c.id)) + 1 : 1;
      updateTable("condominios", [...condominios, { ...condoData, id: condoId, fecha_creacion: new Date().toISOString().split("T")[0] }]);
    }

    if (id_administrador) {
      updateTable("usuarios", usuarios.map((u) => {
        if (u.id_condominio === condoId && u.id_rol === 2 && u.id.toString() !== id_administrador) {
          return { ...u, id_condominio: null };
        }
        if (u.id.toString() === id_administrador) return { ...u, id_condominio: condoId };
        return u;
      }));
    }
    setShowModal(false);
    setEditingCondo(null);
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
                    {new Date(condo.fecha_creacion).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleDetailClick(condo)}>
                      <Eye size={14} /> <span>Detalles</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => { setEditingCondo(condo); setShowModal(true); }}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(condo)}>
                      <Trash2 size={14} /> <span>Borrar</span>
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      <CondoDetailModal show={showDetailModal} onHide={() => { setShowDetailModal(false); setSelectedCondo(null); }} condo={selectedCondo} />
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
