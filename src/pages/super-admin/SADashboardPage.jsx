import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  Users,
  ShoppingCart,
  Car,
  ArrowRight,
  TrendingUp,
  Activity,
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

  const totalCondominios = condominios.length;
  const totalUsuarios = usuarios.length;
  const totalTorres = torres.length;
  const totalPrestamos = logsCarrito.length;
  const totalAccesos = logsVehicular.length;

  const activeUsers = usuarios.filter((u) => u.activo).length;

  const recentCondos = useMemo(
    () => [...condominios].sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion)).slice(0, 4),
    [condominios]
  );

  const actividadPorCondominio = useMemo(() => {
    return condominios.map((condo) => {
      const torresCondo = torres.filter((t) => t.id_condominio === condo.id);
      const torreIds = torresCondo.map((t) => t.id);
      const pisosCondo = getTable("pisos").filter((p) => torreIds.includes(p.id_torre));
      const pisoIds = pisosCondo.map((p) => p.id);
      const aptosCondo = getTable("apartamentos").filter((a) => pisoIds.includes(a.id_piso));
      const aptoIds = aptosCondo.map((a) => a.id);

      const carritoOps = logsCarrito.filter((l) => aptoIds.includes(l.id_apartamento)).length;
      const accesoOps = logsVehicular.filter((l) => {
        const est = getTable("estacionamientos").find((e) => e.id === l.id_estacionamiento);
        return est && aptoIds.includes(est.id_apartamento);
      }).length;

      return { ...condo, carritoOps, accesoOps, totalOps: carritoOps + accesoOps };
    }).sort((a, b) => b.totalOps - a.totalOps).slice(0, 5);
  }, [condominios, torres, logsCarrito, logsVehicular]);

  const quickLinks = [
    { label: "Condominios", sub: `${totalCondominios} registrados`, icon: Building2, color: "accent", path: "/super-admin/condominios" },
    { label: "Usuarios", sub: `${activeUsers} activos de ${totalUsuarios}`, icon: Users, color: "success", path: "/super-admin/usuarios" },
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
            <div className="stat-icon warning"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Préstamos</div>
              <div className="stat-value">{totalPrestamos}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Accesos Vehiculares</div>
              <div className="stat-value">{totalAccesos}</div>
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
              <span className="widget-title"><Activity size={16} /> Actividad por Condominio</span>
            </div>
            <div className="widget-body">
              {actividadPorCondominio.length > 0 ? (
                actividadPorCondominio.map((c) => (
                  <div key={c.id} className="feed-item">
                    <div className="feed-dot info" />
                    <div className="feed-content">
                      <div className="feed-title">{c.nombre}</div>
                      <div className="feed-sub">{c.carritoOps} préstamos · {c.accesoOps} accesos</div>
                    </div>
                    <div className="feed-meta">{c.totalOps} ops</div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin actividad registrada.</div>
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
                    <div className="summary-value">{totalUsuarios}</div>
                    <div className="summary-label">Usuarios</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-value">{totalPrestamos + totalAccesos}</div>
                    <div className="summary-label">Operaciones</div>
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
