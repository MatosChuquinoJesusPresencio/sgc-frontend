import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  ClipboardList,
  ShoppingCart,
  Car,
  CheckCircle,
  Clock,
  Home,
  User,
  Calendar,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { adminCondominioService } from "../../services/adminCondominioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import DataTable from "../../components/ui/DataTable";
import SearchBar from "../../components/ui/SearchBar";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime } from "../../utils/formatters";

const PAGE_SIZE = 10;

const ACHistorialPage = () => {
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const typeMap = { carritos: "PRESTAMO_CARRITO", estacionamiento: "ACCESO_VEHICULAR" };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = {
        type: typeMap[activeTab],
        page: currentPage - 1,
        size: PAGE_SIZE,
        fechaInicio: undefined,
        fechaFin: undefined,
      };
      const res = await adminCondominioService.getLogs(params);
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
  }, [activeTab, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm, statusFilter]);

  const logs = useMemo(() => logsData.items || [], [logsData]);
  const totalPages = Math.ceil(logsData.total / PAGE_SIZE) || 1;

  if (loading && logs.length === 0) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const stats = useMemo(() => ({
    activos: logs.filter((l) => !l.fechaSalida && !l.fecha_salida).length,
    total: logsData.total,
  }), [logs, logsData.total]);

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={ClipboardList}
          title="Historial"
          badgeText="Condominio"
          welcomeText="Monitorea el historial de pr\u00e9stamos de carritos y el flujo de estacionamiento."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard icon={ShoppingCart} label="Carritos en Uso" value={activeTab === "carritos" ? stats.activos : "-"} colorClass="primary-theme" />
          <StatCard icon={Car} label="Veh\u00edculos en Recinto" value={activeTab === "estacionamiento" ? stats.activos : "-"} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Total Operaciones" value={stats.total} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={
            activeTab === "carritos"
              ? ["#", "Unidad", "Carrito", "Solicitante", "Salida", "Retorno", "Multa", "Estado"]
              : ["#", "Veh\u00edculo / Placa", "Espacio", "Entrada", "Salida", "Estado"]
          }
          isEmpty={logs.length === 0}
          emptyMessage={activeTab === "carritos" ? "No hay registros de carritos." : "No hay registros de acceso vehicular."}
          emptyIcon={activeTab === "carritos" ? ShoppingCart : Car}
          searchBar={
            <>
              <div className="mb-4">
                <div className="tabs">
                  <button className={`tab ${activeTab === "carritos" ? "active" : ""}`} onClick={() => { setActiveTab("carritos"); setStatusFilter("all"); setSearchTerm(""); setCurrentPage(1); }}>
                    <ShoppingCart size={14} /> Pr\u00e9stamo de Carritos
                  </button>
                  <button className={`tab ${activeTab === "estacionamiento" ? "active" : ""}`} onClick={() => { setActiveTab("estacionamiento"); setStatusFilter("all"); setSearchTerm(""); setCurrentPage(1); }}>
                    <Car size={14} /> Historial de Estacionamiento
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div style={{ flex: 9 }}>
                  <SearchBar
                    searchTerm={searchTerm}
                    onSearchChange={(val) => { setSearchTerm(val); setCurrentPage(1); }}
                    placeholder={activeTab === "carritos" ? "Buscar por carrito o unidad..." : "Buscar por placa o veh\u00edculo..."}
                  />
                </div>
                <div style={{ flex: 3 }}>
                  <select className="form-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}>
                    <option value="all">Todos los registros</option>
                    <option value="active">{activeTab === "carritos" ? "En uso actualmente" : "Dentro del recinto"}</option>
                    <option value="finished">{activeTab === "carritos" ? "Completados/Devueltos" : "Salidas registradas"}</option>
                  </select>
                </div>
              </div>
            </>
          }
          paginationProps={{
            currentPage, totalPages, onPageChange: setCurrentPage,
            totalItems: logsData.total, itemsShowing: logs.length,
          }}
        >
          {logs.map((log, index) => {
            const actualIndex = (currentPage - 1) * PAGE_SIZE + index + 1;
            const fechaEntrada = log.fechaEntrada || log.fecha_entrada;
            const fechaSalida = log.fechaSalida || log.fecha_salida;
            const multa = log.multa || log.penalizacionCalculada || 0;

            if (activeTab === "carritos") {
              return (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-center">
                    <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                  </td>
                  <td className="py-3">
                    <div className="text-sm flex items-center gap-1">
                      <Home size={12} className="text-muted" /> {log.numeroApartamento || log.aptoNumero || log.idApartamento || "-"}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm fw-medium">{log.carritoNombre || log.carritoCodigo || `Carrito ${log.idCarrito || log.id_carrito}`}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-sm text-muted flex items-center gap-1">
                      <User size={12} /> {log.solicitante || log.usuarioNombre || "N/A"}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-xs flex items-center gap-1">
                      <Clock size={10} className="text-muted" /> {fechaEntrada ? formatDateTime(fechaEntrada) : "-"}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-xs flex items-center gap-1">
                      <Clock size={10} className="text-muted" /> {fechaSalida ? formatDateTime(fechaSalida) : "---"}
                    </div>
                  </td>
                  <td className="py-3">
                    {multa > 0 ? (
                      <span className="text-danger fw-bold text-sm">S/. {multa.toFixed(2)}</span>
                    ) : (
                      <span className="text-muted text-sm">S/. 0.00</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${fechaSalida ? "badge-success" : "badge-warning"}`}>
                      {fechaSalida ? "Devuelto" : "En uso"}
                    </span>
                  </td>
                </tr>
              );
            } else {
              return (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-center">
                    <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                  </td>
                  <td className="py-3">
                    <div className="fw-bold text-sm">{log.placa || "---"}</div>
                    <div className="text-xs text-muted">{log.vehiculoInfo || log.metodo || ""}</div>
                  </td>
                  <td className="py-3 text-center">
                    <span className="badge badge-neutral">{log.estacionamientoNumero || log.codigoEstacionamiento || log.idEstacionamiento || "-"}</span>
                  </td>
                  <td className="py-3">
                    <div className="text-xs flex items-center gap-1">
                      <Calendar size={10} className="text-muted" /> {fechaEntrada ? formatDateTime(fechaEntrada) : "-"}
                    </div>
                  </td>
                  <td className="py-3">
                    <div className="text-xs flex items-center gap-1">
                      <Calendar size={10} className="text-muted" /> {fechaSalida ? formatDateTime(fechaSalida) : "-"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`badge ${fechaSalida ? "badge-neutral" : "badge-info"}`}>
                      {fechaSalida ? "Fuera" : "En recinto"}
                    </span>
                  </td>
                </tr>
              );
            }
          })}
        </DataTable>
      </div>
    </AnimatedPage>
  );
};

export default ACHistorialPage;
