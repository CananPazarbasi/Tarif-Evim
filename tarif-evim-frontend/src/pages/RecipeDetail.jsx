import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  approveRecipe,
  chatAboutRecipe,
  deleteRecipe,
  getRecipeById,
} from "../services/recipeService";
import { useFavorites } from "../context/FavoritesContext";
import StarRating from "../components/StarRating";
import { useAuth } from "../context/AuthContext";

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const { toggleFavorite, isFavorite } = useFavorites();
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [favoriteWarning, setFavoriteWarning] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    const loadRecipe = async () => {
      setRecipeLoading(true);
      try {
        const nextRecipe = await getRecipeById(id);
        setRecipe(nextRecipe);
        setChatMessages([
          {
            role: "ai",
            text: `Merhaba! "${nextRecipe?.title || "bu"}" tarifi hakkında sormak istediğin bir şey var mı? 👨‍🍳`,
          },
        ]);
      } catch {
        setRecipe(null);
      } finally {
        setRecipeLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  if (recipeLoading) {
    return <div style={{ textAlign: "center", padding: 80, color: "#999", fontWeight: 700 }}>Tarif yükleniyor...</div>;
  }

  if (!recipe) return (
    <div style={{ textAlign: "center", padding: 80 }}>
      <div style={{ fontSize: 56 }}>😕</div>
      <p style={{ color: "#999", fontWeight: 700 }}>Tarif bulunamadı</p>
      <Link to="/" style={{ color: "#ff6b35", fontWeight: 800 }}>← Ana Sayfa</Link>
    </div>
  );

  const fav = isFavorite(recipe.id);
  const displayCategory = (value) => {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    return normalized.toLocaleLowerCase("tr-TR") === "corba" ? "Çorba" : normalized;
  };
  const isDietitian = user?.role === "dietitian";
  const canApprove = Boolean(
    isDietitian
    && (!recipe.dietitianApproved || recipe.approvedById === user?.id),
  );
  const canDelete = Boolean(user && recipe.createdById === user.id);
  const canEdit = Boolean(user && recipe.createdById === user.id);

  const handleToggleFavorite = async () => {
    const result = await toggleFavorite(recipe);
    if (!result?.ok) {
      setFavoriteWarning(result.message || "Lütfen giriş yapın.");
      window.setTimeout(() => setFavoriteWarning(""), 2200);
    }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatInput("");
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      if (!user) {
        throw new Error("AI asistanı için lütfen giriş yapın.");
      }

      const aiText = await chatAboutRecipe(recipe.id, userMsg);
      setChatMessages(prev => [...prev, { role: "ai", text: aiText }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: "ai", text: error.message || "Bağlantı hatası. Lütfen tekrar deneyin." }]);
    }
    setLoading(false);
  };

  const handleApprove = async () => {
    setActionLoading(true);
    setActionMessage("");
    try {
      const { recipe: updatedRecipe, message } = await approveRecipe(recipe.id);
      setRecipe(updatedRecipe);
      setActionMessage(message || "Tarif güncellendi.");
    } catch (error) {
      setActionMessage(error.message || "Tarif onaylanamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Bu tarifi silmek istediğine emin misin?");
    if (!confirmed) return;

    setActionLoading(true);
    setActionMessage("");
    try {
      await deleteRecipe(recipe.id);
      navigate("/");
    } catch (error) {
      setActionMessage(error.message || "Tarif silinemedi.");
      setActionLoading(false);
    }
  };

  return (
    <div>
      <Link to="/" style={{ color: "#ff6b35", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24, fontSize: 14 }}>
        ← Tariflere Dön
      </Link>

      {/* Hero */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 36,
        marginBottom: 40,
        background: "white",
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        <div style={{ position: "relative", minHeight: 360 }}>
          <img src={recipe.image} alt={recipe.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          {recipe.dietitianApproved && (
            <div style={{
              position: "absolute", bottom: 20, left: 20,
              background: "linear-gradient(90deg, #22c55e, #16a34a)",
              borderRadius: 20,
              padding: "6px 14px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}>
              <span style={{ color: "white", fontSize: 11, fontWeight: 800 }}>✓ DİYETİSYEN ONAYLI</span>
            </div>
          )}
        </div>

        <div style={{ padding: "36px 36px 36px 0" }}>
          <div style={{
            display: "inline-block",
            background: "#fff5f0",
            color: "#ff6b35",
            borderRadius: 20,
            padding: "4px 12px",
            fontSize: 12,
            fontWeight: 800,
            marginBottom: 12,
            letterSpacing: 0.5,
          }}>{displayCategory(recipe.category)}</div>

          <h1 style={{
            fontFamily: "'Roboto', sans-serif",
            fontWeight: 700,
            fontSize: "clamp(22px, 3vw, 36px)",
            color: "#1a1a1a",
            margin: "0 0 20px",
            lineHeight: 1.2,
          }}>{recipe.title}</h1>

          <div style={{ display: "flex", gap: 16, marginBottom: 28 }}>
            <StatBox icon="🔥" value={recipe.calories} label="kcal" />
            <StatBox icon="🍽️" value={recipe.servings} label="kişilik" />
            <StatBox icon="⏱️" value={recipe.preparationTime || recipe.steps.length * 5} label="dakika" />
          </div>

          <div style={{ marginBottom: 18 }}>
            <StarRating
              recipeId={recipe.id}
              initialAverage={Number(recipe.ratingAverage || 0)}
              initialCount={Number(recipe.ratingCount || 0)}
            />
          </div>

          <button
            onClick={handleToggleFavorite}
            style={{
              background: fav ? "linear-gradient(135deg, #ff6b35, #f7931e)" : "white",
              border: fav ? "none" : "2px solid #ff6b35",
              color: fav ? "white" : "#ff6b35",
              borderRadius: 50,
              padding: "12px 24px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "flex",
              alignItems: "center",
              gap: 8,
              boxShadow: fav ? "0 4px 16px rgba(255,107,53,0.3)" : "none",
            }}
          >{fav ? "♥ Favorilerden Çıkar" : "♡ Favorilere Ekle"}</button>

          {(canApprove || canDelete || canEdit) && (
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {canApprove && (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  style={{
                    background: "linear-gradient(90deg, #16a34a, #22c55e)",
                    border: "none",
                    color: "white",
                    borderRadius: 50,
                    padding: "10px 16px",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: actionLoading ? "default" : "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >{recipe.dietitianApproved ? "Onayı Geri Çek" : "Onayla"}</button>
              )}
              {canEdit && (
                <Link
                  to={`/recipe/${recipe.id}/edit`}
                  style={{
                    background: "#eef2ff",
                    border: "1px solid #c7d2fe",
                    color: "#3730a3",
                    borderRadius: 50,
                    padding: "10px 16px",
                    fontWeight: 800,
                    fontSize: 13,
                    textDecoration: "none",
                  }}
                >Tarifi Duzenle</Link>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={actionLoading}
                  style={{
                    background: "#fff1f2",
                    border: "1px solid #fecdd3",
                    color: "#be123c",
                    borderRadius: 50,
                    padding: "10px 16px",
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: actionLoading ? "default" : "pointer",
                    opacity: actionLoading ? 0.7 : 1,
                  }}
                >Tarifi Sil</button>
              )}
            </div>
          )}

          {actionMessage && (
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "#9a3412" }}>
              {actionMessage}
            </div>
          )}
          {favoriteWarning && (
            <div style={{ marginTop: 10, fontSize: 12, fontWeight: 700, color: "#b91c1c" }}>
              {favoriteWarning}
            </div>
          )}
        </div>
      </div>

      {/* Two columns: ingredients + steps */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.4fr", gap: 28, marginBottom: 36 }}>
        {/* Ingredients */}
        <div style={{ background: "white", borderRadius: 24, padding: "28px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 20px", color: "#1a1a1a" }}>
            🧅 Malzemeler
          </h2>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "11px 0",
                borderBottom: i < recipe.ingredients.length - 1 ? "1px solid #f5f5f5" : "none",
                color: "#444",
                fontWeight: 600,
                fontSize: 14,
              }}>
                <span style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 11, fontWeight: 800, flexShrink: 0,
                }}>{i + 1}</span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div style={{ background: "white", borderRadius: 24, padding: "28px 28px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
          <h2 style={{ fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 20, margin: "0 0 20px", color: "#1a1a1a" }}>
            👨‍🍳 Hazırlanışı
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {recipe.steps.map((step, i) => (
              <div key={i} style={{
                display: "flex",
                gap: 14,
                padding: "14px 16px",
                background: "#fdf8f3",
                borderRadius: 14,
                border: "1px solid #f0e8de",
              }}>
                <span style={{
                  width: 30, height: 30, borderRadius: 10,
                  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "white", fontSize: 12, fontWeight: 900, flexShrink: 0,
                }}>{i + 1}</span>
                <p style={{ margin: 0, color: "#555", fontSize: 14, lineHeight: 1.6, fontWeight: 600 }}>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Chat */}
      <div style={{
        background: "linear-gradient(135deg, #1a0a00 0%, #2d1200 100%)",
        borderRadius: 28,
        padding: "32px",
        boxShadow: "0 8px 36px rgba(255,107,53,0.2)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14,
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>🤖</div>
          <div>
            <h3 style={{ color: "white", fontFamily: "'Roboto', sans-serif", fontWeight: 700, fontSize: 18, margin: 0 }}>AI Şef Asistanı</h3>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, margin: 0 }}>Bu tarif hakkında soru sor</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
            <span style={{ color: "#22c55e", fontSize: 11, fontWeight: 700 }}>Çevrimiçi</span>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          height: 240,
          overflowY: "auto",
          marginBottom: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          paddingRight: 4,
        }}>
          {chatMessages.map((msg, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}>
              <div style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: msg.role === "user"
                  ? "linear-gradient(135deg, #ff6b35, #f7931e)"
                  : "rgba(255,255,255,0.1)",
                color: "white",
                fontSize: 13,
                lineHeight: 1.5,
                fontWeight: 500,
                backdropFilter: msg.role === "ai" ? "blur(10px)" : "none",
              }}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", gap: 4, padding: "8px 12px" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#ff6b35",
                  animation: "pulse 1s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                  display: "inline-block",
                }} />
              ))}
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          display: "flex",
          gap: 10,
          background: "rgba(255,255,255,0.08)",
          borderRadius: 50,
          padding: "6px 6px 6px 20px",
          border: "1px solid rgba(255,255,255,0.12)",
        }}>
          <input
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !loading && sendMessage()}
            placeholder="Bu tarif hakkında bir şey sor..."
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "white",
              fontFamily: "inherit",
              fontSize: 13,
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !chatInput.trim()}
            style={{
              background: chatInput.trim() && !loading
                ? "linear-gradient(135deg, #ff6b35, #f7931e)"
                : "rgba(255,255,255,0.1)",
              border: "none",
              borderRadius: 50,
              width: 44, height: 44,
              cursor: chatInput.trim() && !loading ? "pointer" : "default",
              color: "white",
              fontSize: 16,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "all .2s",
            }}
          >➤</button>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, value, label }) {
  return (
    <div style={{
      background: "#fdf8f3",
      border: "2px solid #f0e8de",
      borderRadius: 16,
      padding: "14px 20px",
      textAlign: "center",
    }}>
      <div style={{ fontSize: 20, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontWeight: 900, fontSize: 20, color: "#ff6b35", lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#aaa", fontWeight: 700 }}>{label}</div>
    </div>
  );
}
