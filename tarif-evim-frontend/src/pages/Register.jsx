import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLES = [
  { value: "user", icon: "👤", label: "Kullanıcı", desc: "Tarif keşfet ve kaydet" },
  { value: "dietitian", icon: "👨‍⚕️", label: "Diyetisyen", desc: "Tarif onayla ve yönet" },
];

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { setError("Tüm alanları doldurun."); return; }
    if (password.length < 6) { setError("Şifre en az 6 karakter olmalı."); return; }
    setSubmitting(true);
    const result = await register({ name, email, password, role });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || "Kayit olunamadi.");
      return;
    }
    navigate("/");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #fdf8f3 0%, #fff5ee 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 24,
      fontFamily: "'Nunito', sans-serif",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 480 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src="/logo.svg" alt="Tarif Evim" style={{ height: 66, width: "auto", margin: "0 auto 8px", display: "block" }} />
            <span style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 900,
              background: "linear-gradient(135deg, #ff6b35, #f7931e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>Tarif Evim</span>
          </Link>
        </div>

        <div style={{
          background: "white",
          borderRadius: 28,
          padding: "40px 36px",
          boxShadow: "0 8px 40px rgba(255,107,53,0.12)",
          border: "1px solid rgba(255,107,53,0.1)",
        }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 24, fontWeight: 900, color: "#1a1a1a", margin: "0 0 6px",
          }}>Hesap Oluştur 🎉</h1>
          <p style={{ color: "#999", fontSize: 13, margin: "0 0 28px" }}>Lezzet dünyasına katıl</p>

          {error && (
            <div style={{
              background: "#fff0ed", border: "1px solid #ffcdc2",
              color: "#e53e3e", borderRadius: 12, padding: "10px 14px",
              fontSize: 13, marginBottom: 20,
            }}>{error}</div>
          )}

          {/* Role selection */}
          <p style={{ fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 12 }}>Hesap Türü</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
            {ROLES.map(r => (
              <div
                key={r.value}
                onClick={() => setRole(r.value)}
                style={{
                  padding: "16px",
                  borderRadius: 16,
                  border: role === r.value ? "2px solid #ff6b35" : "2px solid #f0e8de",
                  background: role === r.value ? "#fff5f0" : "white",
                  cursor: "pointer",
                  textAlign: "center",
                  transition: "all .2s",
                  boxShadow: role === r.value ? "0 4px 16px rgba(255,107,53,0.15)" : "none",
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{r.icon}</div>
                <div style={{ fontWeight: 800, fontSize: 13, color: role === r.value ? "#ff6b35" : "#333" }}>{r.label}</div>
                <div style={{ fontSize: 11, color: "#aaa", marginTop: 3 }}>{r.desc}</div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <Field label="Ad Soyad" type="text" value={name} onChange={setName} placeholder="Adın Soyadın" />
            <Field label="E-posta" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" />
            <Field label="Şifre" type="password" value={password} onChange={setPassword} placeholder="En az 6 karakter" />

            <button type="submit" disabled={submitting} style={{
              width: "100%",
              background: "linear-gradient(135deg, #ff6b35, #f7931e)",
              color: "white",
              border: "none",
              borderRadius: 14,
              padding: "15px",
              fontWeight: 800,
              fontSize: 15,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: "0 4px 16px rgba(255,107,53,0.3)",
              marginTop: 8,
              opacity: submitting ? 0.7 : 1,
            }}>{submitting ? "Kayit olusturuluyor..." : "Kayıt Ol →"}</button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, color: "#999", fontSize: 13 }}>
            Zaten hesabın var mı?{" "}
            <Link to="/login" style={{ color: "#ff6b35", fontWeight: 800, textDecoration: "none" }}>
              Giriş Yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 7 }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          border: "2px solid #f0e8de",
          borderRadius: 12,
          padding: "12px 14px",
          fontFamily: "inherit",
          fontSize: 14,
          color: "#333",
          outline: "none",
          transition: "border .2s",
          boxSizing: "border-box",
        }}
        onFocus={e => e.target.style.borderColor = "#ff6b35"}
        onBlur={e => e.target.style.borderColor = "#f0e8de"}
      />
    </div>
  );
}
