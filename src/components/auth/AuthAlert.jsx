import { AlertTriangle, CheckCircle } from "lucide-react";

const AuthAlert = ({ type, message, onClose }) => {
  const Icon = type === "danger" ? AlertTriangle : CheckCircle;

  return (
    <div className={`alert alert-${type === "danger" ? "danger" : "success"}`}>
      <Icon size={16} />
      <span>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer", fontSize: "16px", lineHeight: 1 }}
        >
          ×
        </button>
      )}
    </div>
  );
};

export default AuthAlert;
