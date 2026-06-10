import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";

import { verificarEmail } from "../../services/authService";

const VerificarEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token de verificación no proporcionado.");
      return;
    }

    const verificar = async () => {
      try {
        await verificarEmail(token);
        setStatus("success");
        setMessage("¡Correo electrónico verificado exitosamente!");
      } catch (err) {
        setStatus("error");
        setMessage(err.message || "El enlace de verificación es inválido o ha expirado.");
      }
    };

    verificar();
  }, [token]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="card" style={{ maxWidth: 480, width: "100%", margin: "1rem", textAlign: "center" }}>
        <div className="card-body" style={{ padding: "3rem 2rem" }}>
          {status === "loading" && (
            <>
              <Loader size={48} className="spinner" style={{ color: "var(--primary)", marginBottom: "1rem" }} />
              <h4>Verificando correo electrónico...</h4>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle size={48} style={{ color: "var(--success)", marginBottom: "1rem" }} />
              <h4>{message}</h4>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>
                Tu correo ha sido actualizado correctamente.
              </p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
                Ir al inicio de sesión
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle size={48} style={{ color: "var(--danger)", marginBottom: "1rem" }} />
              <h4>Error de verificación</h4>
              <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem" }}>{message}</p>
              <Link to="/login" className="btn btn-primary" style={{ marginTop: "1.5rem", display: "inline-block" }}>
                Volver al inicio
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificarEmailPage;
