import { Navigate } from "react-router-dom";

import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }) => {
    const  { isAuthenticated, initialLoading } = useAuth();

    if (initialLoading) {
        return null;
    }

    return isAuthenticated ? children : <Navigate to="/login" />
};

export default PrivateRoute;
