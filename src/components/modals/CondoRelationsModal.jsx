import { X, AlertTriangle } from "lucide-react";

const CondoRelationsModal = ({ show, onHide, condoName, relations }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="auth-success-icon warning">
              <AlertTriangle size={20} />
            </div>
            No se puede eliminar
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p className="text-secondary" style={{ fontSize: 14 }}>
            El condominio <strong>{condoName}</strong> no puede ser eliminado porque tiene las siguientes relaciones activas:
          </p>
          <div className="flex flex-col gap-2" style={{ marginTop: 12 }}>
            {relations.map((rel, i) => (
              <div key={i} className="flex items-center gap-2" style={{ padding: "8px 12px", background: "var(--bg)", borderRadius: "var(--radius-sm)" }}>
                <span className="text-sm">{rel}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onHide}>Entendido</button>
        </div>
      </div>
    </div>
  );
};

export default CondoRelationsModal;
