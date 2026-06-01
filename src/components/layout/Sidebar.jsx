import { Link, useLocation } from "react-router-dom";
import { X } from "lucide-react";
import logoSinFondo from "../../assets/logo-sin-fondo.svg";

const Sidebar = ({ menuItems, isOpen, onClose }) => {
    const location = useLocation();

    const isActive = (item) => {
        return item.exact
            ? location.pathname === item.path
            : location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/");
    };

    return (
        <>
            <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={onClose} />
            <aside className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <div className="sidebar-logo-wrapper">
                        <img src={logoSinFondo} alt="Logo" className="sidebar-logo" />
                    </div>
                    <span className="sidebar-brand">Gestión Condominios</span>
                    <button className="sidebar-close" onClick={onClose}>
                        <X size={18} />
                    </button>
                </div>
                <nav className="sidebar-body">
                    <div className="nav-section-label">Navegación</div>
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => { if (window.innerWidth <= 768) onClose(); }}
                            className={`nav-item ${isActive(item) ? "active" : ""}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;
