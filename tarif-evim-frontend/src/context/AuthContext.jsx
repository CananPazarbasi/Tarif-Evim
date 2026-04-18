import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, tokenStorage } from "../services/apiClient";

const AuthContext = createContext(null);
const USER_KEY = "tarif-evim-user";

const normalizeUser = (rawUser) => ({
  id: String(rawUser?._id || rawUser?.id || ""),
  name: rawUser?.name || "Kullanici",
  email: rawUser?.email || "",
  role: rawUser?.role || "user",
});

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const persistUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  useEffect(() => {
    const bootstrap = async () => {
      const accessToken = tokenStorage.getAccessToken();
      if (!accessToken) {
        setUser(null);
        localStorage.removeItem(USER_KEY);
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get("/auth/me", { auth: true });
        persistUser(normalizeUser(response?.data || {}));
      } catch {
        tokenStorage.clear();
        localStorage.removeItem(USER_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await apiClient.post("/auth/login", { email, password });
      tokenStorage.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      persistUser(normalizeUser(response.user));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Giriş yapılamadı" };
    }
  };

  const register = async ({ name, email, password, role }) => {
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
        role,
      });
      tokenStorage.setTokens({
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      });
      persistUser(normalizeUser(response.user));
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Kayıt olunamadı" };
    }
  };

  const logout = () => {
    tokenStorage.clear();
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const updateProfile = ({ name, email }) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, name: name?.trim() || prev.name, email: email?.trim() || prev.email };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
    return { ok: true };
  };

  const changePassword = async ({ currentPassword, newPassword }) => {
    try {
      await apiClient.put(
        "/auth/update-password",
        { currentPassword, newPassword },
        { auth: true },
      );
      return { ok: true, message: "Şifre başarıyla güncellendi." };
    } catch (error) {
      return { ok: false, message: error.message || "Şifre güncellenemedi" };
    }
  };

  const deleteAccount = async () => {
    try {
      await apiClient.delete("/auth/me", { auth: true });
      localStorage.removeItem(USER_KEY);
      tokenStorage.clear();
      setUser(null);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message || "Hesap silinemedi" };
    }
  };

  const value = useMemo(
    () => ({ user, loading, login, register, logout, updateProfile, changePassword, deleteAccount }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
