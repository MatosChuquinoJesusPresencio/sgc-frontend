import AnimatedPage from "../animations/AnimatedPage";
import { AlertTriangle } from "lucide-react";

const NoCondoWarning = () => {
  return (
    <AnimatedPage>
      <div className="page-container flex items-center justify-center">
        <div className="card" style={{ maxWidth: "500px", width: "100%", padding: 40, textAlign: "center" }}>
          <div className="auth-success-icon warning" style={{ margin: "0 auto 16px" }}>
            <AlertTriangle size={28} />
          </div>
          <h3 className="fw-bold mb-2">Sin condominio asignado</h3>
          <p className="text-secondary" style={{ fontSize: 14 }}>
            Actualmente no tienes un condominio bajo tu administración. Contacta
            con el Super Administrador para que se te asigne uno.
          </p>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default NoCondoWarning;
