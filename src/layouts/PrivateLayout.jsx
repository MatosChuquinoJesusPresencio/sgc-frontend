import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import Sidebar from "../components/layout/Sidebar";
import { useAuth } from "../hooks/useAuth";
import { MENU_BY_ROLE } from "../constants/menus";

const getInitialSidebar = () => window.innerWidth > 768;

const PrivateLayout = () => {
    const { authUser } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(getInitialSidebar);

    useEffect(() => {
        const onResize = () => setSidebarOpen(window.innerWidth > 768);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    const menuItems = MENU_BY_ROLE[authUser?.role] || [];

    return (
        <div className="app-layout">
            <Toaster position="bottom-right" toastOptions={{ duration: 3000 }} />
            <Sidebar
                menuItems={menuItems}
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className={`app-main${sidebarOpen ? " sidebar-open" : ""}`}>
                <Header onMenuClick={() => setSidebarOpen(prev => !prev)} />
                <Outlet />
                <Footer />
            </div>
        </div>
    );
};

export default PrivateLayout;
