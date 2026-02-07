import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-12 w-12 text-swiss-blue animate-spin" />
      </div>
    );
  }

  if (!user && !localStorage.getItem("token")) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
