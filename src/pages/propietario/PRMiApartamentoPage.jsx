import { useState, useMemo } from "react";

import {
  Home,
  Users,
  Plus,
  Edit3,
  Trash2,
  Info,
  UserCheck,
  CreditCard,
  Building2,
  Layers,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import UserFormModal from "../../components/modals/UserFormModal";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";

const PRMiApartamentoPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingResident, setEditingResident] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  const apartamentos = getTable("apartamentos");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const condominios = getTable("condominios");
  const residentes = getTable("inquilinos_temporales");
  const vehiculos = getTable("vehiculos");

  const miApto = useMemo(
    () => apartamentos.find((a) => a.id_usuario === authUser?.id),
    [apartamentos, authUser],
  );
  const miPiso = useMemo(
    () => pisos.find((p) => p.id === miApto?.id_piso),
    [pisos, miApto],
  );
  const miTorre = useMemo(
    () => torres.find((t) => t.id === miPiso?.id_torre),
    [torres, miPiso],
  );
  const miCondo = useMemo(
    () => condominios.find((c) => c.id === miTorre?.id_condominio),
    [condominios, miTorre],
  );

  const misResidentes = useMemo(
    () => residentes.filter((r) => r.id_apartamento === miApto?.id),
    [residentes, miApto],
  );

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    paginatedData: paginatedResidentes,
    itemsPerPage,
  } = usePagination(misResidentes);

  const residentHasVehicles = useMemo(
    () =>
      residentToDelete &&
      vehiculos.some(
        (v) => v.id_inquilino_temporal === residentToDelete.id,
      ),
    [vehiculos, residentToDelete],
  );

  const handleOpenModal = (resident = null) => {
    setEditingResident(resident);
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (!miApto) return;

    if (editingResident) {
      const updated = residentes.map((r) =>
        r.id === editingResident.id ? { ...r, ...data } : r,
      );
      updateTable("inquilinos_temporales", updated);
    } else {
      const newId =
        residentes.length > 0
          ? Math.max(...residentes.map((r) => r.id)) + 1
          : 1;
      const newResident = {
        id: newId,
        id_apartamento: miApto.id,
        ...data,
      };
      updateTable("inquilinos_temporales", [...residentes, newResident]);
    }
    setShowModal(false);
  };

  const handleDelete = (resident) => {
    setResidentToDelete(resident);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (!residentToDelete) return;
    const filtered = residentes.filter((r) => r.id !== residentToDelete.id);
    updateTable("inquilinos_temporales", filtered);
    setShowDeleteModal(false);
    setResidentToDelete(null);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setResidentToDelete(null);
  };

  if (!miApto) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center">
          <div className="card card-custom p-5 text-center">
            <Home size={60} className="text-muted mb-3" />
            <h3 className="fw-bold">Sin Unidad Asignada</h3>
            <p className="text-muted">
              No se encontró una unidad vinculada a tu cuenta. Contacta con
              administración.
            </p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Home}
          title="Detalles de mi Unidad"
          badgeText={`Unidad ${miApto.numero}`}
          welcomeText={`Información general y gestión de residentes para tu unidad en ${miCondo?.nombre}.`}
        />

        <div className="grid grid-4 gap-4 mb-5">
          <div className="card card-custom" style={{ gridColumn: "span 2" }}>
            <div className="card-body">
              <h5 className="fw-bold mb-3">
                Información de la Propiedad
              </h5>
              <div className="grid grid-2 gap-3">
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Torre / Bloque</div>
                    <div className="fw-bold">{miTorre?.nombre || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Nivel / Piso</div>
                    <div className="fw-bold">Piso {miPiso?.numero_piso || "N/A"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary">
                    <Home size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Número de Unidad</div>
                    <div className="fw-bold">{miApto.numero}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3">
                  <div className="cell-icon primary">
                    <Info size={18} />
                  </div>
                  <div>
                    <div className="text-xs text-muted fw-bold">Superficie</div>
                    <div className="fw-bold">{miApto.metraje} m²</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <StatCard
            icon={Users}
            label="Residentes Registrados"
            value={misResidentes.length}
            colorClass="primary-theme"
          />
        </div>

        <DataTable
          headers={["#", "Residente", "Identificación", "Rol", "Acciones"]}
          isEmpty={misResidentes.length === 0}
          emptyMessage="No hay residentes registrados. Haz clic en 'Añadir Residente' para empezar."
          emptyIcon={Users}
          searchBar={
            <div className="flex items-center justify-between">
              <div>
                <h5 className="fw-bold mb-1">
                  Residentes Autorizados
                </h5>
                <p className="text-muted text-sm mb-0">
                  Gestiona las personas que viven en tu unidad.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenModal()}
              >
                <Plus size={14} /> Residente
              </button>
            </div>
          }
          paginationProps={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            totalItems: misResidentes.length,
            itemsShowing: paginatedResidentes.length,
          }}
        >
          {paginatedResidentes.map((resident, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={resident.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="cell-icon primary">
                      <UserCheck size={14} />
                    </div>
                    <div className="fw-bold">{resident.nombre}</div>
                  </div>
                </td>
                <td>
                  <div className="text-sm text-muted">
                    <CreditCard size={14} />
                    {resident.dni}
                  </div>
                </td>
                <td>
                  <span className="badge badge-info">
                    Residente
                  </span>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenModal(resident)}
                    >
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDelete(resident)}
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
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={onSubmit}
        editingUser={editingResident}
        scope="condo-admin"
        condominio={miCondo}
      />

      <ConfirmDialog
        show={showDeleteModal && !!residentHasVehicles}
        onHide={closeDeleteModal}
        onConfirm={closeDeleteModal}
        title="Acción Bloqueada"
        message={`El residente ${residentToDelete?.nombre} tiene vehículos registrados en el sistema. Por seguridad, debes eliminar sus vehículos antes de poder dar de baja al residente.`}
        confirmText="Entendido"
        confirmVariant="warning"
        icon={Info}
      />

      <ConfirmDialog
        show={showDeleteModal && !residentHasVehicles}
        onHide={closeDeleteModal}
        onConfirm={confirmDelete}
        title={`¿Eliminar a ${residentToDelete?.nombre}?`}
        message="Esta acción es irreversible. El residente perderá el acceso a los servicios del condominio vinculados a tu unidad."
        confirmText="Confirmar Eliminación"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </AnimatedPage>
  );
};

export default PRMiApartamentoPage;
