import React from "react";
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAppSelector } from "../hooks/reduxHooks";

interface PrivateRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  /** Si true, no verifica plan activo (para rutas como /plans) */
  skipPlanCheck?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles, skipPlanCheck = false }) => {
  const { isLoggedIn, user, isAuthLoading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  const role = user?.role?.toLowerCase() ?? "";

  if (isAuthLoading) {
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Validación crítica: usuarios no-candidatos deben tener organizationId
  // Si no lo tienen, la sesión está corrupta - forzar re-login
  if (role !== "candidate" && !user?.organizationId) {
    console.error("Session corrupted: user missing organizationId");
    return <Navigate to="/login" state={{ error: "session_expired" }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Verificar que tenga plan activo (solo para recruiters/admins, no candidatos)
  // Excepto si estamos en una ruta que no requiere verificación de plan
  if (!skipPlanCheck && user && !user.hasActivePlan && role !== "candidate") {
    // Redirigir a selección de plan si no tiene plan activo
    return <Navigate to="/plans" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
