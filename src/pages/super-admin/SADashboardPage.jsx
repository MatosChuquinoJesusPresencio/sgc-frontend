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
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { superAdminService } from "../../services/superAdminService";
import AnimatedPage from "../../components/animations/AnimatedPage";

const SADashboardPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [recentCondos, setRecentCondos] = useState([]);
  const [recentAdmins, setRecentAdmins] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, condosData, adminsData] = await Promise.all([
          superAdminService.getDashboardMetrics(),
          superAdminService.getRecentCondos(),
          superAdminService.getRecentAdmins(),
        ]);
        setMetrics(metricsData);
        setRecentCondos(condosData || []);
        setRecentAdmins(adminsData || []);
      } catch (err) {
        setError(err.message || "Error al cargar el dashboard.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  if (error) {
    return (
      <AnimatedPage>
        <div className="page-container">
          <div className="alert alert-danger">{error}</div>
        </div>
      </AnimatedPage>
    );
  }

  const totalCondominios = metrics?.totalCondominios ?? 0;
  const condominiosActivos = metrics?.condominiosActivos ?? 0;
  const totalAdmins = metrics?.totalAdministradores ?? 0;
  const totalPropietarios = metrics?.totalPropietarios ?? 0;
  const totalAgentes = metrics?.totalAgentes ?? 0;
  const totalUsuarios = metrics?.totalUsuarios ?? 0;

  const quickLinks = [
    { label: "Condominios", sub: `${condominiosActivos} activos de ${totalCondominios}`, icon: Building2, color: "accent", path: "/super-admin/condominios" },
    { label: "Usuarios", sub: `${totalUsuarios} registrados`, icon: Users, color: "success", path: "/super-admin/usuarios" },
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
              <div className="stat-label">Administradores</div>
              <div className="stat-value">{totalAdmins}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Propietarios</div>
              <div className="stat-value">{totalPropietarios}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Agentes Seguridad</div>
              <div className="stat-value">{totalAgentes}</div>
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
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">No hay condominios registrados.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Users size={16} /> Administradores Recientes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/super-admin/usuarios")}>
                Ver todos <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {recentAdmins.length > 0 ? (
                recentAdmins.map((a) => (
                  <div key={a.id} className="feed-item">
                    <div className="feed-dot success" />
                    <div className="feed-content">
                      <div className="feed-title">{a.nombres} {a.apellidos}</div>
                      <div className="feed-sub">{a.correo}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">No hay administradores registrados.</div>
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
                    <div className="summary-value">{condominiosActivos}</div>
                    <div className="summary-label">Activos</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-value">{totalUsuarios}</div>
                    <div className="summary-label">Usuarios</div>
                  </div>
                  <div className="summary-item">
                    <div className="summary-value">{totalPropietarios}</div>
                    <div className="summary-label">Propietarios</div>
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
