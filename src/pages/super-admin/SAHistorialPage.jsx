import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ClipboardList,
  ShoppingCart,
  Car,
  Calendar,
  Clock,
  CheckCircle,
  User,
  Home,
  Building2,
} from "lucide-react";

import { useData } from "../../hooks/useData";
import { usePagination } from "../../hooks/usePagination";
import { useHistoryMappings } from "../../hooks/useHistoryMappings";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import { formatDateTime } from "../../utils/formatters";

const SAHistorialPage = () => {
  const { getTable } = useData();
  const [searchParams] = useSearchParams();

  const logsCarritos = getTable("logs_prestamo_carrito");
  const logsVehiculos = getTable("logs_acceso_vehicular");
  const carritos = getTable("carritos_carga");
  const apartamentos = getTable("apartamentos");
  const usuarios = getTable("usuarios");
  const estacionamientos = getTable("estacionamientos");
  const condominios = getTable("condominios");
  const pisos = getTable("pisos");
  const torres = getTable("torres");
  const inquilinos = getTable("inquilinos_temporales");
  const configuraciones = getTable("configuraciones");

  const initialTab = searchParams.get("tab") || "carritos";
  const [selectedCondo, setSelectedCondo] = useState("all");
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "carritos" || tab === "estacionamiento")) setActiveTab(tab);
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const { mappedCarritos, mappedEstacionamiento } = useHistoryMappings({
    logsCarrito: logsCarritos,
    logsEstacionamiento: logsVehiculos,
    apartamentos,
    estacionamientos,
    carritos,
    usuarios,
    inquilinosTemporales: inquilinos,
    torres,
    pisos,
    condominios,
    configuraciones,
    config: null,
    now,
    idCondominioFilter: selectedCondo !== "all" ? parseInt(selectedCondo) : null,
  });

  const filteredData = useMemo(() => {
    const source = activeTab === "carritos" ? mappedCarritos : mappedEstacionamiento;
    return source.filter((item) => {
      const matchesSearch = activeTab === "carritos"
        ? item.carritoNombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.aptoNumero?.toLowerCase().includes(searchTerm.toLowerCase())
        : item.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (item.vehiculoInfo || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" ||
        (statusFilter === "active" ? !item.fecha_salida : !!item.fecha_salida);
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, mappedCarritos, mappedEstacionamiento, searchTerm, statusFilter]);

  const { currentPage, setCurrentPage, totalPages, paginatedData, itemsPerPage } = usePagination(filteredData);

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader icon={ClipboardList} title="Historial Global" badgeText="Super Admin" welcomeText="Supervisa el flujo de operaciones en todos los condominios registrados." />

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard icon={Building2} label="Condominios Activos" value={condominios.length} colorClass="primary-theme" />
          <StatCard icon={ShoppingCart} label="Préstamos Totales" value={mappedCarritos.length} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Total Auditoría" value={filteredData.length} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={activeTab === "carritos"
            ? ["#", "Condominio", "Unidad", "Carrito", "Solicitante", "Salida", "Retorno", "Multa", "Estado"]
            : ["#", "Condominio", "Vehículo / Placa", "Espacio", "Entrada", "Salida", "Estado"]
          }
          isEmpty={paginatedData.length === 0}
          emptyMessage={activeTab === "carritos" ? "No hay registros de carritos." : "No hay registros de acceso vehicular."}
          emptyIcon={activeTab === "carritos" ? ShoppingCart : Car}
          searchBar={
            <>
              <div className="mb-4">
                <div className="tabs">
                  <button
                    className={`tab ${activeTab === "carritos" ? "active" : ""}`}
                    onClick={() => { setActiveTab("carritos"); setStatusFilter("all"); setSearchTerm(""); setCurrentPage(1); }}
                  >
                    <ShoppingCart size={14} /> Préstamo de Carritos
                  </button>
                  <button
                    className={`tab ${activeTab === "estacionamiento" ? "active" : ""}`}
                    onClick={() => { setActiveTab("estacionamiento"); setStatusFilter("all"); setSearchTerm(""); setCurrentPage(1); }}
                  >
                    <Car size={14} /> Accesos al Condominio
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ flex: 6 }}>
                  <SearchBar searchTerm={searchTerm} onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }} placeholder="Buscar..." />
                </div>
                <div style={{ flex: 3 }}>
                  <select className="form-select" value={selectedCondo} onChange={(e) => { setSelectedCondo(e.target.value); setCurrentPage(1); }}>
                    <option value="all">Todos los Condominios</option>
                    {condominios.map((c) => (<option key={c.id} value={c.id}>{c.nombre}</option>))}
                  </select>
                </div>
                <div style={{ flex: 3 }}>
                  <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="all">Todos los estados</option>
                    <option value="active">{activeTab === "carritos" ? "En uso" : "En recinto"}</option>
                    <option value="finished">Finalizados</option>
                  </select>
                </div>
              </div>
            </>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredData.length, itemsShowing: paginatedData.length }}
        >
          {paginatedData.map((log, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            if (activeTab === "carritos") {
              return (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                  <td className="py-3"><div className="fw-bold text-sm">{log.condoNombre || "N/A"}</div></td>
                  <td className="py-3"><div className="text-sm flex items-center gap-1"><Home size={12} className="text-muted" /> {log.aptoNumero || log.id_apartamento}</div></td>
                  <td className="py-3"><div className="text-sm fw-medium">{log.carritoNombre || `Carrito ${log.id_carrito}`}</div></td>
                  <td className="py-3"><div className="text-sm text-muted flex items-center gap-1"><User size={12} /> {log.usuarioNombre || log.solicitante}</div></td>
                  <td className="py-3"><div className="text-xs flex items-center gap-1"><Clock size={10} className="text-muted" /> {formatDateTime(log.fecha_entrada)}</div></td>
                  <td className="py-3"><div className="text-xs flex items-center gap-1"><Clock size={10} className="text-muted" /> {log.fecha_salida ? formatDateTime(log.fecha_salida) : "---"}</div></td>
                  <td className="py-3">{log.penalizacionCalculada > 0 ? <span className="text-danger fw-bold text-sm">S/. {log.penalizacionCalculada.toFixed(2)}</span> : <span className="text-muted text-sm">S/. 0.00</span>}</td>
                  <td className="px-4 py-3 text-center"><span className={`badge ${log.fecha_salida ? "badge-success" : "badge-warning"}`}>{log.fecha_salida ? "Devuelto" : "En uso"}</span></td>
                </tr>
              );
            }
            return (
              <tr key={log.id}>
                <td className="px-4 py-3 text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                <td className="py-3"><div className="fw-bold text-sm">{log.condoNombre || "N/A"}</div></td>
                <td className="py-3"><div className="fw-bold text-sm">{log.placa}</div><div className="text-xs text-muted">{log.vehiculoInfo}</div></td>
                <td className="py-3 text-center"><span className="badge badge-neutral">{log.estacionamientoNumero || log.id_estacionamiento}</span></td>
                <td className="py-3"><div className="text-xs flex items-center gap-1"><Calendar size={10} className="text-muted" /> {formatDateTime(log.fecha_entrada)}</div></td>
                <td className="py-3"><div className="text-xs">{log.fecha_salida ? formatDateTime(log.fecha_salida) : "---"}</div></td>
                <td className="px-4 py-3 text-center"><span className={`badge ${log.fecha_salida ? "badge-neutral" : "badge-info"}`}>{log.fecha_salida ? "Fuera" : "En recinto"}</span></td>
              </tr>
            );
          })}
        </DataTable>
      </div>
    </AnimatedPage>
  );
};

export default SAHistorialPage;
