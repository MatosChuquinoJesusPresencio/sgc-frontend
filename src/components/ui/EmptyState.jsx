import { Inbox } from "lucide-react";

const EmptyState = ({
  message = "No hay registros encontrados",
  icon: Icon = Inbox,
}) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon size={32} />
      </div>
      <div className="empty-state-text">{message}</div>
    </div>
  );
};

export default EmptyState;
