import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";

const CATEGORIES = [
  "Tavuk kategorisi",
  "Et kategorisi",
  "Sebze kategorisi",
  "Baklagiller",
  "Deniz mahsülleri",
  "Çorba",
  "Hamur işleri",
  "Makarna",
  "Glutensiz kategori",
  "Vegan kategorisi",
  "Atıştırmalık ve Tatlı",
  "Diyetisyen onaylı tarifler",
];

export default function AddRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", category: "Tavuk kategorisi", calories: "", servings: "",
    ingredients: [""], steps: [""],
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const updateList = (field, idx, value) => setForm(f => ({ ...f, [field]: f[field].map((v, i) => i === idx ? value : v) }));
  const addItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ""] }));
  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Tarif eklemek icin lutfen giris yapin.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createRecipe(form);
    } catch (apiError) {
      setSubmitting(false);
      setError(apiError.message || "Tarif yayinlanamadi.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => navigate("/"), 2000);
  };

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#1a1a1a" }}>Tarif Eklendi!</h2>
      <p style={{ color: "#999" }}>Ana sayfaya yönlendiriliyorsunuz...</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 32, fontWeight: 900, color: "#1a1a1a", marginBottom: 8 }}>
        ➕ Tarif Ekle
      </h1>
      <p style={{ color: "#999", marginBottom: 36, fontSize: 14 }}>Yeni bir tarifi topluluğunla paylaş</p>

      {error && (
        <div style={{
          background: "#fff0ed", border: "1px solid #ffcdc2",
          color: "#e53e3e", borderRadius: 12, padding: "10px 14px",
          fontSize: 13, marginBottom: 16,
        }}>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <Section title="Temel Bilgiler">
          <FieldRow>
            <Field label="Tarif Adı" required>
              <input value={form.title} onChange={e => update("title", e.target.value)}
                placeholder="örn: Mercimek Çorbası" style={inputStyle} required
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#f0e8de"} />
            </Field>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Kategori">
              <select value={form.category} onChange={e => update("category", e.target.value)} style={inputStyle}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Kalori (kcal)">
              <input type="number" value={form.calories} onChange={e => update("calories", e.target.value)}
                placeholder="320" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#f0e8de"} />
            </Field>
            <Field label="Kaç Kişilik">
              <input type="number" value={form.servings} onChange={e => update("servings", e.target.value)}
                placeholder="4" style={inputStyle}
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#f0e8de"} />
            </Field>
          </FieldRow>
        </Section>

        <Section title="🧅 Malzemeler">
          {form.ingredients.map((ing, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <span style={{
                width: 28, height: 28, borderRadius: "50%",
                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                color: "white", fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 10,
              }}>{i + 1}</span>
              <input
                value={ing}
                onChange={e => updateList("ingredients", i, e.target.value)}
                placeholder="örn: 1 su bardağı mercimek"
                style={{ ...inputStyle, flex: 1 }}
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#f0e8de"}
              />
              {form.ingredients.length > 1 && (
                <button type="button" onClick={() => removeItem("ingredients", i)} style={removeBtn}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("ingredients")} style={addBtn}>+ Malzeme Ekle</button>
        </Section>

        <Section title="👨‍🍳 Hazırlanış Adımları">
          {form.steps.map((step, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <span style={{
                width: 28, height: 28, borderRadius: 8,
                background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                color: "white", fontSize: 11, fontWeight: 800,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0, marginTop: 10,
              }}>{i + 1}</span>
              <textarea
                value={step}
                onChange={e => updateList("steps", i, e.target.value)}
                placeholder="Bu adımı açıkla..."
                rows={2}
                style={{ ...inputStyle, flex: 1, resize: "vertical" }}
                onFocus={e => e.target.style.borderColor = "#ff6b35"}
                onBlur={e => e.target.style.borderColor = "#f0e8de"}
              />
              {form.steps.length > 1 && (
                <button type="button" onClick={() => removeItem("steps", i)} style={removeBtn}>✕</button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addItem("steps")} style={addBtn}>+ Adım Ekle</button>
        </Section>

        <button type="submit" disabled={submitting} style={{
          width: "100%",
          background: "linear-gradient(135deg, #ff6b35, #f7931e)",
          color: "white",
          border: "none",
          borderRadius: 16,
          padding: "16px",
          fontWeight: 800,
          fontSize: 16,
          cursor: "pointer",
          fontFamily: "inherit",
          boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
          marginTop: 8,
          opacity: submitting ? 0.7 : 1,
        }}>{submitting ? "Yayinlaniyor..." : "🍳 Tarifi Yayınla"}</button>
      </form>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{
      background: "white",
      borderRadius: 20,
      padding: "28px",
      marginBottom: 24,
      boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
    }}>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 18, margin: "0 0 20px", color: "#1a1a1a" }}>{title}</h3>
      {children}
    </div>
  );
}

function FieldRow({ children, cols = 1 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
      {children}
    </div>
  );
}

function Field({ label, children, required }) {
  return (
    <div>
      <label style={{ display: "block", fontWeight: 700, fontSize: 13, color: "#555", marginBottom: 7 }}>
        {label}{required && <span style={{ color: "#ff6b35" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  border: "2px solid #f0e8de",
  borderRadius: 12,
  padding: "11px 14px",
  fontFamily: "inherit",
  fontSize: 14,
  color: "#333",
  outline: "none",
  transition: "border .2s",
  boxSizing: "border-box",
  background: "#fdf8f3",
};

const removeBtn = {
  width: 36, height: 36,
  border: "none",
  background: "#fff0ed",
  color: "#e53e3e",
  borderRadius: "50%",
  cursor: "pointer",
  fontSize: 13,
  flexShrink: 0,
  marginTop: 8,
};

const addBtn = {
  background: "none",
  border: "2px dashed #f0e8de",
  borderRadius: 12,
  padding: "10px 20px",
  color: "#ff6b35",
  fontWeight: 700,
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
  marginTop: 4,
};
