import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);
const USER_KEY = "tarif-evim-user";
const PASS_KEY = "tarif-evim-password";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const login = (userData) => {
    const nextUser = {
      name: userData.name || userData.email?.split("@")[0] || "Kullanıcı",
      email: userData.email || "",
      role: userData.role || "user",
    };
    setUser(nextUser);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    if (userData.password) {
      localStorage.setItem(PASS_KEY, userData.password);
    }
  };

  const logout = () => {
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

  const changePassword = ({ currentPassword, newPassword }) => {
    const savedPassword = localStorage.getItem(PASS_KEY);
    if (savedPassword && savedPassword !== currentPassword) {
      return { ok: false, message: "Mevcut şifre doğru değil." };
    }
    if (!newPassword || newPassword.length < 6) {
      return { ok: false, message: "Yeni şifre en az 6 karakter olmalı." };
    }
    localStorage.setItem(PASS_KEY, newPassword);
    return { ok: true, message: "Şifre başarıyla güncellendi." };
  };

  const deleteAccount = () => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PASS_KEY);
    setUser(null);
    return { ok: true };
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateProfile, changePassword, deleteAccount }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
