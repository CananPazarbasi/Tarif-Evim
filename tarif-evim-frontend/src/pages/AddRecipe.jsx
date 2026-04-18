import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createRecipe } from "../services/recipeService";
import { useAuth } from "../context/AuthContext";
import { CATEGORY_OPTIONS } from "../constants/categories";

export default function AddRecipe() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "", categoryValues: ["Tavuk kategorisi"], calories: "", servings: "", preparationTime: "", image: "",
    ingredients: [""], steps: [""],
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("Görsel okunamadı."));
    reader.readAsDataURL(file);
  });

  const update = (field, value) => setForm(f => ({ ...f, [field]: value }));
  const toggleCategory = (categoryValue) => {
    setForm((prev) => {
      const exists = prev.categoryValues.includes(categoryValue);
      if (exists) {
        const next = prev.categoryValues.filter((item) => item !== categoryValue);
        return { ...prev, categoryValues: next.length > 0 ? next : prev.categoryValues };
      }
      return { ...prev, categoryValues: [...prev.categoryValues, categoryValue] };
    });
  };
  const updateList = (field, idx, value) => setForm(f => ({ ...f, [field]: f[field].map((v, i) => i === idx ? value : v) }));
  const addItem = (field) => setForm(f => ({ ...f, [field]: [...f[field], ""] }));
  const removeItem = (field, idx) => setForm(f => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }));

  const handleImagePick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Lütfen geçerli bir görsel dosyası seçin.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setError("Görsel boyutu en fazla 4MB olabilir.");
      return;
    }

    try {
      const dataUrl = await fileToDataUrl(file);
      update("image", dataUrl);
    } catch {
      setError("Görsel okunamadı. Lütfen tekrar deneyin.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError("Tarif eklemek için lütfen giriş yapın.");
      return;
    }

    if (!Array.isArray(form.categoryValues) || form.categoryValues.length === 0) {
      setError("Lütfen en az bir kategori seçin.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      await createRecipe(form);
    } catch (apiError) {
      setSubmitting(false);
      setError(apiError.message || "Tarif yayınlanamadı.");
      return;
    }

    setSubmitting(false);
    setSubmitted(true);
    setTimeout(() => navigate("/"), 2000);
  };

  if (submitted) return (
    <div style={{ textAlign: "center", padding: "100px 0" }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 28, color: "#1a1a1a" }}>Tarif Yayınlandı!</h2>
      <p style={{ color: "#999" }}>Tarif yayınlandı.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "'Roboto', sans-serif", fontSize: 32, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
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

          <FieldRow>
            <Field label="Tarif Görseli">
              <div style={{ display: "grid", gap: 10 }}>
                <input type="file" accept="image/*" onChange={handleImagePick} style={{ ...inputStyle, padding: "8px 10px", background: "white" }} />
                {form.image && (
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img src={form.image} alt="Tarif önizleme" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 12, border: "1px solid #f0e8de" }} />
                    <button type="button" onClick={() => update("image", "")} style={{ ...addBtn, marginTop: 0 }}>
                      Görseli Kaldır
                    </button>
                  </div>
                )}
              </div>
            </Field>
          </FieldRow>
          </FieldRow>
          <FieldRow cols={3}>
            <Field label="Kategori">
              <div style={categoryGridStyle}>
                {CATEGORY_OPTIONS.map((category) => {
                  const checked = form.categoryValues.includes(category.value);
                  return (
                    <label key={category.value} style={{ ...categoryChipStyle, ...(checked ? categoryChipActiveStyle : null) }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(category.value)}
                        style={{ marginRight: 8 }}
                      />
                      {category.label}
                    </label>
                  );
                })}
              </div>
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

          <FieldRow>
            <Field label="Hazırlama Süresi (dakika)">
              <input type="number" value={form.preparationTime} onChange={e => update("preparationTime", e.target.value)}
                placeholder="30" style={inputStyle}
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
        }}>{submitting ? "Yayınlanıyor..." : "🍳 Tarifi Yayınla"}</button>
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
      <h3 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 18, margin: "0 0 20px", color: "#1a1a1a" }}>{title}</h3>
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

const categoryGridStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  maxHeight: 150,
  overflowY: "auto",
};

const categoryChipStyle = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid #f0e8de",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  color: "#555",
  background: "#fff",
  cursor: "pointer",
};

const categoryChipActiveStyle = {
  borderColor: "#ff6b35",
  background: "#fff2eb",
  color: "#c2410c",
};
