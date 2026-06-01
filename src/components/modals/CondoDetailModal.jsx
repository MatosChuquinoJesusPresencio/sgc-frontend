import { X, Building2, UserCog, Settings, MapPin, Calendar, Info, AlertTriangle, PlusCircle } from "lucide-react";
import { useData } from "../../hooks/useData";

const CondoDetailModal = ({ show, onHide, condo }) => {
  const { getTable } = useData();

  if (!condo || !show) return null;

  const usuarios = getTable("usuarios");
  const admin = usuarios.find(
    (u) => u.id_condominio === condo.id && u.id_rol === 2,
  );

  const torres = getTable("torres").filter((t) => t.id_condominio === condo.id);
  const torreIds = torres.map((t) => t.id);

  const pisos = getTable("pisos").filter((p) => torreIds.includes(p.id_torre));
  const pisoIds = pisos.map((p) => p.id);

  const aptos = getTable("apartamentos").filter((a) =>
    pisoIds.includes(a.id_piso),
  );
  const usersInCondo = getTable("usuarios").filter(
    (u) => u.id_condominio === condo.id,
  );
  const carts = getTable("carritos_carga").filter(
    (c) => c.id_condominio === condo.id,
  );
  const config = getTable("configuraciones").find(
    (c) => c.id_condominio === condo.id,
  );

  const stats = {
    torres: torres.length,
    pisos: pisos.length,
    apartamentos: aptos.length,
    usuarios: usersInCondo.length,
    carritos: carts.length,
    config,
  };

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="cell-icon primary">
              <Info size={16} />
            </div>
            Detalles del Condominio
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <div className="grid-2" style={{ marginBottom: 16 }}>
            <div className="card" style={{ padding: 20, background: "var(--bg)" }}>
              <h6 className="text-xs fw-bold text-muted mb-3" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                Información General
              </h6>
              <h3 className="fw-bold mb-1">{condo.nombre}</h3>
              <p className="text-secondary mb-3" style={{ fontSize: 14 }}>
                {condo.direccion}, {condo.ciudad}
              </p>
              <div className="flex items-center gap-2 text-muted text-xs">
                <Calendar size={13} /> Registrado el{" "}
                {new Date(condo.fecha_creacion).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </div>

              <div className="mt-4 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
                <h6 className="text-xs fw-bold text-muted mb-2" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                  Administrador Asignado
                </h6>
                {admin ? (
                  <div className="flex items-center gap-3" style={{ padding: 12, background: "var(--bg-card)", borderRadius: "var(--radius)", border: "1px solid var(--border)" }}>
                    <div className="cell-icon primary">
                      <UserCog size={18} />
                    </div>
                    <div className="truncate">
                      <div className="cell-title truncate">{admin.nombre}</div>
                      <div className="cell-sub truncate">{admin.email}</div>
                    </div>
                  </div>
                ) : (
                  <div className="alert alert-warning" style={{ fontSize: 13, padding: "8px 12px" }}>
                    No hay un administrador asignado actualmente.
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="grid-2" style={{ gap: 8 }}>
                <div className="card" style={{ padding: 16, textAlign: "center" }}>
                  <div className="text-accent mb-1"><Building2 size={20} /></div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{stats.torres}</div>
                  <div className="text-xs text-muted fw-bold" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Torres</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: "center" }}>
                  <div className="text-accent mb-1"><MapPin size={20} /></div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{stats.apartamentos}</div>
                  <div className="text-xs text-muted fw-bold" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Aptos.</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: "center" }}>
                  <div className="text-accent mb-1"><UserCog size={20} /></div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{stats.usuarios}</div>
                  <div className="text-xs text-muted fw-bold" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Usuarios</div>
                </div>
                <div className="card" style={{ padding: 16, textAlign: "center" }}>
                  <div className="text-accent mb-1"><PlusCircle size={20} /></div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{stats.carritos}</div>
                  <div className="text-xs text-muted fw-bold" style={{ textTransform: "uppercase", letterSpacing: 0.5 }}>Carritos</div>
                </div>
              </div>
            </div>
          </div>

          {config ? (
            <div className="card" style={{ padding: 20, background: "var(--accent-light)" }}>
              <h6 className="flex items-center gap-2 text-xs fw-bold mb-3" style={{ color: "var(--accent)", textTransform: "uppercase", letterSpacing: 1 }}>
                <Settings size={14} /> Configuración del Sistema
              </h6>
              <div className="grid-4">
                <div>
                  <div className="text-xs text-muted fw-bold mb-1" style={{ textTransform: "uppercase" }}>Máx. Autos</div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{config.max_autos}</div>
                </div>
                <div>
                  <div className="text-xs text-muted fw-bold mb-1" style={{ textTransform: "uppercase" }}>Máx. Motos</div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{config.max_motos}</div>
                </div>
                <div>
                  <div className="text-xs text-muted fw-bold mb-1" style={{ textTransform: "uppercase" }}>Préstamo</div>
                  <div className="fw-800" style={{ fontSize: 20 }}>{config.tiempo_max_prestamo_min} min.</div>
                </div>
                <div>
                  <div className="text-xs text-muted fw-bold mb-1" style={{ textTransform: "uppercase" }}>Penalización</div>
                  <div className="fw-800" style={{ fontSize: 20 }}>S/ {config.penalizacion_por_minuto.toFixed(2)}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-warning flex items-center gap-3" style={{ borderRadius: "var(--radius-lg)", padding: 16 }}>
              <AlertTriangle size={20} />
              <div>
                <h6 className="fw-bold mb-1">Aún no está configurada</h6>
                <p className="text-sm text-secondary mb-0">
                  Este condominio no tiene una configuración del sistema activa.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CondoDetailModal;
