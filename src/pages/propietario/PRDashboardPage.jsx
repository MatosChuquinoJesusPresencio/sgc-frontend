import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Car,
  ShoppingCart,
  Users,
  ArrowRight,
  Activity,
  Loader2,
} from "lucide-react";
import { propietarioService } from "../../services/propietarioService";
import { useAuth } from "../../hooks/useAuth";
import AnimatedPage from "../../components/animations/AnimatedPage";

const PRDashboardPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const summary = await propietarioService.getDashboardSummary();
        setData(summary);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentUser = authUser || { nombres: "Usuario", id: 0 };
  const userName = currentUser.nombres || currentUser.nombre || "Usuario";

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const myApartments = data?.apartamentos || [];
  const myVehicles = data?.vehiculos || [];
  const myTenants = data?.inquilinos || [];
  const activeLoan = data?.prestamoActivo;
  const myRecentAccess = data?.accesosRecientes || [];
  const myLoans = data?.prestamos || [];

  const myApartmentsWithDetails = myApartments.map((apt) => ({
    ...apt,
    vehicles: apt.cantidadVehiculos || 0,
    tenants: apt.cantidadInquilinos || 0,
  }));

  const quickLinks = [
    { label: "Mi Apartamento", sub: myApartments.length > 0 ? `${myApartments.length} unidad(es)` : "Ver detalles", icon: Home, color: "accent", path: "/propietario/mi-apartamento" },
    { label: "Veh\u00edculos", sub: `${myVehicles.length} registrado(s)`, icon: Car, color: "success", path: "/propietario/vehiculos" },
    { label: "Carritos", sub: activeLoan ? "1 pr\u00e9stamo activo" : "Solicitar carrito", icon: ShoppingCart, color: activeLoan ? "warning" : "info", path: "/propietario/carritos" },
    { label: "Historial", sub: "Accesos y pr\u00e9stamos", icon: Activity, color: "info", path: "/propietario/historial" },
  ];

  return (
    <AnimatedPage>
      <div className="page-container">
        <div className="greeting-banner">
          <h1>¡Hola, {userName.split(" ")[0]}!</h1>
          <p>Bienvenido a tu portal personal de residente.</p>
        </div>

        <div className="grid grid-4 gap-4 mb-5">
          <div className="stat-card">
            <div className="stat-icon accent"><Home size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Mis Propiedades</div>
              <div className="stat-value">{myApartments.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Mis Vehículos</div>
              <div className="stat-value">{myVehicles.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><Users size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Inquilinos</div>
              <div className="stat-value">{myTenants.length}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className={`stat-icon ${activeLoan ? "warning" : "info"}`}>
              <ShoppingCart size={20} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Préstamo Activo</div>
              <div className="stat-value">{activeLoan ? 1 : 0}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid-2">
          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Home size={16} /> Mis Unidades</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/propietario/mi-apartamento")}>
                Gestionar <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {myApartmentsWithDetails.length > 0 ? (
                myApartmentsWithDetails.map((apt) => (
                  <div key={apt.id} className="feed-item">
                    <div className="feed-dot accent" />
                    <div className="feed-content">
                      <div className="feed-title">Apartamento {apt.numero}</div>
                      <div className="feed-sub">{apt.metraje} m² • {apt.vehicles} vehículo(s) • {apt.tenants} inquilino(s)</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">No tienes propiedades asignadas.</div>
              )}
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Activity size={16} /> Accesos Recientes</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/propietario/historial?tab=estacionamiento")}>
                Ver historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {myRecentAccess.length > 0 ? (
                myRecentAccess.map((log) => (
                  <div key={log.id} className="feed-item">
                    <div className={`feed-dot ${log.fechaSalida || log.fecha_salida ? "inactive" : "active"}`} />
                    <div className="feed-content">
                      <div className="feed-title">{log.placa}</div>
                      <div className="feed-sub">{log.metodo || ""}</div>
                    </div>
                    <div className="feed-meta">
                      {new Date(log.fechaEntrada || log.fecha_entrada).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/propietario/historial?tab=carritos")}>
                Ver historial <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {activeLoan ? (
                <div className="status-banner warning mb-3">
                  <ShoppingCart size={16} />
                  Tienes un carrito prestado actualmente
                </div>
              ) : null}
              {myLoans.length > 0 ? (
                myLoans.slice(0, 5).map((loan) => (
                  <div key={loan.id} className="feed-item">
                    <div className={`feed-dot ${loan.fechaSalida || loan.fecha_salida ? "inactive" : "warning"}`} />
                    <div className="feed-content">
                      <div className="feed-title">Carrito #{loan.idCarrito || loan.id_carrito}</div>
                      <div className="feed-sub">
                        {loan.fechaSalida || loan.fecha_salida ? "Devuelto" : "En uso"} • {new Date(loan.fechaEntrada || loan.fecha_entrada).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="feed-meta">
                      {loan.fechaSalida || loan.fecha_salida
                        ? new Date(loan.fechaSalida || loan.fecha_salida).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                        : "En curso"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">Sin préstamos de carritos.</div>
              )}
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary w-full" onClick={() => navigate("/propietario/carritos")}>
                  {activeLoan ? "Gestionar Pr\u00e9stamo" : "Solicitar Carrito"} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="widget-card">
            <div className="widget-header">
              <span className="widget-title"><Users size={16} /> Mis Inquilinos</span>
              <button className="btn btn-ghost btn-sm" onClick={() => navigate("/propietario/mi-apartamento")}>
                Gestionar <ArrowRight size={14} />
              </button>
            </div>
            <div className="widget-body">
              {myTenants.length > 0 ? (
                myTenants.map((t) => (
                  <div key={t.id} className="feed-item">
                    <div className="feed-dot info" />
                    <div className="feed-content">
                      <div className="feed-title">{t.nombre}</div>
                      <div className="feed-sub">DNI: {t.dni}</div>
                    </div>
                    <div className="feed-meta">
                      Apto {t.numeroApartamento || "-"}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-feed">No tienes inquilinos registrados.</div>
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

export default PRDashboardPage;
