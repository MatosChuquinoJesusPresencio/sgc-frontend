import { useState, useEffect, useMemo } from "react";

import {
  Car,
  Plus,
  Palette,
  ParkingCircle,
  Trash2,
  Edit3,
  Bike,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { propietarioService } from "../../services/propietarioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import VehicleModal from "../../components/modals/VehicleModal";
import DataTable from "../../components/ui/DataTable";
import ConfirmDialog from "../../components/modals/ConfirmDialog";
import { usePagination } from "../../hooks/usePagination";

const PRVehiculosPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [apto, setApto] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [vehiclesRes, aptoRes] = await Promise.all([
        propietarioService.getVehicles(),
        propietarioService.getApartmentDetails().catch(() => null),
      ]);
      setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
      setApto(aptoRes?.apartamento || aptoRes);
    } catch (err) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const misVehiculos = useMemo(() => {
    return (vehicles || []).map((v) => ({
      ...v,
      propietarioNombre: v.idUsuario === authUser?.id || v.id_usuario === authUser?.id ? "M\u00edo" : v.propietarioNombre || "Residente",
    }));
  }, [vehicles, authUser]);

  const miEstacionamiento = apto?.estacionamiento;

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedVehiculos, itemsPerPage } = usePagination(misVehiculos);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  if (!apto) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center">
          <div className="card card-custom p-5 text-center">
            <Car size={60} className="text-muted mb-3" />
            <h3 className="fw-bold">Sin Unidad Asignada</h3>
            <p className="text-muted">No puedes gestionar vehículos sin una unidad vinculada.</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const handleOpenModal = (vehicle = null) => {
    setEditingVehicle(vehicle);
    setShowModal(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingVehicle) {
        setVehicles((prev) => prev.map((v) => (v.id === editingVehicle.id ? { ...v, ...data } : v)));
      } else {
        await propietarioService.createVehicle(data);
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al guardar.");
    }
  };

  const handleDeleteClick = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowConfirmDelete(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await propietarioService.deleteVehicle(vehicleToDelete.id);
      setShowConfirmDelete(false);
      setVehicleToDelete(null);
      fetchData();
    } catch (err) {
      setError(err.message || "Error al eliminar.");
    }
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Car}
          title="Gesti\u00f3n de Mis Veh\u00edculos"
          badgeText={apto.numero}
          welcomeText="Registra y administra los veh\u00edculos autorizados para tu estacionamiento."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Car} label="Veh\u00edculos Registrados" value={misVehiculos.length} colorClass="primary-theme" />
          <div className="card card-custom flex items-center px-4">
            <div className="p-3 cell-icon info mr-4">
              <ParkingCircle size={24} />
            </div>
            <div>
              <h6 className="fw-bold mb-1">Estacionamiento Asignado</h6>
              <p className="mb-0 text-muted text-sm">
                {miEstacionamiento ? (
                  <>Tu unidad cuenta con el espacio: <span className="badge badge-neutral">{miEstacionamiento.numero}</span></>
                ) : (
                  "No tienes un espacio de estacionamiento asignado actualmente."
                )}
              </p>
            </div>
          </div>
        </div>

        <DataTable
          headers={["#", "Veh\u00edculo", "Placa", "Asignado a", "Color", "Acciones"]}
          isEmpty={misVehiculos.length === 0}
          emptyMessage="No tienes veh\u00edculos registrados."
          emptyIcon={Car}
          searchBar={
            <div className="flex items-center justify-between">
              <div>
                <h5 className="fw-bold mb-1">Lista de Vehículos</h5>
                <p className="text-muted text-sm mb-0">Vehículos que tienen permitido el ingreso al condominio.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()}>
                <Plus size={14} /> Registrar Veh\u00edculo
              </button>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: misVehiculos.length, itemsShowing: paginatedVehiculos.length }}
        >
          {paginatedVehiculos.map((v, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={v.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="cell-icon primary">{v.tipo === "Moto" ? <Bike size={14} /> : <Car size={14} />}</div>
                    <div>
                      <div className="fw-bold">{v.marca}</div>
                      <div className="text-xs text-muted">{v.modelo}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge badge-neutral">{v.placa}</span></td>
                <td><span className="badge badge-info">{v.propietarioNombre}</span></td>
                <td>
                  <div className="flex items-center gap-2 text-sm">
                    <Palette size={14} className="text-muted" /> {v.color}
                  </div>
                </td>
                <td>
                  <div className="flex justify-end gap-2">
                    <button className="btn btn-outline btn-sm" onClick={() => handleOpenModal(v)}>
                      <Edit3 size={14} /> <span>Editar</span>
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleDeleteClick(v)}>
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
        residents={[]}
      />

      <ConfirmDialog
        show={showConfirmDelete}
        onHide={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Veh\u00edculo"
        message={"\u00bfEst\u00e1s seguro de eliminar el veh\u00edculo " + (vehicleToDelete?.marca || "") + " " + (vehicleToDelete?.modelo || "") + " \u2014 " + (vehicleToDelete?.placa || "") + "? Esta acci\u00f3n no se puede deshacer."}
        confirmText="Eliminar"
        confirmVariant="danger"
      />
    </AnimatedPage>
  );
};

export default PRVehiculosPage;
