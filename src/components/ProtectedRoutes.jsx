import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

export default function ProtectedRoute({ moduleKey, children }) {
  const { user, loadingUser } = useContext(AuthContext);

  if (loadingUser) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return children;
  }

  const access = new Set(user.access || []);
  if (moduleKey && !access.has(moduleKey)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
