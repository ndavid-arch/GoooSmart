import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { authApi } from "../api/auth";
import { setTokens, clearTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    const hasToken = localStorage.getItem("gosmart_access");
    if (!hasToken) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  async function login(username, password) {
    const data = await authApi.login({ username, password });
    setTokens({ access: data.access, refresh: data.refresh });
    const me = await authApi.me();
    setUser(me);
    return me;
  }

  async function register(payload) {
    const data = await authApi.register(payload);
    setTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
    return data.user;
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshMe: loadMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
