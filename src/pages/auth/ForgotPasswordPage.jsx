import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import AnimatedPage from "../../components/animations/AnimatedPage";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/auth/AuthCard";
import AuthLogo from "../../components/auth/AuthLogo";
import FormInput from "../../components/form/FormInput";
import AuthButton from "../../components/auth/AuthButton";

const ForgotPasswordPage = () => {
    const { forgotPassword, authLoading, authError, clearAuthError } = useAuth();
    const [isSubmitted, setIsSubmitted] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        clearAuthError();
        const result = await forgotPassword(data.email);
        if (result.success) setIsSubmitted(true);
    };

    return (
        <AnimatedPage>
            <div className="login-page">
                <AuthCard>
                    <AuthLogo
                        title="Recuperar Contraseña"
                        subtitle={
                            isSubmitted
                                ? "Revisa tu bandeja de entrada"
                                : "Ingresa tu correo para recibir un enlace de recuperación"
                        }
                    />

                    {!isSubmitted ? (
                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <FormInput
                                label="Correo Electrónico"
                                type="email"
                                placeholder="ejemplo@correo.com"
                                register={register}
                                name="email"
                                validation={{
                                    required: "El correo es obligatorio",
                                    pattern: {
                                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                        message: "Correo no válido"
                                    }
                                }}
                                error={errors.email}
                            />

                            <AuthButton
                                type="submit"
                                id="btn-send-reset-link"
                                text="Enviar enlace"
                                loadingText="Enviando..."
                                loading={authLoading}
                            />

                            {authError && (
                                <div className="alert alert-danger mt-3">
                                    <AlertTriangle size={14} />
                                    <span>{authError}</span>
                                    <button
                                        onClick={clearAuthError}
                                        style={{ marginLeft: "auto", background: "none", border: "none", color: "inherit", cursor: "pointer" }}
                                    >
                                        ×
                                    </button>
                                </div>
                            )}
                        </form>
                    ) : (
                        <div className="auth-success-card">
                            <div className="auth-success-icon success">
                                <CheckCircle2 size={28} />
                            </div>
                            <p className="auth-success-msg">
                                Si el correo está registrado, recibirás las instrucciones de recuperación.
                            </p>
                            <p className="text-xs text-muted">
                                Si no lo encuentras, revisa tu carpeta de Spam.
                            </p>
                        </div>
                    )}

                    <Link to="/login" className="back-link">
                        <ArrowLeft size={14} /> Volver al inicio de sesión
                    </Link>
                </AuthCard>
            </div>
        </AnimatedPage>
    );
};

export default ForgotPasswordPage;
