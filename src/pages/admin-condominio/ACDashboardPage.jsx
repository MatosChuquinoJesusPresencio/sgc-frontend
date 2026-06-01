import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  Car,
  ShoppingCart,
  GitBranch,
  Layers,
  ArrowRight,
  Activity,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { useData } from "../../hooks/useData";
import { useAuth } from "../../hooks/useAuth";
import AnimatedPage from "../../components/animations/AnimatedPage";
import NoCondoWarning from "../../components/ui/NoCondoWarning";

const ACDashboardPage = () => {
  const navigate = useNavigate();
  const { getTable } = useData();
  const { authUser } = useAuth();

  const apartamentos = getTable("apartamentos");
  const usuarios = getTable("usuarios");
  const logs_acceso_vehicular = getTable("logs_acceso_vehicular");
  const logs_prestamo_carrito = getTable("logs_prestamo_carrito");
  const condominios = getTable("condominios");
  const configuraciones = getTable("configuraciones");

  const currentCondoId = authUser?.id_condominio;
  const condominio = condominios.find((c) => c.id === currentCondoId);

  const config = useMemo(
    () => configuraciones.find((c) => c.id_condominio === currentCondoId),
    [configuraciones, currentCondoId],
  );

  if (!condominio) return <NoCondoWarning />;

  const torres = getTable("torres").filter((t) => t.id_condominio === currentCondoId);
  const torresIds = torres.map((t) => t.id);
  const allPisos = getTable("pisos").filter((p) => torresIds.includes(p.id_torre));
  const pisosIds = allPisos.map((p) => p.id);
  const aptosCondo = apartamentos.filter((a) => pisosIds.includes(a.id_piso));
  const aptosIds = aptosCondo.map((a) => a.id);
  const estacionamientos = getTable("estacionamientos").filter((e) => aptosIds.includes(e.id_apartamento));
  const estIds = estacionamientos.map((e) => e.id);

  const condoUsers = usuarios.filter((u) => u.id_condominio === currentCondoId);
  const totalPropietarios = condoUsers.filter((u) => u.id_rol === 3).length;
  const totalSeguridad = condoUsers.filter((u) => u.id_rol === 4).length;

  const filteredVehiculoLogs = logs_acceso_vehicular.filter((log) => estIds.includes(log.id_estacionamiento));
  const filteredCarritoLogs = logs_prestamo_carrito.filter((log) => aptosIds.includes(log.id_apartamento));

  const activeVehicles = filteredVehiculoLogs.filter((l) => !l.fecha_salida).length;
  const activeCarLoans = filteredCarritoLogs.filter((l) => !l.fecha_salida).length;

  const recentAccess = useMemo(
    () => [...filteredVehiculoLogs].sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada)).slice(0, 5),
    [filteredVehiculoLogs]
  );

  const recentLoans = useMemo(
    () => [...filteredCarritoLogs].sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada)).slice(0, 5),
    [filteredCarritoLogs]
  );

  const totalEstacionamientos = estacionamientos.length;
  const ocupados = estacionamientos.filter((e) => e.cantidad_vehiculos > 0).length;
  const pctOcupacion = totalEstacionamientos > 0 ? Math.round((ocupados / totalEstacionamientos) * 100) : 0;

  const quickLinks = [
    { label: "Infraestructura", sub: `${torres.length} torres, ${allPisos.length} pisos`, icon: GitBranch, color: "accent", path: "/admin-condominio/infraestructura" },
    { label: "Usuarios", sub: `${condoUsers.length} registrados`, icon: Users, color: "success", path: "/admin-condominio/usuarios" },
    { label: "Apartamentos", sub: `${aptosCondo.length} unidades`, icon: Home, color: "info", path: "/admin-condominio/apartamentos" },
    { label: "Estacionamientos", sub: `${ocupados}/${totalEstacionamientos} ocupados`, icon: Car, color: "warning", path: "/admin-condominio/estacionamientos" },
    { label: "Carritos", sub: `${activeCarLoans} en uso`, icon: ShoppingCart, color: "danger", path: "/admin-condominio/carritos" },
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
              <div className="stat-value">{aptosCondo.length}</div>
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
              <div className="stat-value">{activeVehicles}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Carritos en Uso</div>
              <div className="stat-value">{activeCarLoans}</div>
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
                  <div className="summary-value">{torres.length}</div>
                  <div className="summary-label">Torres</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{allPisos.length}</div>
                  <div className="summary-label">Pisos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{aptosCondo.length}</div>
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
              {recentAccess.length > 0 ? (
                recentAccess.map((log) => (
                  <div key={log.id} className="feed-item">
                    <div className={`feed-dot ${log.fecha_salida ? "inactive" : "active"}`} />
                    <div className="feed-content">
                      <div className="feed-title">{log.placa}</div>
                      <div className="feed-sub">{log.tipo_ocupante} {log.datos_inquilino ? `• ${log.datos_inquilino}` : ""}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(log.fecha_entrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              {recentLoans.length > 0 ? (
                recentLoans.map((loan) => (
                  <div key={loan.id} className="feed-item">
                    <div className={`feed-dot ${loan.fecha_salida ? "inactive" : "warning"}`} />
                    <div className="feed-content">
                      <div className="feed-title">Carrito #{loan.id_carrito}</div>
                      <div className="feed-sub">Por: {loan.solicitante}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(loan.fecha_entrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                      <div className="summary-value">{config.max_autos}</div>
                      <div className="summary-label">Máx. Autos</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">{config.max_motos}</div>
                      <div className="summary-label">Máx. Motos</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">{config.tiempo_max_prestamo_min}</div>
                      <div className="summary-label">Tiempo Préstamo</div>
                    </div>
                    <div className="summary-item">
                      <div className="summary-value">S/ {config.penalizacion_por_minuto.toFixed(2)}</div>
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
