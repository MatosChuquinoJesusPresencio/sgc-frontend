import { useState, useMemo } from "react";
import {
  Car,
  Building2,
  MapPin,
  Info,
  Eye,
  User,
  AlertTriangle,
  CheckCircle,
  X,
} from "lucide-react";

import { useData } from "../../hooks/useData";
import { usePagination } from "../../hooks/usePagination";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";

const SAEstacionamientosPage = () => {
  const { getTable } = useData();

  const estacionamientos = getTable("estacionamientos");
  const apartamentos = getTable("apartamentos");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const condominios = getTable("condominios");
  const usuarios = getTable("usuarios");
  const vehiculos = getTable("vehiculos");
  const inquilinosTemporales = getTable("inquilinos_temporales");
  const configuraciones = getTable("configuraciones");

  const [searchTerm, setSearchTerm] = useState("");
  const [condoFilter, setCondoFilter] = useState("all");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEstacionamiento, setSelectedEstacionamiento] = useState(null);

  const allEstacionamientos = useMemo(() => {
    return estacionamientos.map((e) => {
      const apto = apartamentos.find((a) => a.id === e.id_apartamento);
      const piso = pisos.find((p) => p.id === apto?.id_piso);
      const torre = torres.find((t) => t.id === piso?.id_torre);
      const condo = condominios.find((c) => c.id === torre?.id_condominio);
      const owner = usuarios.find((u) => u.id === apto?.id_usuario);
      const config = configuraciones.find((c) => c.id_condominio === condo?.id);
      const residents = inquilinosTemporales.filter((i) => i.id_apartamento === e.id_apartamento);
      const residentIds = residents.map((r) => r.id);
      const ownerVehicles = owner ? vehiculos.filter((v) => v.id_usuario === owner.id) : [];
      const residentVehicles = vehiculos.filter((v) => residentIds.includes(v.id_inquilino_temporal));
      const allVehicles = [...ownerVehicles, ...residentVehicles];
      const maxVehiculos = e.tipo_vehiculo === "Auto" ? (config?.max_autos || 0) : (config?.max_motos || 0);
      const isFull = e.cantidad_vehiculos > 0 && e.cantidad_vehiculos >= maxVehiculos;

      return { ...e, condoId: condo?.id, condoNombre: condo?.nombre || "N/A", torreNombre: torre?.nombre || "N/A", aptoNumero: apto?.numero || "N/A", ownerName: owner?.nombre || "Sin Propietario", vehicles: allVehicles, maxVehiculos, isFull };
    });
  }, [estacionamientos, apartamentos, pisos, torres, condominios, usuarios, vehiculos, inquilinosTemporales, configuraciones]);

  const stats = useMemo(() => ({
    total: allEstacionamientos.length,
    ocupados: allEstacionamientos.filter((e) => e.isFull).length,
    conVehiculos: allEstacionamientos.filter((e) => e.cantidad_vehiculos > 0).length,
    totalCondos: condominios.length,
  }), [allEstacionamientos, condominios]);

  const filteredEst = useMemo(() => {
    return allEstacionamientos.filter((est) => {
      const matchesSearch = est.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.condoNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.aptoNumero.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCondo = condoFilter === "all" || est.condoId?.toString() === condoFilter;
      return matchesSearch && matchesCondo;
    });
  }, [allEstacionamientos, searchTerm, condoFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData: paginatedEst, itemsPerPage } = usePagination(filteredEst);

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={Car} title="Explorador Global de Estacionamientos" badgeText="Vista de Auditoría" welcomeText="Monitorea la ocupación y distribución de los espacios de parqueo en todos los condominios del sistema." />

        <div className="grid grid-4 gap-4 mb-5">
          <StatCard icon={Car} label="Total Espacios" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={Building2} label="Condominios" value={stats.totalCondos} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Espacios Llenos" value={stats.ocupados} colorClass="primary-theme" />
          <StatCard icon={Info} label="En Uso" value={stats.conVehiculos} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "Condominio", "Estacionamiento", "Asignación", "Estado", "Ocupación", "Acción"]}
          isEmpty={paginatedEst.length === 0}
          emptyMessage="No hay estacionamientos que coincidan con la búsqueda global."
          emptyIcon={Car}
          searchBar={
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
              placeholder="Buscar por nro, apto, propietario o condo..."
              filterValue={condoFilter}
              onFilterChange={(val) => { setCondoFilter(val); setCurrentPage(1); }}
              filterOptions={[{ value: "all", label: "Todos los Condominios" }, ...condominios.map((c) => ({ value: c.id.toString(), label: c.nombre }))]}
              colSize={{ search: 4, filter: 3 }}
            />
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredEst.length, itemsShowing: paginatedEst.length }}
        >
          {paginatedEst.map((est, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            return (
              <tr key={est.id}>
                <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                <td className="py-3">
                  <div className="fw-bold text-accent text-sm">{est.condoNombre}</div>
                  <div className="text-xs text-muted">ID Condo: {est.condoId}</div>
                </td>
                <td className="py-3">
                  <div className="fw-bold">{est.numero}</div>
                  <div className="text-xs text-muted">{est.cantidad_vehiculos > 0 ? est.tipo_vehiculo : "Disponible"}</div>
                </td>
                <td className="py-3">
                  <span className="badge badge-info">Apto {est.aptoNumero}</span>
                  <div className="text-xs text-muted mt-1">{est.ownerName}</div>
                </td>
                <td className="py-3">
                  <span className={`badge ${est.isFull ? "badge-danger" : est.cantidad_vehiculos > 0 ? "badge-success" : "badge-neutral"}`}>
                    {est.isFull ? "Lleno" : est.cantidad_vehiculos > 0 ? "Con Espacio" : "Disponible"}
                  </span>
                </td>
                <td className="py-3 text-center"><div className="text-sm fw-bold">{est.cantidad_vehiculos} / {est.cantidad_vehiculos > 0 ? est.maxVehiculos : "-"}</div></td>
                <td className="px-4 py-3 text-right">
                  <button className="btn btn-outline btn-sm" onClick={() => { setSelectedEstacionamiento(est); setShowDetailModal(true); }}>
                    <Eye size={14} /> <span>Detalles</span>
                  </button>
                </td>
              </tr>
            );
          })}
        </DataTable>
      </div>

      {showDetailModal && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title flex items-center gap-2"><Car size={16} /> Vehículos Registrados</div>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="modal-body">
              <div className="flex items-center gap-3 p-3 mb-4">
                <div className="cell-icon primary">
                  <Car size={24} />
                </div>
                <div>
                  <div className="fw-bold">Espacio {selectedEstacionamiento?.numero}</div>
                  <div className="text-sm text-muted">{selectedEstacionamiento?.condoNombre} • Apto {selectedEstacionamiento?.aptoNumero}</div>
                </div>
              </div>
              <h6 className="fw-bold text-secondary mb-3 text-sm">PROPIETARIO ASIGNADO</h6>
              <div className="flex items-center gap-2 px-3 py-2 mb-4 text-sm fw-medium">
                <User size={12} className="text-muted" /> {selectedEstacionamiento?.ownerName}
              </div>
              <h6 className="fw-bold text-secondary mb-3 text-sm">LISTA DE VEHÍCULOS ({selectedEstacionamiento?.vehicles.length})</h6>
              <div className="p-2">
                {selectedEstacionamiento?.vehicles.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {selectedEstacionamiento.vehicles.map((v) => (
                      <div key={v.id} className="flex items-center gap-3 p-3">
                        <div className="cell-icon primary">
                          <Car size={20} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="fw-bold text-sm">{v.marca} {v.modelo}</div>
                          <div className="text-xs text-muted">Placa: <span className="fw-bold">{v.placa}</span> • Color: {v.color}</div>
                        </div>
                        <span className="badge badge-neutral text-xs">{v.id_usuario ? "Propietario" : "Inquilino"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <AlertTriangle className="text-warning mb-2" size={24} />
                    <div className="text-muted text-sm">No hay vehículos registrados para esta unidad en el sistema.</div>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary w-full" onClick={() => setShowDetailModal(false)}>Entendido</button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default SAEstacionamientosPage;
