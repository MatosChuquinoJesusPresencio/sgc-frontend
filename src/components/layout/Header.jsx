import { useLocation } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { MENU_BY_ROLE } from "../../constants/menus";
import RoleBadge from "../ui/RoleBadge";

const ROLE_TO_ID = {
    SUPER_ADMIN: 1,
    ADMIN_CONDOMINIO: 2,
    PROPIETARIO: 3,
    AGENTE_SEGURIDAD: 4,
};

const Header = ({ onMenuClick }) => {
    const { logout, authLoading, authUser } = useAuth();
    const location = useLocation();

    const menus = MENU_BY_ROLE[authUser?.role] || [];
    const currentPage = menus.find((item) =>
        item.exact
            ? location.pathname === item.path
            : location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/")
    );

    const handleLogout = async () => {
        const result = await logout();
        if (result.success) {
            window.location.href = "/login";
        }
    };

    const initials = authUser?.nombre
        ? authUser.nombre.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
        : "?";

    return (
        <header className="header">
            <button className="header-btn" onClick={onMenuClick}>
                <Menu size={18} />
            </button>

            <div className="header-page-title">
                {currentPage?.icon}
                <span>{currentPage?.label || "Gestión Condominios"}</span>
            </div>

            <div className="header-spacer" />

            <div className="header-user-info">
                <div className="header-avatar">{initials}</div>
                <div className="header-user-details">
                    <span className="header-user-name">{authUser?.nombre || "Usuario"}</span>
                    <RoleBadge roleId={ROLE_TO_ID[authUser?.role]} />
                </div>
            </div>

            <button className="header-logout-btn" onClick={handleLogout} disabled={authLoading} title="Cerrar sesión">
                {authLoading ? <span className="spinner" /> : <LogOut size={16} />}
            </button>
        </header>
    );
};

export default Header;
