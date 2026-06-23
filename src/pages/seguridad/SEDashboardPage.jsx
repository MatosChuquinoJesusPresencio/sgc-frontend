import { useState, useEffect } from "react";
import { Car, ShoppingCart, Activity, ShieldCheck, Loader2 } from "lucide-react";
import { securityService } from "../../services/securityService";
import { useAuth } from "../../hooks/useAuth";
import AnimatedPage from "../../components/animations/AnimatedPage";

const SEDashboardPage = () => {
  const { authUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const status = await securityService.getDashboardStatus();
        setData(status);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentUser = authUser || { nombres: "Agente", id: 0 };
  const userName = currentUser.nombres || currentUser.nombre || "Agente";

  if (loading) {
    return (
      <AnimatedPage>
        <div className="page-container flex items-center justify-center" style={{ minHeight: 300 }}>
          <Loader2 size={32} className="spinner" />
        </div>
      </AnimatedPage>
    );
  }

  const totalSlots = data?.totalEstacionamientos ?? 0;
  const occupiedSlots = data?.estacionamientosOcupados ?? 0;
  const activeLoans = data?.prestamosActivos ?? 0;
  const recentMovements = data?.movimientosRecientes ?? [];

  return (
    <AnimatedPage>
      <div className="page-container">
        <div className="greeting-banner">
          <h1>Panel de Seguridad</h1>
          <p>Bienvenido, {userName.split(" ")[0]}. Control de acceso y vigilancia del condominio.</p>
        </div>

        <div className="grid grid-4 gap-4 mb-5">
          <div className="stat-card">
            <div className="stat-icon accent"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Estacionamientos</div>
              <div className="stat-value">{totalSlots}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon warning"><Car size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Ocupados</div>
              <div className="stat-value">{occupiedSlots}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon success"><ShoppingCart size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Préstamos Activos</div>
              <div className="stat-value">{activeLoans}</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon info"><ShieldCheck size={20} /></div>
            <div className="stat-content">
              <div className="stat-label">Disponibles</div>
              <div className="stat-value">{totalSlots - occupiedSlots}</div>
            </div>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-header">
            <span className="widget-title"><Activity size={16} /> Movimientos Recientes</span>
          </div>
          <div className="widget-body">
            {recentMovements.length > 0 ? (
              recentMovements.map((mov) => (
                <div key={mov.id} className="feed-item">
                  <div className={`feed-dot ${mov.tipo === "ENTRADA" ? "active" : "inactive"}`} />
                  <div className="feed-content">
                    <div className="feed-title">{mov.descripcion}</div>
                    <div className="feed-sub">{mov.tipo}</div>
                  </div>
                  <div className="feed-meta">
                    {mov.fecha ? new Date(mov.fecha).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-"}
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed">Sin movimientos recientes.</div>
            )}
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default SEDashboardPage;
