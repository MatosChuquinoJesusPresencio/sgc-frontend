import { LayoutDashboard, ShieldCheck, Building2, GitBranch, Users, ClipboardList, Car, History, ShoppingCart, Home, Globe, User } from "lucide-react";

export const MENU_BY_ROLE = {
    ADMIN_CONDOMINIO: [
        { path: "/admin-condominio", label: "Inicio", icon: <Building2 size={18} />, exact: true },
        { path: "/admin-condominio/mi-condominio", label: "Mi Condominio", icon: <Building2 size={18} /> },
        { path: "/admin-condominio/infraestructura", label: "Infraestructura", icon: <GitBranch size={18} /> },
        { path: "/admin-condominio/usuarios", label: "Usuarios", icon: <Users size={18} /> },
        { path: "/admin-condominio/apartamentos", label: "Inquilinos", icon: <Home size={18} /> },
        { path: "/admin-condominio/estacionamientos", label: "Estacionamientos", icon: <Car size={18} /> },
        { path: "/admin-condominio/carritos", label: "Carritos", icon: <ShoppingCart size={18} /> },
        { path: "/admin-condominio/historial", label: "Historial", icon: <ClipboardList size={18} /> },
        { path: "/perfil", label: "Mi Perfil", icon: <User size={18} /> },
    ],

    SUPER_ADMIN: [
        { path: "/super-admin", label: "Inicio", icon: <ShieldCheck size={18} />, exact: true },
        { path: "/super-admin/administradores", label: "Administradores", icon: <Users size={18} /> },
        { path: "/super-admin/condominios", label: "Condominios", icon: <Building2 size={18} /> },
        { path: "/super-admin/usuarios", label: "Usuarios Globales", icon: <Globe size={18} /> },
        { path: "/perfil", label: "Mi Perfil", icon: <User size={18} /> },
    ],

    AGENTE_SEGURIDAD: [
        { path: "/seguridad", label: "Inicio", icon: <ShieldCheck size={18} />, exact: true },
        { path: "/seguridad/estacionamientos", label: "Estacionamientos", icon: <Car size={18} /> },
        { path: "/seguridad/vehiculos", label: "Veh\u00edculos", icon: <Car size={18} /> },
        { path: "/seguridad/carritos", label: "Carritos", icon: <ShoppingCart size={18} /> },
        { path: "/perfil", label: "Mi Perfil", icon: <User size={18} /> },
    ],

    PROPIETARIO: [
        { path: "/propietario", label: "Inicio", icon: <LayoutDashboard size={18} />, exact: true },
        { path: "/propietario/mi-apartamento", label: "Apartamento", icon: <Home size={18} /> },
        { path: "/propietario/vehiculos", label: "Vehículos", icon: <Car size={18} /> },
        { path: "/propietario/carritos", label: "Carritos", icon: <ShoppingCart size={18} /> },
        { path: "/propietario/historial", label: "Historial", icon: <History size={18} /> },
        { path: "/perfil", label: "Mi Perfil", icon: <User size={18} /> },
    ],
};
