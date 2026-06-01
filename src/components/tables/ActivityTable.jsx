import { ShoppingCart, Car, Clock, User, Home, Building2, CalendarDays } from "lucide-react";
import EmptyState from "../ui/EmptyState";

const ActivityTable = ({ data, type = "carritos", showCondo = false }) => {
  const formatDateTime = (isoString) => {
    if (!isoString) return "---";
    const date = new Date(isoString);
    return date.toLocaleString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (type === "carritos") {
    return (
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {showCondo && <th>Condominio</th>}
              <th>Unidad</th>
              <th>Carrito</th>
              <th>Solicitante</th>
              <th>Entrada</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((log) => (
                <tr key={log.id}>
                  {showCondo && (
                    <td>
                      <span className="fw-medium">{log.condoNombre || "N/A"}</span>
                    </td>
                  )}
                  <td>
                    <div className="flex items-center gap-1 text-sm">
                      <Home size={13} className="text-muted" />
                      {log.aptoNumero || log.id_apartamento}
                    </div>
                  </td>
                  <td>
                    <span className="fw-medium">{log.carritoNombre || `Carrito ${log.id_carrito}`}</span>
                  </td>
                  <td>
                    <span className="text-secondary flex items-center gap-1">
                      <User size={12} /> {log.usuarioNombre || log.solicitante}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-muted flex items-center gap-1">
                      <Clock size={12} /> {formatDateTime(log.fecha_entrada)}
                    </span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${log.fecha_salida ? "badge-success" : "badge-warning"}`}>
                      {log.fecha_salida ? "Devuelto" : "En uso"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showCondo ? 6 : 5}>
                  <EmptyState message="No hay registros de carritos." icon={ShoppingCart} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="data-table-scroll">
      <table className="data-table">
        <thead>
          <tr>
            {showCondo && <th>Condominio</th>}
            <th>Vehículo / Placa</th>
            <th className="text-center">Espacio</th>
            <th>Entrada</th>
            <th>Salida</th>
            <th className="text-center">Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((log) => (
              <tr key={log.id}>
                {showCondo && (
                  <td>
                    <span className="fw-medium">{log.condoNombre || "N/A"}</span>
                  </td>
                )}
                <td>
                  <div className="fw-medium">{log.placa}</div>
                  <div className="cell-sub">{log.vehiculoInfo}</div>
                </td>
                <td className="text-center">
                  <span className="badge badge-neutral">{log.estacionamientoNumero || log.id_estacionamiento}</span>
                </td>
                <td>
                  <span className="text-xs text-muted flex items-center gap-1">
                    <CalendarDays size={12} /> {formatDateTime(log.fecha_entrada)}
                  </span>
                </td>
                <td>
                  <span className="text-xs text-muted">
                    {log.fecha_salida ? formatDateTime(log.fecha_salida) : "---"}
                  </span>
                </td>
                <td className="text-center">
                  <span className={`badge ${log.fecha_salida ? "badge-neutral" : "badge-info"}`}>
                    {log.fecha_salida ? "Fuera" : "En recinto"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={showCondo ? 6 : 5}>
                <EmptyState message="No hay registros de acceso vehicular." icon={Car} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ActivityTable;
