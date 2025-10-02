import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { authUser } = useAuthContext();

  if (!authUser) {
    // If not logged in, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (authUser.accountType?.toLowerCase() !== "admin") {
    // If logged in but not admin, redirect to home
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;
