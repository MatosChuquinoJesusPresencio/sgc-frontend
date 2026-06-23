import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  History,
  ShoppingCart,
  Car,
  CheckCircle,
  Home,
  User,
  Clock,
  Calendar,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { propietarioService } from "../../services/propietarioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 10;

const PRHistorialPage = () => {
  const { authUser } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [logsData, setLogsData] = useState({ items: [], total: 0 });

  const initialTab = searchParams.get("tab") || "carritos";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "carritos" || tab === "estacionamiento")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = { page: currentPage - 1, size: PAGE_SIZE };
      const res = await propietarioService.getLogs(params);
      setLogsData({
        items: res.items || res || [],
        total: res.total || (Array.isArray(res) ? res.length : 0),
      });
    } catch (err) {
      setError(err.message || "Error al cargar historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  const allLogs = useMemo(() => logsData.items || [], [logsData]);

  const mappedCarritos = useMemo(() => {
    return allLogs.filter((l) => l.tipo === "PRESTAMO_CARRITO" || (!l.tipo && l.idCarrito));
  }, [allLogs]);

  const mappedEstacionamiento = useMemo(() => {
    return allLogs.filter((l) => l.tipo === "ACCESO_VEHICULAR" || (!l.tipo && l.placa));
  }, [allLogs]);

  const source = activeTab === "carritos" ? mappedCarritos : mappedEstacionamiento;

  const filteredData = useMemo(() => {
    return source.filter((item) => {
      if (activeTab === "carritos") {
        return (item.carritoNombre || item.carritoCodigo || "")
          .toLowerCase().includes(searchTerm.toLowerCase());
      } else {
        return (item.placa || "")
          .toLowerCase().includes(searchTerm.toLowerCase());
      }
    });
  }, [source, activeTab, searchTerm]);

  const totalPages = Math.ceil(logsData.total / PAGE_SIZE) || 1;

  if (loading && allLogs.length === 0) {
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
          icon={History}
          title="Mi Historial de Actividad"
          badgeText="Residente"
          welcomeText="Consulta el historial de accesos de tus veh\u00edculos y pr\u00e9stamos de carritos."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard icon={Car} label="Accesos Vehiculares" value={mappedEstacionamiento.length} colorClass="primary-theme" />
          <StatCard icon={ShoppingCart} label="Uso de Carritos" value={mappedCarritos.length} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Registros Totales" value={filteredData.length} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={
            activeTab === "carritos"
              ? ["#", "Unidad", "Carrito", "Solicitante", "Salida", "Retorno", "Multa", "Estado"]
              : ["#", "Veh\u00edculo / Placa", "Espacio", "Entrada", "Salida", "Estado"]
          }
          isEmpty={filteredData.length === 0}
          emptyMessage={activeTab === "carritos" ? "No hay registros de carritos." : "No hay registros de acceso vehicular."}
          emptyIcon={activeTab === "carritos" ? ShoppingCart : Car}
          searchBar={
            <>
              <div className="tabs mb-4">
                <button className={`tab ${activeTab === "carritos" ? "active" : ""}`} onClick={() => { setActiveTab("carritos"); setSearchTerm(""); setCurrentPage(1); }}>
                  <ShoppingCart size={14} /> Historial Carritos
                </button>
                <button className={`tab ${activeTab === "estacionamiento" ? "active" : ""}`} onClick={() => { setActiveTab("estacionamiento"); setSearchTerm(""); setCurrentPage(1); }}>
                  <Car size={14} /> Historial Accesos
                </button>
              </div>
              <SearchBar
                searchTerm={searchTerm}
                onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                placeholder={activeTab === "carritos" ? "Buscar por nombre de carrito..." : "Buscar por placa o modelo..."}
              />
            </>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredData.length, itemsShowing: filteredData.length }}
        >
          {filteredData.map((log, index) => {
            const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
            const fechaEntrada = log.fechaEntrada || log.fecha_entrada;
            const fechaSalida = log.fechaSalida || log.fecha_salida;
            const multa = log.multa || log.penalizacionCalculada || 0;

            if (activeTab === "carritos") {
              return (
                <tr key={log.id}>
                  <td className="text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                  <td><div className="text-sm"><Home size={14} className="text-muted" /> {log.aptoNumero || log.numeroApartamento || log.idApartamento || "-"}</div></td>
                  <td><div className="text-sm fw-medium">{log.carritoNombre || log.carritoCodigo || `Carrito ${log.idCarrito || log.id_carrito}`}</div></td>
                  <td><div className="text-sm text-muted"><User size={14} /> {log.usuarioNombre || log.solicitante || "N/A"}</div></td>
                  <td><div className="text-xs"><Clock size={12} className="text-muted" /> {fechaEntrada ? formatDateTime(fechaEntrada) : "-"}</div></td>
                  <td><div className="text-xs"><Clock size={12} className="text-muted" /> {fechaSalida ? formatDateTime(fechaSalida) : "---"}</div></td>
                  <td>{multa > 0 ? <span className="text-danger fw-bold text-sm">S/. {multa.toFixed(2)}</span> : <span className="text-muted text-sm">S/. 0.00</span>}</td>
                  <td><span className={`badge ${fechaSalida ? "badge-success" : "badge-warning"}`}>{fechaSalida ? "Devuelto" : "En uso"}</span></td>
                </tr>
              );
            } else {
              return (
                <tr key={log.id}>
                  <td className="text-center"><span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span></td>
                  <td><div className="fw-bold text-sm">{log.placa || "---"}</div><div className="text-xs text-muted">{log.vehiculoInfo || log.metodo || ""}</div></td>
                  <td className="text-center"><span className="badge badge-neutral">{log.estacionamientoNumero || log.codigoEstacionamiento || log.idEstacionamiento || "-"}</span></td>
                  <td><div className="text-xs"><Calendar size={12} className="text-muted" /> {fechaEntrada ? formatDateTime(fechaEntrada) : "-"}</div></td>
                  <td><div className="text-xs"><Calendar size={12} className="text-muted" /> {fechaSalida ? formatDateTime(fechaSalida) : "-"}</div></td>
                  <td><span className={`badge ${fechaSalida ? "badge-neutral" : "badge-info"}`}>{fechaSalida ? "Fuera" : "En recinto"}</span></td>
                </tr>
              );
            }
          })}
        </DataTable>
      </div>
    </AnimatedPage>
  );
};

export default PRHistorialPage;
