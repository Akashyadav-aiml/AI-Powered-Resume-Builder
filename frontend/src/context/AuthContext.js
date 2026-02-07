import { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { API } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(!!token);

  // Set auth header for axios
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  // Verify token on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await verifyToken();
      }
      setLoading(false);
    };
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const verifyToken = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);
    } catch (error) {
      console.error("Token verification failed:", error);
      logout();
    }
  };

  const register = async (email, full_name, password) => {
    try {
      const response = await axios.post(`${API}/auth/register`, {
        email,
        full_name,
        password
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      await verifyToken();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || "Registration failed" 
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API}/auth/login`, {
        email,
        password
      });
      const { access_token } = response.data;
      localStorage.setItem("token", access_token);
      setToken(access_token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${access_token}`;
      await verifyToken();
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.detail || "Login failed" 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
