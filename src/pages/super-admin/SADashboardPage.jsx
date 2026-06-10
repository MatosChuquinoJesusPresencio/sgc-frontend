import { useState, useEffect } from "react";
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
import { useAuth } from "../../hooks/useAuth";
import { getSuperAdminDashboard } from "../../services/dashboardService";
import AnimatedPage from "../../components/animations/AnimatedPage";

const SADashboardPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = () => {
    setLoading(true);
    setError(null);
    getSuperAdminDashboard()
      .then(setDashboardData)
      .catch(setError)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="greeting-banner">
            <h1>Panel de Control Global</h1>
            <p>Bienvenido, {authUser?.nombre || "Administrador"}. Cargando datos...</p>
          </div>
          <div className="grid grid-4 gap-4 mb-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="stat-card">
                <div className="stat-content">
                  <div className="skeleton" style={{ height: 32, width: 80 }} />
                  <div className="skeleton" style={{ height: 16, width: 120, marginTop: 8 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="greeting-banner">
            <h1>Panel de Control Global</h1>
            <p>Error al cargar el dashboard.</p>
          </div>
          <div className="alert alert-danger">
            <span>{error.message || "Error de conexión con el servidor."}</span>
            <button className="btn btn-primary mt-3" onClick={fetchDashboard}>
              Reintentar
            </button>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  if (!dashboardData) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="greeting-banner">
            <h1>Panel de Control Global</h1>
            <p>No hay datos disponibles.</p>
          </div>
        </div>
      </AnimatedPage>
    );
  }

  const {
    totalCondominios,
    totalUsuarios,
    totalTorres,
    totalPrestamos,
    totalAccesos,
    usuariosActivos,
    condominiosRecientes,
    actividadPorCondominio,
  } = dashboardData;

  const quickLinks = [
    { label: "Condominios", sub: `${totalCondominios} registrados`, icon: Building2, color: "accent", path: "/super-admin/condominios" },
    { label: "Usuarios", sub: `${usuariosActivos} activos de ${totalUsuarios}`, icon: Users, color: "success", path: "/super-admin/usuarios" },
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
              <div className="stat-value">{usuariosActivos}</div>
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
              {condominiosRecientes?.length > 0 ? (
                condominiosRecientes.map((c) => (
                  <div key={c.id} className="feed-item">
                    <div className="feed-dot accent" />
                    <div className="feed-content">
                      <div className="feed-title">{c.nombre}</div>
                      <div className="feed-sub">{c.ciudad}, {c.pais}</div>
                    </div>
                    <div className="feed-meta">{new Date(c.fechaCreacion).toLocaleDateString()}</div>
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
              {actividadPorCondominio?.length > 0 ? (
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
