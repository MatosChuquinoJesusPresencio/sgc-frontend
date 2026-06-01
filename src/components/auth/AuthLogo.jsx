import logoSinFondo from "../../assets/logo-sin-fondo.svg";

const AuthLogo = ({ title, subtitle }) => {
    return (
        <div className="mb-4">
            <img
                src={logoSinFondo}
                alt="Logo Condominio"
                className="login-logo"
            />
            <h1 className="login-title">{title}</h1>
            {subtitle && <p className="login-subtitle">{subtitle}</p>}
        </div>
    );
};

export default AuthLogo;
