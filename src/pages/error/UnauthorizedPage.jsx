import { Link } from "react-router-dom";
import AnimatedPage from "../../components/animations/AnimatedPage";
import { ShieldOff } from "lucide-react";

const UnauthorizedPage = () => {
    return (
        <AnimatedPage>
            <div className="login-page">
                <div className="login-card" style={{ textAlign: "center" }}>
                    <div className="auth-success-icon warning" style={{ margin: "0 auto 16px" }}>
                        <ShieldOff size={28} />
                    </div>
                    <h1 className="fw-800" style={{ fontSize: 48, letterSpacing: -2 }}>403</h1>
                    <h3 className="fw-bold mb-2">Acceso no autorizado</h3>
                    <p className="text-secondary mb-5">
                        No tienes permisos para acceder a esta sección del sistema.
                    </p>
                    <Link to="/" className="btn btn-primary w-full">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        </AnimatedPage>
    );
};

export default UnauthorizedPage;
