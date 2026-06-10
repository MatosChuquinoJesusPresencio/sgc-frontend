import { AlertTriangle, X, Loader2 } from "lucide-react";

const ConfirmDialog = ({ show, onHide, onConfirm, title, message, confirmText = "Confirmar", Icon = AlertTriangle, actionLoading }) => {
  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onHide}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <div className="auth-success-icon warning">
              <Icon size={20} />
            </div>
            {title}
          </div>
          <button className="modal-close" onClick={onHide}>
            <X size={16} />
          </button>
        </div>
        <div className="modal-body">
          <p className="text-secondary" style={{ fontSize: 14 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onHide} disabled={actionLoading}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={actionLoading}>
            {actionLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : null}
            {actionLoading ? "Eliminando..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
