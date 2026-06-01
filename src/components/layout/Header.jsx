import { LogOut, Menu } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onMenuClick }) => {
    const { logout, authLoading, authUser } = useAuth();

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
            <div className="header-spacer" />
            <button className="header-user" onClick={handleLogout} disabled={authLoading}>
                {authLoading ? (
                    <span className="spinner" />
                ) : (
                    <>
                        <LogOut size={14} />
                        <span className="text-sm">Cerrar sesión</span>
                    </>
                )}
            </button>
        </header>
    );
};

export default Header;
