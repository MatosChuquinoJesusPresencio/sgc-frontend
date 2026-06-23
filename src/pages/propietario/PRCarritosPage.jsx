import { useState, useEffect, useMemo } from "react";
import {
  ShoppingCart,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  History,
  ArrowLeft,
  Info,
  X,
  Loader2,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth";
import { propietarioService } from "../../services/propietarioService";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import StatCard from "../../components/dashboard/StatCard";
import AnimatedPage from "../../components/animations/AnimatedPage";
import SearchBar from "../../components/ui/SearchBar";
import DataTable from "../../components/ui/DataTable";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime } from "../../utils/formatters";

const PRCarritosPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [logs, setLogs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedCarrito, setSelectedCarrito] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [summary, logsRes] = await Promise.all([
        propietarioService.getDashboardSummary().catch(() => ({})),
        propietarioService.getLogs({ size: 10 }).catch(() => ({ items: [] })),
      ]);
      setDashboard(summary);
      setLogs(logsRes.items || logsRes || []);
    } catch (err) {
      setError(err.message || "Error al cargar datos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const carritosMapped = useMemo(() => {
    const items = dashboard?.carritos || [];
    const activeLoan = dashboard?.prestamoActivo;
    return items.map((c) => ({
      id: c.id,
      codigo: c.codigo || c.numero || c.nombre,
      estado: c.estado || "Disponible",
      currentUser: activeLoan && activeLoan.idCarrito === c.id
        ? {
            isMe: true,
            nombre: `${dashboard.usuario?.nombres || ""} ${dashboard.usuario?.apellidos || ""}`.trim() || "T\u00fa",
            aptoNumero: dashboard.apartamentos?.[0]?.numero || "",
            fine: activeLoan.multa || 0,
            fechaEntrada: activeLoan.fechaSalida || activeLoan.fechaEntrada,
            loanId: activeLoan.id,
          }
        : null,
      fine: (activeLoan && activeLoan.idCarrito === c.id) ? (activeLoan.multa || 0) : 0,
    }));
  }, [dashboard]);

  const activeLoan = dashboard?.prestamoActivo;

  const stats = useMemo(() => {
    const total = carritosMapped.length;
    const disponibles = carritosMapped.filter((c) => c.estado === "Disponible").length;
    const miUso = activeLoan ? 1 : 0;
    return { total, disponibles, miUso };
  }, [carritosMapped, activeLoan]);

  const filteredCarritos = useMemo(() => {
    return carritosMapped.filter((c) =>
      c.codigo?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [carritosMapped, searchTerm]);

  const { currentPage, setCurrentPage, totalPages, paginatedData, itemsPerPage } = usePagination(filteredCarritos);

  const recentLogs = useMemo(() => {
    return (logs || []).filter((l) =>
      l.tipo === "PRESTAMO_CARRITO" || !l.tipo
    ).slice(0, 5);
  }, [logs]);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const handleRequest = (carrito) => {
    setSelectedCarrito(carrito);
    setShowRequestModal(true);
  };

  const handleReturn = (carrito) => {
    setSelectedCarrito(carrito);
    setShowReturnModal(true);
  };

  const getStatusBadge = (carrito) => {
    if (carrito.estado === "Disponible") return <span className="badge badge-success">Disponible</span>;
    if (carrito.currentUser?.isMe) return <span className="badge badge-info">En mi poder</span>;
    return <span className="badge badge-warning">Ocupado</span>;
  };

  return (
    <AnimatedPage>
      <div className="page-container">
        <DashboardHeader
          icon={ShoppingCart}
          title="Servicio de Carritos"
          badgeText="Residente"
          welcomeText="Consulta disponibilidad y solicita carritos de carga para tus mudanzas o compras."
        />

        {error && <div className="alert alert-danger mb-3">{error}</div>}

        <div className="grid grid-3 gap-4 mb-5">
          <StatCard icon={ShoppingCart} label="Total Flota" value={stats.total} colorClass="primary-theme" />
          <StatCard icon={CheckCircle} label="Disponibles Ahora" value={stats.disponibles} colorClass="primary-theme" />
          <StatCard icon={User} label="En mi Posesi\u00f3n" value={stats.miUso} colorClass="primary-theme" />
        </div>

        <DataTable
          headers={["#", "C\u00f3digo", "Estado", "Informaci\u00f3n de Uso", "Acci\u00f3n"]}
          isEmpty={paginatedData.length === 0}
          emptyMessage="No hay carritos registrados para tu condominio."
          emptyIcon={ShoppingCart}
          searchBar={
            <div className="flex items-center justify-between">
              <h5 className="fw-bold flex items-center gap-2">
                <div className="cell-icon primary"><ShoppingCart size={14} /></div>
                Carritos Disponibles
              </h5>
              <div style={{ width: "300px" }}>
                <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} placeholder="Buscar por c\u00f3digo..." />
              </div>
            </div>
          }
          paginationProps={{ currentPage, totalPages, onPageChange: setCurrentPage, totalItems: filteredCarritos.length, itemsShowing: paginatedData.length }}
        >
          {paginatedData.map((carrito, index) => {
            const actualIndex = (currentPage - 1) * itemsPerPage + index + 1;
            const isMine = carrito.currentUser?.isMe;
            const isAvailable = carrito.estado === "Disponible";

            return (
              <tr key={carrito.id}>
                <td className="text-center">
                  <span className="text-secondary fw-bold">{actualIndex.toString().padStart(2, "0")}</span>
                </td>
                <td><div className="fw-bold">{carrito.codigo}</div></td>
                <td>{getStatusBadge(carrito)}</td>
                <td>
                  {carrito.currentUser ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-muted">{isMine ? "T\u00fa lo tienes" : `Apto ${carrito.currentUser.aptoNumero}`}</span>
                      {carrito.fine > 0 && <span className="text-xs text-danger fw-bold">Multa: S/. {carrito.fine.toFixed(2)}</span>}
                    </div>
                  ) : (
                    <span className="text-muted text-sm">Libre para solicitar</span>
                  )}
                </td>
                <td>
                  {isAvailable ? (
                    <button className="btn btn-primary btn-sm" onClick={() => handleRequest(carrito)}>
                      <ArrowRight size={14} /> Solicitar
                    </button>
                  ) : isMine ? (
                    <button className="btn btn-outline btn-sm" onClick={() => handleReturn(carrito)}>
                      <ArrowLeft size={14} /> Devolver
                    </button>
                  ) : (
                    <button className="btn btn-ghost btn-sm" disabled>No disponible</button>
                  )}
                </td>
              </tr>
            );
          })}
        </DataTable>

        <section className="mb-5">
          <h5 className="fw-bold mb-4 flex items-center gap-2">
            <div className="cell-icon warning"><History size={14} /></div>
            Uso Reciente de mi Apartamento
          </h5>
          <DataTable
            headers={["Carrito", "Usuario", "Solicitante", "Salida", "Retorno", "Estado"]}
            isEmpty={recentLogs.length === 0}
            emptyMessage="No hay pr\u00e9stamos recientes en tu apartamento."
            emptyIcon={History}
            searchBar={null}
          >
            {recentLogs.map((log) => {
              const isReturned = !!(log.fechaSalida || log.fecha_salida);
              return (
                <tr key={log.id}>
                  <td><span className="fw-bold">{log.carritoNombre || log.carritoCodigo || `Carrito #${log.idCarrito || log.id_carrito}`}</span></td>
                  <td><span className="text-sm text-muted">{log.usuarioNombre || log.solicitante || "N/A"}</span></td>
                  <td><span className="badge badge-neutral">{log.solicitante || "Propietario"}</span></td>
                  <td><div className="text-xs text-muted">{formatDateTime(log.fechaEntrada || log.fecha_entrada)}</div></td>
                  <td><div className="text-xs text-muted">{isReturned ? formatDateTime(log.fechaSalida || log.fecha_salida) : "---"}</div></td>
                  <td><span className={`badge ${isReturned ? "badge-success" : "badge-warning"}`}>{isReturned ? "Devuelto" : "En uso"}</span></td>
                </tr>
              );
            })}
          </DataTable>
        </section>
      </div>

      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Solicitar Carrito</div>
              <button className="modal-close" onClick={() => setShowRequestModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body">
              <div className="alert alert-info flex items-center gap-2">
                <Info size={16} />
                <span>Acércate al módulo de seguridad para solicitar el carrito físicamente.</span>
              </div>
              <div className="text-center p-3 mb-4">
                <div className="text-muted text-sm mb-1">Carrito seleccionado</div>
                <div className="h4 fw-bold mb-0">{selectedCarrito?.codigo}</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowRequestModal(false)}>Cancelar</button>
              <button className="btn btn-primary disabled">Solicitar en Seguridad</button>
            </div>
          </div>
        </div>
      )}

      {showReturnModal && (
        <div className="modal-overlay" onClick={() => setShowReturnModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Devolver Carrito</div>
              <button className="modal-close" onClick={() => setShowReturnModal(false)}><X size={16} /></button>
            </div>
            <div className="modal-body text-center py-3">
              <div className="cell-icon primary" style={{ width: 80, height: 80, margin: "0 auto 1rem" }}>
                <ShoppingCart size={40} />
              </div>
              <h5 className="fw-bold">¿Has terminado de usar el carrito {selectedCarrito?.codigo}?</h5>
              <p className="text-muted text-sm">Devuélvelo en el módulo de seguridad para dejarlo disponible.</p>
              {selectedCarrito?.fine > 0 && (
                <div className="alert alert-danger flex items-center gap-3">
                  <AlertTriangle size={24} />
                  <div className="text-left">
                    <div className="fw-bold">Multa por exceso de tiempo</div>
                    <div className="text-sm">Se ha generado un cargo de <strong>S/. {selectedCarrito.fine.toFixed(2)}</strong></div>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReturnModal(false)}>Cancelar</button>
              <button className="btn btn-primary disabled">Devolver en Seguridad</button>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default PRCarritosPage;
