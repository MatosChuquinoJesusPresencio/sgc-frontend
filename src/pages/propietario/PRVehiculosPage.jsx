import { useState, useMemo } from "react";

import {
  Car,
  Plus,
  Palette,
  ParkingCircle,
  Trash2,
  Edit3,
  Bike,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { useData } from "../../hooks/useData";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import VehicleModal from "../../components/modals/VehicleModal";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";

const PRVehiculosPage = () => {
  const { authUser } = useAuth();
  const { getTable, updateTable } = useData();

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const vehiculos = getTable("vehiculos");
  const apartamentos = getTable("apartamentos");
  const estacionamientos = getTable("estacionamientos");
  const residentes = getTable("inquilinos_temporales");

  const miApto = useMemo(
    () => apartamentos.find((a) => a.id_usuario === authUser?.id),
    [apartamentos, authUser],
  );
  const miEstacionamiento = useMemo(
    () => estacionamientos.find((e) => e.id_apartamento === miApto?.id),
    [estacionamientos, miApto],
  );

  const misResidentes = useMemo(
    () => residentes.filter((r) => r.id_apartamento === miApto?.id),
    [residentes, miApto],
  );

  const misResidentesIds = useMemo(
    () => misResidentes.map((r) => r.id),
    [misResidentes],
  );

  const misVehiculos = useMemo(() => {
    return vehiculos
      .filter(
        (v) =>
          v.id_usuario === authUser?.id ||
          (v.id_inquilino_temporal &&
            misResidentesIds.includes(v.id_inquilino_temporal)),
      )
      .map((v) => {
        const residente = residentes.find(
          (r) => r.id === v.id_inquilino_temporal,
        );
        return {
          ...v,
          propietarioNombre:
            v.id_usuario === authUser?.id
              ? "Mío"
              : residente?.nombre || "Residente",
        };
      });
  }, [vehiculos, authUser, misResidentesIds, residentes]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedVehiculos, itemsPerPage } = usePagination(misVehiculos);

  const handleOpenModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const onSubmit = (data) => {
    if (editingVehicle) {
      const updated = vehiculos.map((v) =>
        v.id === editingVehicle.id
          ? {
              ...v,
              ...data,
              id_usuario: data.id_usuario ? authUser.id : null,
            }
          : v,
      );
      updateTable("vehiculos", updated);
    } else {
      const newId =
        vehiculos.length > 0 ? Math.max(...vehiculos.map((v) => v.id)) + 1 : 1;
      const newVehicle = {
        id: newId,
        ...data,
        id_usuario: data.id_usuario ? authUser.id : null,
      };
      updateTable("vehiculos", [...vehiculos, newVehicle]);
    }
    setShowModal(false);
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = () => {
    const filtered = vehiculos.filter((v) => v.id !== vehicleToDelete.id);
    updateTable("vehiculos", filtered);
    setShowConfirmDelete(false);
    setVehicleToDelete(null);
  };

  if (!miApto) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center">
          <div className="card card-custom p-5 text-center">
            <Car size={60} className="text-muted mb-3" />
            <h3 className="fw-bold">Sin Unidad Asignada</h3>
            <p className="text-muted">
              No puedes gestionar vehículos sin una unidad vinculada.
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
          icon={Car}
          title="Gestión de Mis Vehículos"
          badgeText={miApto.numero}
          welcomeText="Registra y administra los vehículos autorizados para tu estacionamiento."
        />

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard
            icon={Car}
            label="Vehículos Registrados"
            value={misVehiculos.length}
            colorClass="primary-theme"
          />
          <div className="card card-custom flex items-center px-4">
            <div className="p-3 cell-icon info mr-4">
              <ParkingCircle size={24} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">
                Estacionamiento Asignado
              </h6>
              <p className="mb-0 text-muted text-sm">
                {miEstacionamiento ? (
                  <>
                    Tu unidad cuenta con el espacio:{" "}
                    <span className="badge badge-neutral">
                      {miEstacionamiento.numero}
                    </span>
                  </>
                ) : (
                  "No tienes un espacio de estacionamiento asignado actualmente."
                )}
              </p>
            </div>
          </div>
        </div>

        <DataTable
          headers={["#", "Vehículo", "Placa", "Asignado a", "Color", "Acciones"]}
          isEmpty={misVehiculos.length === 0}
          emptyMessage="No tienes vehículos registrados."
          emptyIcon={Car}
          searchBar={
            <div className="flex items-center justify-between">
              <div>
                <h5 className="fw-bold mb-1">Lista de Vehículos</h5>
                <p className="text-muted text-sm mb-0">
                  Vehículos que tienen permitido el ingreso al condominio.
                </p>
              </div>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => handleOpenModal()}
              >
                <Plus size={14} /> Registrar Vehículo
              </button>
            </div>
          }
          paginationProps={{
            currentPage,
            totalPages,
            onPageChange: setCurrentPage,
            totalItems: misVehiculos.length,
            itemsShowing: paginatedVehiculos.length,
          }}
        >
          {paginatedVehiculos.map((v, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={v.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">
                    {actualIndex.toString().padStart(2, "0")}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="cell-icon primary">
                      {v.tipo === "Moto" ? <Bike size={14} /> : <Car size={14} />}
                    </div>
                    <div>
                      <div className="fw-bold">{v.marca}</div>
                      <div className="text-xs text-muted">{v.modelo}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-neutral">
                    {v.placa}
                  </span>
                </td>
                <td>
                  <span className="badge badge-info">
                    {v.propietarioNombre}
                  </span>
                </td>
                <td>
                  <div className="flex items-center gap-2 text-sm">
                    <Palette size={14} className="text-muted" /> {v.color}
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleOpenModal(v)}
                    >
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => handleDeleteClick(v)}
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

      <VehicleModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSubmit={onSubmit}
        editingVehicle={editingVehicle}
        residents={misResidentes}
      />

      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Vehículo"
        message={`¿Estás seguro de eliminar el vehículo ${vehicleToDelete?.marca} ${vehicleToDelete?.modelo} — ${vehicleToDelete?.placa}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        confirmVariant="danger"
      />
    </AnimatedPage>
  );
};

export default PRVehiculosPage;
