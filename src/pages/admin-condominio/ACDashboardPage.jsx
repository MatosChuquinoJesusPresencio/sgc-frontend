import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  Car,
  ShoppingCart,
  GitBranch,
  ArrowRight,
  Activity,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getAdminDashboard } from "../../services/dashboardService";
import AnimatedPage from "../../components/animations/AnimatedPage";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const ACDashboardPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authUser?.condominioId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getAdminDashboard()
      .then(setDashboard)
      .catch((err) => setError(err?.message || "Error al cargar el dashboard"))
      .finally(() => setLoading(false));
  }, [authUser]);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="greeting-banner">
            <h1>Cargando...</h1>
            <p>Obteniendo datos del condominio.</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="status-banner danger">
            <AlertTriangle size={16} />
            {error}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!dashboard || !dashboard.condominio) return <NoCondoWarning />;

  const { condominio, totalTorres, totalPisos, totalApartamentos, totalPropietarios, totalSeguridad, totalEstacionamientos, estacionamientosOcupados, vehiculosEnRecinto, carritosEnUso, accesosRecientes, prestamosRecientes, config } = dashboard;

  const totalUsuarios = totalPropietarios + totalSeguridad;
  const pctOcupacion = totalEstacionamientos > 0 ? Math.round((estacionamientosOcupados / totalEstacionamientos) * 100) : 0;

  const quickLinks = [
    { label: "Infraestructura", sub: `${totalTorres} torres, ${totalPisos} pisos`, icon: GitBranch, color: "accent", path: "/admin-condominio/infraestructura" },
    { label: "Usuarios", sub: `${totalUsuarios} registrados`, icon: Users, color: "success", path: "/admin-condominio/usuarios" },
    { label: "Apartamentos", sub: `${totalApartamentos} unidades`, icon: Home, color: "info", path: "/admin-condominio/apartamentos" },
    { label: "Estacionamientos", sub: `${estacionamientosOcupados}/${totalEstacionamientos} ocupados`, icon: Car, color: "warning", path: "/admin-condominio/estacionamientos" },
    { label: "Carritos", sub: `${carritosEnUso} en uso`, icon: ShoppingCart, color: "danger", path: "/admin-condominio/carritos" },
    { label: "Mi Condominio", sub: "Configuración", icon: Building2, color: "info", path: "/admin-condominio/mi-condominio" },
  ];

  return (
    <AnimatedPage>
      <div className="page-container">
        <div className="greeting-banner">
          <h1>{condominio.nombre}</h1>
          <p>Bienvenido, {authUser?.nombre || "Admin"}. Gestión operativa de tu condominio.</p>
        </div>

        <div className="grid grid-4 gap-4 mb-5">
          <div className="stat-card">
            <div className="stat-icon accent"><Home size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Apartamentos</div>
              <div className="stat-value">{totalApartamentos}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Users size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Propietarios</div>
              <div className="stat-value">{totalPropietarios}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Vehículos en Recinto</div>
              <div className="stat-value">{vehiculosEnRecinto}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Carritos en Uso</div>
              <div className="stat-value">{carritosEnUso}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><GitBranch size={16} /> Infraestructura</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin-condominio/infraestructura")}>
                Gestionar <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{totalTorres}</div>
                  <div className="summary-label">Torres</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalPisos}</div>
                  <div className="summary-label">Pisos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalApartamentos}</div>
                  <div className="summary-label">Apartamentos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalEstacionamientos}</div>
                  <div className="summary-label">Estacionamientos</div>
                </div>
              </div>

              <div style={{ marginTop: 14 }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs fw-semibold text-secondary">Ocupación de Estacionamientos</span>
                  <span className="text-xs fw-bold">{pctOcupacion}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className={`progress-bar-fill ${pctOcupacion > 80 ? "danger" : pctOcupacion > 50 ? "warning" : "success"}`}
                    style={{ width: `${pctOcupacion}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Activity size={16} /> Accesos Recientes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin-condominio/historial?tab=estacionamiento")}>
                Historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {accesosRecientes && accesosRecientes.length > 0 ? (
                accesosRecientes.map((log) => (
                  <div key={log.id} className="feed-item">
                    <div className={`feed-dot ${log.fechaSalida ? "inactive" : "active"}`} />
                    <div className="feed-content">
                      <div className="feed-title">{log.placa}</div>
                      <div className="feed-sub">{log.ocupante} {log.datosInquilino ? `• ${log.datosInquilino}` : ""}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(log.fechaEntrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin accesos vehiculares recientes.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><ShoppingCart size={16} /> Préstamos de Carritos</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin-condominio/historial?tab=carritos")}>
                Historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {prestamosRecientes && prestamosRecientes.length > 0 ? (
                prestamosRecientes.map((loan) => (
                  <div key={loan.id} className="feed-item">
                    <div className={`feed-dot ${loan.fechaDevolucion ? "inactive" : "warning"}`} />
                    <div className="feed-content">
                      <div className="feed-title">Carrito #{loan.carritoId}</div>
                      <div className="feed-sub">Por: {loan.nombreSolicitante}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(loan.fechaPrestamo).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin préstamos de carritos activos.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Settings size={16} /> Configuración</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin-condominio/mi-condominio")}>
                Ir <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {config ? (
                <>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <div className="summary-value">{config.maxAutos}</div>
                      <div className="summary-label">Máx. Autos</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">{config.maxMotos}</div>
                      <div className="summary-label">Máx. Motos</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">{config.tiempoMaxPrestamoMin}</div>
                      <div className="summary-label">Tiempo Préstamo</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">S/ {Number(config.penalizacionPorMinuto).toFixed(2)}</div>
                      <div className="summary-label">Penalización/min</div>
                    </div>
                  </div>
                  <div className="status-banner success mt-3">
                    <Settings size={16} />
                    Sistema configurado y operativo
                  </div>
                </>
              ) : (
                <div className="status-banner warning">
                  <AlertTriangle size={16} />
                  Sin configuración activa. Algunas funciones pueden no estar disponibles.
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 className="widget-title mb-4">Acceso Rápido</h3>
          <div className="dashboard-grid-3">
            {quickLinks.map((link) => (
              <div key={link.label} className="quick-link-card" onClick={() => navigate(link.path)}>
                <div className={`quick-link-icon ${link.color}`}>
                  <link.icon size={20} />
                </div>
                <div>
                  <div className="quick-link-title">{link.label}</div>
                  <div className="quick-link-sub">{link.sub}</div>
                </div>
                <ArrowRight size={16} className="quick-link-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default ACDashboardPage;
