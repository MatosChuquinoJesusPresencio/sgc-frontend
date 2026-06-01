import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import AnimatedPage from "../../components/animations/AnimatedPage";
import AuthCard from "../../components/auth/AuthCard";
import AuthLogo from "../../components/auth/AuthLogo";
import FormInput from "../../components/form/FormInput";
import AuthButton from "../../components/auth/AuthButton";

const LoginPage = () => {
    const navigate = useNavigate();
    const { login, authLoading, clearAuthError, authError } = useAuth();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        clearAuthError();
        const result = await login(data);
        if (result.success) {
            navigate("/");
        }
    };

    return (
        <AnimatedPage>
            <div className="login-page">
                <AuthCard>
                    <AuthLogo
                        title="Bienvenido"
                        subtitle="Ingresa tus credenciales para continuar"
                    />

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

                        <FormInput
                            label="Contraseña"
                            type="password"
                            placeholder="********"
                            register={register}
                            name="password"
                            validation={{
                                required: "La contraseña es obligatoria",
                                minLength: {
                                    value: 6,
                                    message: "Mínimo 6 caracteres"
                                }
                            }}
                            error={errors.password}
                        />

                        <div className="flex items-center justify-between mb-4">
                            <label className="form-check">
                                <input
                                    type="checkbox"
                                    {...register("rememberMe")}
                                />
                                <label>Recuérdame</label>
                            </label>
                            <Link to="/forgot-password" className="forgot-link">
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        <AuthButton
                            type="submit"
                            text="Ingresar"
                            loadingText="Ingresando..."
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
                </AuthCard>
            </div>
        </AnimatedPage>
    );
};

export default LoginPage;
