import { Navigate } from "react-router-dom";
import { useAuthContext } from "../../../context/AuthContext";

const AdminRoute = ({ children }) => {
  const { authUser } = useAuthContext();

  if (!authUser?.success || authUser?.user?.accountType?.toLowerCase() !== "admin") {
    return <Navigate to="/" />;
  }

  return children;
};

export default AdminRoute;
