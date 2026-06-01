import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShieldCheck,
  Building2,
  Users,
  Car,
  ShoppingCart,
  ArrowRight,
  TrendingUp,
  Activity,
  ClipboardList,
} from "lucide-react";
import { useData } from "../../hooks/useData";
import { useAuth } from "../../hooks/useAuth";
import AnimatedPage from "../../components/animations/AnimatedPage";

const SADashboardPage = () => {
  const navigate = useNavigate();
  const { getTable } = useData();
  const { authUser } = useAuth();

  const condominios = getTable("condominios");
  const usuarios = getTable("usuarios");
  const logsVehicular = getTable("logs_acceso_vehicular");
  const logsCarrito = getTable("logs_prestamo_carrito");
  const torres = getTable("torres");
  const apartamentos = getTable("apartamentos");

  const totalCondominios = condominios.length;
  const totalUsuarios = usuarios.length;
  const totalTorres = torres.length;
  const totalAptos = apartamentos.length;

  const activeVehicles = logsVehicular.filter((l) => !l.fecha_salida).length;
  const activeLoans = logsCarrito.filter((l) => !l.fecha_salida).length;

  const activeUsers = usuarios.filter((u) => u.activo).length;

  const recentCondos = useMemo(
    () => [...condominios].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).slice(0, 4),
    [condominios]
  );

  const recentVehicular = useMemo(
    () => [...logsVehicular].sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada)).slice(0, 5),
    [logsVehicular]
  );

  const recentLoans = useMemo(
    () => [...logsCarrito].sort((a, b) => new Date(b.fecha_entrada) - new Date(a.fecha_entrada)).slice(0, 5),
    [logsCarrito]
  );

  const quickLinks = [
    { label: "Condominios", sub: `${totalCondominios} registrados`, icon: Building2, color: "accent", path: "/super-admin/condominios" },
    { label: "Usuarios", sub: `${activeUsers} activos de ${totalUsuarios}`, icon: Users, color: "success", path: "/super-admin/usuarios" },
    { label: "Apartamentos", sub: `${totalAptos} en total`, icon: Building2, color: "info", path: "/super-admin/apartamentos" },
    { label: "Historial", sub: "Accesos y préstamos", icon: ClipboardList, color: "warning", path: "/super-admin/historial" },
  ];

  return (
    <AnimatedPage>
      <div className="page-container">
        <div className="greeting-banner">
          <h1>Panel de Control Global</h1>
          <p>Bienvenido, {authUser?.nombre || "Administrador"}. Control total de la plataforma.</p>
        </div>

        <div className="grid grid-4 gap-4 mb-5">
          <div className="stat-card">
            <div className="stat-icon accent"><Building2 size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Condominios</div>
              <div className="stat-value">{totalCondominios}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Users size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Usuarios Activos</div>
              <div className="stat-value">{activeUsers}</div>
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
              <div className="stat-value">{activeLoans}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Building2 size={16} /> Condominios Recientes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/super-admin/condominios")}>
                Ver todos <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {recentCondos.length > 0 ? (
                recentCondos.map((c) => (
                  <div key={c.id} className="feed-item">
                    <div className="feed-dot accent" />
                    <div className="feed-content">
                      <div className="feed-title">{c.nombre}</div>
                      <div className="feed-sub">{c.ciudad}, {c.pais}</div>
                    </div>
                    <div className="feed-meta">{new Date(c.fecha_creacion).toLocaleDateString()}</div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">No hay condominios registrados.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Activity size={16} /> Accesos Vehiculares Recientes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/super-admin/historial?tab=estacionamiento")}>
                Ver historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {recentVehicular.length > 0 ? (
                recentVehicular.map((log) => (
                  <div key={log.id} className="feed-item">
                    <div className={`feed-dot ${log.fecha_salida ? "inactive" : "active"}`} />
                    <div className="feed-content">
                      <div className="feed-title">{log.placa}</div>
                      <div className="feed-sub">{log.metodo}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(log.fecha_entrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin actividad vehicular reciente.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><ShoppingCart size={16} /> Préstamos de Carritos</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/super-admin/historial?tab=carritos")}>
                Ver historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {recentLoans.length > 0 ? (
                recentLoans.map((loan) => (
                  <div key={loan.id} className="feed-item">
                    <div className={`feed-dot ${loan.fecha_salida ? "inactive" : "warning"}`} />
                    <div className="feed-content">
                      <div className="feed-title">Carrito #{loan.id_carrito}</div>
                      <div className="feed-sub">Solicitante: {loan.solicitante}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(loan.fecha_entrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin préstamos activos.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><TrendingUp size={16} /> Resumen del Sistema</span>
            </div>
            <div className="widget-body">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{totalCondominios}</div>
                  <div className="summary-label">Condominios</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalTorres}</div>
                  <div className="summary-label">Torres</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalAptos}</div>
                  <div className="summary-label">Apartamentos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{totalUsuarios}</div>
                  <div className="summary-label">Usuarios</div>
                </div>
              </div>
            </div>
            <div style={{ padding: "12px 20px", borderTop: "1px solid var(--border)" }}>
              <button className="btn btn-primary w-full" onClick={() => navigate("/super-admin/condominios")}>
                Ir a Gestión de Condominios <ArrowRight size={14} />
              </button>
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

export default SADashboardPage;
