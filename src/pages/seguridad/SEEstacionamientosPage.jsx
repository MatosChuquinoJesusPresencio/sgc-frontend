import { useState, useEffect, useMemo } from "react";
import { Car, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { securityService } from "../../services/securityService";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import { usePagination } from "../../hooks/usePagination";

const SEEstacionamientosPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slots, setSlots] = useState([]);

  const fetchSlots = async () => {
    try {
      setLoading(true);
      const res = await securityService.getParkingSlots();
      setSlots(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err.message || "Error al cargar estacionamientos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  const stats = useMemo(() => ({
    total: slots.length,
    ocupados: slots.filter((s) => !s.disponible).length,
    disponibles: slots.filter((s) => s.disponible).length,
  }), [slots]);

  const { currentPage, setCurrentPage, totalPages, paginatedData, itemsPerPage } = usePagination(slots);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={Car}
          title="Estacionamientos"
          welcomeText="Visualiza el estado actual de todos los espacios de estacionamiento."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Car} label="Total Espacios" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={XCircle} label="Ocupados" value={stats.ocupados} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Disponibles" value={stats.disponibles} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "N\u00famero", "Tipo Veh\u00edculo", "Capacidad", "Ocupaci\u00f3n Actual", "Estado"]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No hay estacionamientos registrados."
          emptyIcon={Car}
          paginationProps={{
            currentPage, totalPages, onPageChange: setCurrentPage,
            totalItems: slots.length, itemsShowing: paginatedData.length,
          }}
        >
          {paginatedData.map((slot, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={slot.id}>
                <td className="px-4 py-3 text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td className="py-3 fw-bold">{slot.numero}</td>
                <td className="py-3">{slot.tipoVehiculo || "General"}</td>
                <td className="py-3">{slot.capacidadMaxima ?? "-"}</td>
                <td className="py-3">{slot.cantidadActual ?? 0}</td>
                <td className="py-3">
                  <span className={`badge ${slot.disponible ? "badge-success" : "badge-danger"}`}>
                    {slot.disponible ? "Disponible" : "Ocupado"}
                  </span>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </AnimatedPage>
  );
};

export default SEEstacionamientosPage;
