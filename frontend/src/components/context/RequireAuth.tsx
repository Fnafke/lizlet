import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import { PageSpinner } from "../PageSpinner";

export const RequireAuth = () => {
    const context = useContext(AuthContext);
    const location = useLocation();

    if (context && context.isLoading) {
        return <PageSpinner />;
    }

    if (!context || !context.user) {
        // send them to login, remembering where they came from
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />; // user is authenticated — render the nested routes
};