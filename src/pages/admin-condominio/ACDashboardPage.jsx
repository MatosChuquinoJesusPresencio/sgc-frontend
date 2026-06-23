import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { adminCondominioService } from "../../services/adminCondominioService";
import AnimatedPage from "../../components/animations/AnimatedPage";

const ACDashboardPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [condominioInfo, setCondominioInfo] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [metricsData, infoData] = await Promise.all([
          adminCondominioService.getDashboardMetrics(),
          adminCondominioService.getMyCondominiumInfo(),
        ]);
        setMetrics(metricsData);
        setCondominioInfo(infoData);
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

  const totalTorres = metrics?.totalTorres ?? 0;
  const totalPisos = metrics?.totalPisos ?? 0;
  const totalApartamentos = metrics?.totalApartamentos ?? 0;
  const totalPropietarios = metrics?.totalPropietarios ?? 0;
  const totalAgentes = metrics?.totalAgentes ?? 0;
  const totalVehiculos = metrics?.totalVehiculos ?? 0;
  const totalCarritos = metrics?.totalCarritos ?? 0;

  const nombreCondo = condominioInfo?.nombre || "Mi Condominio";

  const quickLinks = [
    { label: "Infraestructura", sub: `${totalTorres} torres, ${totalPisos} pisos`, icon: GitBranch, color: "accent", path: "/admin-condominio/infraestructura" },
    { label: "Usuarios", sub: `${totalPropietarios + totalAgentes} registrados`, icon: Users, color: "success", path: "/admin-condominio/usuarios" },
    { label: "Apartamentos", sub: `${totalApartamentos} unidades`, icon: Home, color: "info", path: "/admin-condominio/apartamentos" },
    { label: "Carritos", sub: `${totalCarritos} registrados`, icon: ShoppingCart, color: "warning", path: "/admin-condominio/carritos" },
    { label: "Mi Condominio", sub: "Configuraci\u00f3n", icon: Building2, color: "info", path: "/admin-condominio/mi-condominio" },
  ];

  return (
    <AnimatedPage>
      <div className="page-container">
        <div className="greeting-banner">
          <h1>{nombreCondo}</h1>
          <p>Bienvenido, {authUser?.nombre || "Admin"}. Gesti\u00f3n operativa de tu condominio.</p>
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
              <div className="stat-label">Veh\u00edculos</div>
              <div className="stat-value">{totalVehiculos}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Carritos</div>
              <div className="stat-value">{totalCarritos}</div>
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
                  <div className="summary-value">{totalVehiculos}</div>
                  <div className="summary-label">Estacionamientos</div>
                </div>
              </div>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Building2 size={16} /> Mi Condominio</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/admin-condominio/mi-condominio")}>
                Ir <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              <div className="summary-grid">
                <div className="summary-item">
                  <div className="summary-value">{condominioInfo?.maxAutos ?? "-"}</div>
                  <div className="summary-label">M\u00e1x. Autos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{condominioInfo?.maxMotos ?? "-"}</div>
                  <div className="summary-label">M\u00e1x. Motos</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">{condominioInfo?.maxTiempoPrestamoMin ?? "-"}</div>
                  <div className="summary-label">Tiempo Pr\u00e9stamo</div>
                </div>
                <div className="summary-item">
                  <div className="summary-value">S/ {condominioInfo?.penalizacionPorMin?.toFixed(2) ?? "-"}</div>
                  <div className="summary-label">Penalizaci\u00f3n/min</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20 }}>
          <h3 className="widget-title mb-4">Acceso R\u00e1pido</h3>
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
