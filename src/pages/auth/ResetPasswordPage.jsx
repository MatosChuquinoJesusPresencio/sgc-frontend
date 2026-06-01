import { useForm } from "react-hook-form";
import { useSearchParams, Link } from "react-router-dom";
import { useState, useRef } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import AnimatedPage from "../../components/animations/AnimatedPage";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/auth/AuthCard";
import AuthLogo from "../../components/auth/AuthLogo";
import FormInput from "../../components/form/FormInput";
import AuthButton from "../../components/auth/AuthButton";

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const { resetPassword, validateResetToken, authLoading, authError, clearAuthError } = useAuth();

    const [isSuccess, setIsSuccess] = useState(false);

    const tokenFromUrl = searchParams.get("token");
    const tokenStatus = validateResetToken(tokenFromUrl);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = useRef({});
    password.current = watch("password", "");

    const onSubmit = async (data) => {
        clearAuthError();
        const result = await resetPassword(tokenFromUrl, data.password);
        if (result.success) setIsSuccess(true);
    };

    return (
        <AnimatedPage>
            <div className="login-page">
                <AuthCard>
                    <AuthLogo
                        title="Nueva Contraseña"
                        subtitle={
                            isSuccess
                                ? "¡Contraseña actualizada con éxito!"
                                : "Ingresa tu nueva contraseña a continuación"
                        }
                    />

                    {isSuccess ? (
                        <>
                            <div className="auth-success-card">
                                <div className="auth-success-icon success">
                                    <CheckCircle2 size={28} />
                                </div>
                                <p className="auth-success-msg">
                                    Tu contraseña ha sido restablecida. Ya puedes iniciar sesión.
                                </p>
                            </div>
                            <Link to="/login" id="btn-go-to-login" className="btn btn-primary w-full">
                                Ir al Login
                            </Link>
                        </>
                    ) : !tokenStatus.valid ? (
                        <>
                            <div className="auth-success-card">
                                <div className="auth-success-icon warning">
                                    <AlertTriangle size={28} />
                                </div>
                                <p className="auth-success-msg">{tokenStatus.reason}</p>
                            </div>
                            <Link to="/forgot-password" className="btn btn-primary w-full">
                                Solicitar nuevo enlace
                            </Link>
                        </>
                    ) : (
                        <form noValidate onSubmit={handleSubmit(onSubmit)}>
                            <FormInput
                                label="Nueva Contraseña"
                                type="password"
                                placeholder="Mínimo 6 caracteres"
                                register={register}
                                name="password"
                                validation={{
                                    required: "La contraseña es obligatoria",
                                    minLength: { value: 6, message: "Mínimo 6 caracteres" }
                                }}
                                error={errors.password}
                            />

                            <FormInput
                                label="Confirmar Contraseña"
                                type="password"
                                placeholder="Repite tu contraseña"
                                register={register}
                                name="confirmPassword"
                                validation={{
                                    required: "Confirma tu contraseña",
                                    validate: value => value === password.current || "Las contraseñas no coinciden"
                                }}
                                error={errors.confirmPassword}
                            />

                            {authError && (
                                <div className="alert alert-danger mb-3">
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

                            <AuthButton
                                type="submit"
                                id="btn-reset-password"
                                text="Cambiar contraseña"
                                loadingText="Restableciendo..."
                                loading={authLoading}
                            />

                            <Link to="/login" className="back-link">
                                Volver al inicio de sesión
                            </Link>
                        </form>
                    )}
                </AuthCard>
            </div>
        </AnimatedPage>
    );
};

export default ResetPasswordPage;
