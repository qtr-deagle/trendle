import React, { createContext, useContext, useState, useEffect } from "react";

export interface AdminContextType {
  isAdminAuthenticated: boolean;
  admin: { id: string; username: string; email: string } | null;
  adminLogin: (email: string, password: string) => Promise<void>;
  adminLogout: () => void;
  adminLoading: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [admin, setAdmin] = useState<{
    id: string;
    username: string;
    email: string;
  } | null>(null);
  const [adminLoading, setAdminLoading] = useState(true);

  // Check for persisted admin auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (token) {
      verifyAdminToken(token);
    } else {
      setAdminLoading(false);
    }
  }, []);

  const verifyAdminToken = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.admin) {
          setIsAdminAuthenticated(true);
          setAdmin(data.admin);
        } else {
          // User is not an admin
          localStorage.removeItem("adminToken");
        }
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("adminToken");
      }
    } catch (error) {
      console.error("Failed to verify admin token:", error);
      localStorage.removeItem("adminToken");
    } finally {
      setAdminLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Admin login failed";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          errorMessage = `Login failed with status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      localStorage.setItem("adminToken", data.token);
      setIsAdminAuthenticated(true);
      setAdmin(data.admin);
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  const adminLogout = async () => {
    const token = localStorage.getItem("adminToken");

    if (token) {
      try {
        // Call logout endpoint to notify backend
        await fetch(`${API_URL}/admin/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
      }
    }

    // Clear local state regardless of backend response
    localStorage.removeItem("adminToken");
    setIsAdminAuthenticated(false);
    setAdmin(null);
  };

  return (
    <AdminContext.Provider
      value={{
        isAdminAuthenticated,
        admin,
        adminLogin,
        adminLogout,
        adminLoading,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within AdminProvider");
  }
  return context;
};
