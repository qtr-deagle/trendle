import React, { createContext, useContext, useState, useEffect } from "react";

export interface AuthContextType {
  isAuthenticated: boolean;
  user: { id: string; username: string; email: string; displayName?: string; avatar?: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  signup: (username: string, email: string, password: string) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string; email: string; displayName?: string; avatar?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for persisted auth state on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Verify token is still valid by fetching user
      fetchMe(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchMe = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const avatarUrl = data.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`;
        setIsAuthenticated(true);
        setUser({ ...data.user, avatar: avatarUrl });
      } else {
        // Token is invalid, clear it
        localStorage.removeItem("token");
      }
    } catch (error) {
      console.error("Failed to verify token:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Login failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);
    const avatarUrl = data.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`;
    setUser({ ...data.user, avatar: avatarUrl });
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    setUser(null);
  };

  const signup = async (username: string, email: string, password: string) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Signup failed");
    }

    const data = await response.json();
    localStorage.setItem("token", data.token);
    setIsAuthenticated(true);
    const avatarUrl = data.user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.user.username}`;
    setUser({ ...data.user, avatar: avatarUrl });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, signup, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
