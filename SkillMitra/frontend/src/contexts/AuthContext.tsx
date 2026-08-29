"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api, type AuthUser } from "@/lib/api";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user;

  // Load current user from token on mount
  useEffect(() => {
    let cancelled = false;
    const token = sessionStorage.getItem("skillmitra_access_token");
    
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const currentUser = await api.me();
        if (!cancelled) {
          setUser(currentUser);
        }
      } catch (error) {
        // Token invalid or expired
        if (!cancelled) {
          sessionStorage.removeItem("skillmitra_access_token");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    sessionStorage.setItem("skillmitra_access_token", result.access_token);
    setUser(result.user);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error("Logout error:", error);
    } finally {
      sessionStorage.removeItem("skillmitra_access_token");
      setUser(null);
    }
  };

  const refresh = async () => {
    try {
      const result = await api.refresh();
      sessionStorage.setItem("skillmitra_access_token", result.access_token);
      setUser(result.user);
    } catch (error) {
      // Refresh failed, clear auth state
      sessionStorage.removeItem("skillmitra_access_token");
      setUser(null);
      throw error;
    }
  };

  const loadCurrentUser = async () => {
    try {
      const currentUser = await api.me();
      setUser(currentUser);
    } catch (error) {
      sessionStorage.removeItem("skillmitra_access_token");
      setUser(null);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refresh,
        loadCurrentUser,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}