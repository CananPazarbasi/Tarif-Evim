import React, { useRef, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { searchRecipes } from "../services/recipeService";

const categories = [
  { label: "Tavuk kategorisi", icon: "🍗", color: "#fb923c" },
  { label: "Et kategorisi", icon: "🥩", color: "#ef4444" },
  { label: "Sebze kategorisi", icon: "🥦", color: "#4ade80" },
  { label: "Baklagiller", icon: "🫘", color: "#a78bfa" },
  { label: "Deniz mahsülleri", icon: "🐟", color: "#38bdf8" },
  { label: "Çorba", icon: "🍲", color: "#f59e0b" },
  { label: "Hamur işleri", icon: "🥐", color: "#fb7185" },
  { label: "Makarna", icon: "🍝", color: "#f97316" },
  { label: "Glutensiz kategori", icon: "🌾", color: "#fbbf24" },
  { label: "Vegan kategorisi", icon: "🌱", color: "#34d399" },
  { label: "Atıştırmalık ve Tatlı", icon: "🍮", color: "#f472b6" },
  { label: "Diyetisyen onaylı tarifler", icon: "👨‍⚕️", color: "#60a5fa" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [activeSettingsPanel, setActiveSettingsPanel] = useState("");
  const [profileForm, setProfileForm] = useState({ name: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({ current: "", next: "", confirm: "" });
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [settingsMessage, setSettingsMessage] = useState("");
  const { user, logout, updateProfile, changePassword, deleteAccount } = useAuth();
  const searchRequestRef = useRef(0);
  const navigate = useNavigate();

  const openSettingsPanel = (panel) => {
    if (!user) {
      setShowProfileMenu(false);
      navigate("/login");
      return;
    }
    if (panel === "profile") {
      setProfileForm({ name: user.name || "", email: user.email || "" });
    }
    if (panel === "password") {
      setPasswordForm({ current: "", next: "", confirm: "" });
    }
    if (panel === "delete") {
      setDeleteConfirm("");
    }
    setSettingsMessage("");
    setActiveSettingsPanel(panel);
    setShowProfileMenu(false);
  };

  const closeSettingsPanel = () => {
    setActiveSettingsPanel("");
    setSettingsMessage("");
  };

  const saveProfile = () => {
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setSettingsMessage("Ad ve e-posta alanları zorunludur.");
      return;
    }
    updateProfile(profileForm);
    setSettingsMessage("Profil bilgileri güncellendi.");
  };

  const savePassword = async () => {
    if (!passwordForm.current || !passwordForm.next || !passwordForm.confirm) {
      setSettingsMessage("Tüm şifre alanlarını doldurun.");
      return;
    }
    if (passwordForm.next !== passwordForm.confirm) {
      setSettingsMessage("Yeni şifreler eşleşmiyor.");
      return;
    }
    const result = await changePassword({ currentPassword: passwordForm.current, newPassword: passwordForm.next });
    setSettingsMessage(result.message || "");
    if (result.ok) {
      setPasswordForm({ current: "", next: "", confirm: "" });
    }
  };

  const removeAccount = () => {
    if (deleteConfirm.trim().toUpperCase() !== "SIL") {
      setSettingsMessage("Hesabı silmek için SIL yazmalısın.");
      return;
    }
    deleteAccount();
    setShowProfileMenu(false);
    closeSettingsPanel();
    navigate("/");
  };

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.trim().length <= 1) {
      setShowResults(false);
      setSearchResults([]);
      return;
    }

    const requestId = ++searchRequestRef.current;
    try {
      const results = await searchRecipes(q);
      if (requestId !== searchRequestRef.current) {
        return;
      }
      setSearchResults(results);
      setShowResults(true);
    } catch {
      if (requestId !== searchRequestRef.current) {
        return;
      }
      setSearchResults([]);
      setShowResults(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#fdf8f3" }}>
      {/* Google Font */}
      <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=Playfair+Display:wght@700;900&display=swap" rel="stylesheet" />

      {/* Header */}
      <header style={{
        background: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
        boxShadow: "0 4px 20px rgba(255,107,53,0.3)",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          height: 68,
        }}>
          {/* Hamburger */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {[0,1,2].map(i => (
                <span key={i} style={{ display: "block", width: 24, height: 2.5, background: "white", borderRadius: 4 }} />
              ))}
            </div>
          </button>

          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
            <img src="/logo.svg" alt="Tarif Evim" style={{ height: 46, width: "auto", display: "block" }} />
          </Link>

          {/* Search */}
          <div style={{ flex: 1, position: "relative", maxWidth: 480, margin: "0 auto" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              background: "rgba(255,255,255,0.95)",
              borderRadius: 50,
              padding: "0 16px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
            }}>
              <span style={{ fontSize: 16, marginRight: 8 }}>🔍</span>
              <input
                value={searchQuery}
                onChange={handleSearch}
                onBlur={() => setTimeout(() => setShowResults(false), 200)}
                placeholder="Tarif veya malzeme ara..."
                style={{
                  border: "none",
                  outline: "none",
                  background: "transparent",
                  padding: "10px 0",
                  fontSize: 14,
                  fontFamily: "inherit",
                  width: "100%",
                  color: "#333",
                }}
              />
            </div>
            {showResults && searchResults.length > 0 && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0, right: 0,
                background: "white",
                borderRadius: 16,
                boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
                overflow: "hidden",
                zIndex: 200,
              }}>
                {searchResults.map(r => (
                  <div
                    key={r.id}
                    onMouseDown={() => { navigate(`/recipe/${r.id}`); setShowResults(false); setSearchQuery(""); }}
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      borderBottom: "1px solid #f5f5f5",
                      transition: "background .15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff5f0"}
                    onMouseLeave={e => e.currentTarget.style.background = "white"}
                  >
                    <img src={r.image} alt={r.title} style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover" }} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#333" }}>{r.title}</div>
                      <div style={{ fontSize: 11, color: "#999" }}>{r.calories} kcal · {r.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Icons */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, position: "relative" }}>
            <NavBtn to="/add-recipe" icon="➕" label="Tarif Ekle" />
            <NavBtn to="/favorites" icon="♥" label="Favoriler" />
            <NavBtn to="/shopping-list" icon="📋" label="Alışveriş" />
            <button
              onClick={() => setShowProfileMenu((v) => !v)}
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.25)",
                background: "rgba(255,255,255,0.2)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: 16,
              }}
              title="Profil Ayarları"
            >
              ⚙
            </button>

            {showProfileMenu && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 10px)",
                right: 0,
                width: 220,
                background: "white",
                borderRadius: 14,
                boxShadow: "0 12px 36px rgba(0,0,0,0.18)",
                border: "1px solid #f1e6db",
                padding: 10,
                zIndex: 250,
              }}>
                {user ? (
                  <>
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#1f2937", padding: "8px 10px" }}>
                      {user.name || "Kullanıcı"}
                    </div>
                    <button onClick={() => openSettingsPanel("profile")} style={menuItemButton}>Profil Bilgileri</button>
                    <button onClick={() => openSettingsPanel("password")} style={menuItemButton}>Şifre Değiştir</button>
                    <button
                      onClick={() => {
                        logout();
                        setShowProfileMenu(false);
                      }}
                      style={menuItemDanger}
                    >
                      Çıkış Yap
                    </button>
                    <button onClick={() => openSettingsPanel("delete")} style={menuItemDelete}>Hesabımı Sil</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setShowProfileMenu(false)} style={menuItemLink}>Giriş Yap</Link>
                    <Link to="/register" onClick={() => setShowProfileMenu(false)} style={menuItemLink}>Kayıt Ol</Link>
                    <button style={menuItemDisabled}>Profil Ayarları (giriş sonrası)</button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {activeSettingsPanel && (
        <div
          onClick={closeSettingsPanel}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 260,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: 480,
              background: "white",
              borderRadius: 18,
              boxShadow: "0 22px 48px rgba(0,0,0,0.25)",
              padding: 22,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontFamily: "'Playfair Display', serif", fontSize: 24, color: "#1f2937" }}>
                {activeSettingsPanel === "profile" && "Profil Bilgileri"}
                {activeSettingsPanel === "password" && "Şifre Değiştir"}
                {activeSettingsPanel === "delete" && "Hesabımı Sil"}
              </h3>
              <button onClick={closeSettingsPanel} style={closeBtn}>✕</button>
            </div>

            {activeSettingsPanel === "profile" && (
              <>
                <FieldRow label="Ad Soyad">
                  <input
                    value={profileForm.name}
                    onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                    style={panelInput}
                    placeholder="Ad Soyad"
                  />
                </FieldRow>
                <FieldRow label="E-posta">
                  <input
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                    style={panelInput}
                    placeholder="ornek@mail.com"
                  />
                </FieldRow>
                <button onClick={saveProfile} style={primaryBtn}>Kaydet</button>
              </>
            )}

            {activeSettingsPanel === "password" && (
              <>
                <FieldRow label="Mevcut Şifre">
                  <input
                    type="password"
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                    style={panelInput}
                    placeholder="Mevcut şifren"
                  />
                </FieldRow>
                <FieldRow label="Yeni Şifre">
                  <input
                    type="password"
                    value={passwordForm.next}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
                    style={panelInput}
                    placeholder="En az 6 karakter"
                  />
                </FieldRow>
                <FieldRow label="Yeni Şifre (Tekrar)">
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                    style={panelInput}
                    placeholder="Yeni şifreyi tekrar yaz"
                  />
                </FieldRow>
                <button onClick={savePassword} style={primaryBtn}>Şifreyi Güncelle</button>
              </>
            )}

            {activeSettingsPanel === "delete" && (
              <>
                <p style={{ color: "#6b7280", fontSize: 13, marginBottom: 10 }}>
                  Bu işlem geri alınamaz. Onay için aşağıya <strong>SIL</strong> yaz.
                </p>
                <input
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  style={panelInput}
                  placeholder="SIL"
                />
                <button onClick={removeAccount} style={dangerBtn}>Hesabımı Kalıcı Olarak Sil</button>
              </>
            )}

            {settingsMessage && (
              <div style={{ marginTop: 12, fontSize: 13, color: "#9a3412", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, padding: "10px 12px" }}>
                {settingsMessage}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
            zIndex: 150, backdropFilter: "blur(4px)",
          }}
        />
      )}

      {/* Sidebar */}
      <aside style={{
        position: "fixed",
        top: 0, left: 0, bottom: 0,
        width: 280,
        background: "linear-gradient(180deg, #1a0a00 0%, #2d1200 100%)",
        zIndex: 200,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform .35s cubic-bezier(.4,0,.2,1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: sidebarOpen ? "8px 0 40px rgba(0,0,0,0.4)" : "none",
      }}>
        <div style={{ padding: "28px 24px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <img src="/logo.svg" alt="Tarif Evim" style={{ height: 44, width: "auto", display: "block" }} />
            <button onClick={() => setSidebarOpen(false)} style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.5)",
              fontSize: 20, cursor: "pointer",
            }}>✕</button>
          </div>
        </div>

        <div style={{ padding: "24px 16px", overflowY: "auto", minHeight: 0, flex: 1, overscrollBehavior: "contain" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16, paddingLeft: 8 }}>
            Kategoriler
          </p>
          {categories.map((cat) => (
            <Link
              key={cat.label}
              to={`/?category=${cat.label}`}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "13px 16px",
                borderRadius: 14,
                marginBottom: 6,
                textDecoration: "none",
                transition: "background .2s",
                cursor: "pointer",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.08)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{
                width: 40, height: 40,
                borderRadius: 12,
                background: `${cat.color}22`,
                border: `1px solid ${cat.color}44`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18,
              }}>{cat.icon}</span>
              <span style={{ color: "white", fontWeight: 700, fontSize: 15 }}>{cat.label}</span>
            </Link>
          ))}
        </div>

        <div style={{ padding: "0 16px", marginTop: "auto", paddingBottom: 24 }}>
          <div style={{
            background: "linear-gradient(135deg, #ff6b35, #f7931e)",
            borderRadius: 16,
            padding: "20px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>👨‍⚕️</div>
            <p style={{ color: "white", fontWeight: 700, fontSize: 13, marginBottom: 4 }}>Diyetisyen Onaylı</p>
            <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Uzman diyetisyenler tarafından incelenmiş tarifler</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", minHeight: "calc(100vh - 68px)" }}>
        <Outlet />
      </main>
    </div>
  );
}

function NavBtn({ to, icon, label }) {
  return (
    <Link to={to} title={label} style={{
      width: 40, height: 40,
      borderRadius: "50%",
      background: "rgba(255,255,255,0.15)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 16, textDecoration: "none",
      color: "white",
      transition: "background .2s",
      border: "1px solid rgba(255,255,255,0.2)",
    }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.3)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
    >
      {icon}
    </Link>
  );
}

function FieldRow({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#4b5563", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const menuItemLink = {
  display: "block",
  width: "100%",
  textDecoration: "none",
  color: "#374151",
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 12px",
};

const menuItemButton = {
  width: "100%",
  textAlign: "left",
  background: "#fff",
  border: "1px solid #f3e8dd",
  color: "#374151",
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  cursor: "pointer",
};

const menuItemDisabled = {
  width: "100%",
  textAlign: "left",
  background: "#f9fafb",
  border: "1px solid #f3f4f6",
  color: "#9ca3af",
  fontSize: 12,
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  cursor: "not-allowed",
};

const menuItemDanger = {
  width: "100%",
  textAlign: "left",
  background: "#fff1f2",
  border: "1px solid #ffe4e6",
  color: "#be123c",
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 8,
  cursor: "pointer",
};

const menuItemDelete = {
  width: "100%",
  textAlign: "left",
  background: "#fff",
  border: "1px solid #fecdd3",
  color: "#be123c",
  fontSize: 13,
  fontWeight: 700,
  borderRadius: 10,
  padding: "10px 12px",
  marginTop: 6,
  cursor: "pointer",
};

const closeBtn = {
  width: 32,
  height: 32,
  borderRadius: "50%",
  border: "1px solid #f3e8dd",
  background: "#fff",
  color: "#6b7280",
  cursor: "pointer",
};

const panelInput = {
  width: "100%",
  border: "2px solid #f0e8de",
  borderRadius: 12,
  padding: "11px 12px",
  fontSize: 14,
  color: "#1f2937",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const primaryBtn = {
  width: "100%",
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #ff6b35, #f7931e)",
  color: "white",
  padding: "11px 14px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  marginTop: 6,
};

const dangerBtn = {
  width: "100%",
  border: "1px solid #fecdd3",
  borderRadius: 12,
  background: "#fff1f2",
  color: "#be123c",
  padding: "11px 14px",
  fontWeight: 800,
  fontSize: 13,
  cursor: "pointer",
  marginTop: 10,
};
