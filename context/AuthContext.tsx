"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  rol: string;
}

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, contrasena: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkUserSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const sessionChecked = useRef(false);

  const checkUserSession = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error al obtener sesión de usuario:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sessionChecked.current) return;
    sessionChecked.current = true;
    checkUserSession();
  }, [checkUserSession]);

  const login = useCallback(async (email: string, contrasena: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: contrasena }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        router.push("/dashboard");
        return { success: true };
      } else {
        return { success: false, error: data.error || "Error al iniciar sesión." };
      }
    } catch (error) {
      console.error("Error durante el login:", error);
      return { success: false, error: "Error de red o servidor." };
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, loading, login, logout, checkUserSession }),
    [user, loading, login, logout, checkUserSession]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
}
