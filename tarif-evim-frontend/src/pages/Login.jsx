import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError("Tüm alanları doldurun."); return; }
    setSubmitting(true);
    const result = await login({ email, password });
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message || "Giriş yapılamadı.");
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
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Roboto:wght@700&display=swap" rel="stylesheet" />

      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ textDecoration: "none" }}>
            <img src="/logo.png" alt="Tarif Evim" style={{ height: 66, width: "auto", margin: "0 auto 8px", display: "block" }} />
            <span style={{
              fontFamily: "'Roboto', sans-serif",
              fontSize: 28,
              fontWeight: 700,
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
            fontFamily: "'Roboto', sans-serif",
            fontSize: 24,
            fontWeight: 700,
            color: "#1a1a1a",
            margin: "0 0 6px",
          }}>Tekrar Hoş Geldin 👋</h1>
          <p style={{ color: "#999", fontSize: 13, margin: "0 0 28px" }}>Hesabına giriş yap</p>

          {error && (
            <div style={{
              background: "#fff0ed", border: "1px solid #ffcdc2",
              color: "#e53e3e", borderRadius: 12, padding: "10px 14px",
              fontSize: 13, marginBottom: 20,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <Field label="E-posta" type="email" value={email} onChange={setEmail} placeholder="ornek@mail.com" />
            <Field label="Şifre" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

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
            }}>{submitting ? "Giriş yapılıyor..." : "Giriş Yap →"}</button>
          </form>

          <p style={{ textAlign: "center", marginTop: 24, color: "#999", fontSize: 13 }}>
            Hesabın yok mu?{" "}
            <Link to="/register" style={{ color: "#ff6b35", fontWeight: 800, textDecoration: "none" }}>
              Kayıt Ol
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
