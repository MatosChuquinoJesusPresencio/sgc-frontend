import { AlertTriangle, X } from "lucide-react";

const ConfirmDialog = ({ show, onHide, onConfirm, title, message, confirmText = "Confirmar", Icon = AlertTriangle }) => {
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
          <button className="btn btn-outline" onClick={onHide}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
