"use client";

import { useState, useEffect } from "react";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import { useAdminAuth } from "../../../context/AdminAuthContext";

const TABS = [
  { key: "branding", label: "🎨 Branding" },
  { key: "hero", label: "🖼️ Hero Banner" },
  { key: "categories", label: "📂 Categories" },
  { key: "colors", label: "🎨 Colors & Font" },
  { key: "social", label: "🔗 Social Links" },
  { key: "contact", label: "📞 Contact" },
];

const FONT_OPTIONS = [
  "Inter",
  "Roboto",
  "Poppins",
  "Nunito",
  "Lato",
  "Montserrat",
];

const COLOR_PRESETS = [
  { name: "Purple", primary: "#6C3AF5", secondary: "#F59E0B" },
  { name: "Blue", primary: "#2563EB", secondary: "#F59E0B" },
  { name: "Green", primary: "#059669", secondary: "#F59E0B" },
  { name: "Red", primary: "#DC2626", secondary: "#F59E0B" },
  { name: "Pink", primary: "#DB2777", secondary: "#F59E0B" },
  { name: "Orange", primary: "#EA580C", secondary: "#F59E0B" },
];

export default function AdminSettingsPage() {
  const { refreshSettings } = useSiteSettings();
  const { admin } = useAdminAuth();
  const getToken = () => localStorage.getItem("vexo_admin_token");
  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Branding
  const [siteName, setSiteName] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [faviconFile, setFaviconFile] = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");

  // Hero
  const [heroHeading, setHeroHeading] = useState("");
  const [heroSubheading, setHeroSubheading] = useState("");
  const [heroButtonText, setHeroButtonText] = useState("");
  const [heroBannerFile, setHeroBannerFile] = useState(null);
  const [heroBannerPreview, setHeroBannerPreview] = useState("");

  // Colors
  const [primaryColor, setPrimaryColor] = useState("#6C3AF5");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");
  const [fontFamily, setFontFamily] = useState("Inter");

  // Categories
  const [categories, setCategories] = useState([]);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📦");
  const [newCatSlug, setNewCatSlug] = useState("");

  // Social
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [twitterUrl, setTwitterUrl] = useState("");
  const [chatButtonEnabled, setChatButtonEnabled] = useState(true);
  const [chatButtonNumber, setChatButtonNumber] = useState("");

  // Contact
  const [supportEmail, setSupportEmail] = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [footerAddress, setFooterAddress] = useState("");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const s = res.data.settings;
      setSiteName(s.siteName || "");
      setLogoPreview(s.logoUrl || "");
      setFaviconPreview(s.faviconUrl || "");
      setHeroHeading(s.heroHeading || "");
      setHeroSubheading(s.heroSubheading || "");
      setHeroButtonText(s.heroButtonText || "");
      setHeroBannerPreview(s.heroBannerImage || "");
      setPrimaryColor(s.primaryColor || "#6C3AF5");
      setSecondaryColor(s.secondaryColor || "#F59E0B");
      setFontFamily(s.fontFamily || "Inter");
      setCategories(s.categories || []);
      setWhatsappNumber(s.whatsappNumber || "");
      setFacebookUrl(s.facebookUrl || "");
      setInstagramUrl(s.instagramUrl || "");
      setYoutubeUrl(s.youtubeUrl || "");
      setTwitterUrl(s.twitterUrl || "");
      setChatButtonEnabled(s.chatButtonEnabled ?? true);
      setChatButtonNumber(s.chatButtonNumber || "");
      setSupportEmail(s.supportEmail || "");
      setSupportWhatsapp(s.supportWhatsapp || "");
      setFooterAddress(s.footerAddress || "");
    } catch (err) {
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("siteName", siteName);
      formData.append("heroHeading", heroHeading);
      formData.append("heroSubheading", heroSubheading);
      formData.append("heroButtonText", heroButtonText);
      formData.append("primaryColor", primaryColor);
      formData.append("secondaryColor", secondaryColor);
      formData.append("fontFamily", fontFamily);
      formData.append("whatsappNumber", whatsappNumber);
      formData.append("facebookUrl", facebookUrl);
      formData.append("instagramUrl", instagramUrl);
      formData.append("youtubeUrl", youtubeUrl);
      formData.append("twitterUrl", twitterUrl);
      formData.append("chatButtonEnabled", chatButtonEnabled);
      formData.append("chatButtonNumber", chatButtonNumber);
      formData.append("supportEmail", supportEmail);
      formData.append("supportWhatsapp", supportWhatsapp);
      formData.append("footerAddress", footerAddress);
      formData.append("categories", JSON.stringify(categories));

      if (logoFile) formData.append("logo", logoFile);
      if (faviconFile) formData.append("favicon", faviconFile);
      if (heroBannerFile) formData.append("heroBanner", heroBannerFile);

      await api.put("/settings", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${getToken()}`,
        },
      });

      await refreshSettings();
      toast.success("Settings saved successfully!");
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleFaviconChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setHeroBannerFile(file);
      setHeroBannerPreview(URL.createObjectURL(file));
    }
  };

  const addCategory = () => {
    if (!newCatName || !newCatSlug) {
      toast.error("Name and slug required");
      return;
    }
    const id = newCatSlug.toLowerCase().replace(/\s+/g, "-");
    setCategories([
      ...categories,
      { id, name: newCatName, icon: newCatIcon, slug: id, isActive: true },
    ]);
    setNewCatName("");
    setNewCatIcon("📦");
    setNewCatSlug("");
  };

  const toggleCategory = (idx) => {
    const updated = [...categories];
    updated[idx].isActive = !updated[idx].isActive;
    setCategories(updated);
  };

  const removeCategory = (idx) => {
    if (!window.confirm("Are you sure you want to remove this category?"))
      return;
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const inputStyle = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid var(--border-default)",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "Inter, sans-serif",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "6px",
    fontFamily: "Inter, sans-serif",
  };

  const cardStyle = {
    background: "white",
    borderRadius: "12px",
    padding: "24px",
    border: "1px solid var(--border-default)",
    marginBottom: "20px",
  };

  if (loading)
    return (
      <p
        style={{
          fontFamily: "Inter, sans-serif",
          color: "var(--text-muted)",
        }}
      >
        Loading settings...
      </p>
    );

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              fontFamily: "Inter, sans-serif",
              marginBottom: "4px",
            }}
          >
            ⚙️ Site Settings
          </h1>
          <p
            style={{
              color: "var(--text-muted)",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
            }}
          >
            Manage your website appearance and configuration
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            padding: "10px 24px",
            background: "var(--brand-primary)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1,
            fontSize: "14px",
          }}
        >
          {saving ? "⏳ Saving..." : "💾 Save All Settings"}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          flexWrap: "wrap",
        }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "Inter, sans-serif",
              cursor: "pointer",
              border: "none",
              background:
                activeTab === t.key ? "var(--brand-primary)" : "white",
              color: activeTab === t.key ? "white" : "var(--text-secondary)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: "680px" }}>
        {/* BRANDING TAB */}
        {activeTab === "branding" && (
          <>
            <div style={cardStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "20px",
                }}
              >
                🏷️ Site Name
              </h2>
              <div>
                <label style={labelStyle}>Site Name</label>
                <input
                  value={siteName}
                  onChange={(e) => setSiteName(e.target.value)}
                  placeholder="e.g. VEXO"
                  style={inputStyle}
                />
              </div>
            </div>

            <div style={cardStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "20px",
                }}
              >
                🖼️ Logo
              </h2>
              {logoPreview && (
                <img
                  src={logoPreview}
                  alt="logo"
                  style={{
                    height: "60px",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid var(--border-default)",
                  }}
                />
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  border: "2px dashed var(--border-default)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                }}
              >
                <span style={{ fontSize: "20px" }}>📁</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    color: "var(--text-secondary)",
                  }}
                >
                  {logoFile
                    ? logoFile.name
                    : "Click to upload logo (PNG/SVG recommended)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>

            <div style={cardStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "20px",
                }}
              >
                ⭐ Favicon
              </h2>
              {faviconPreview && (
                <img
                  src={faviconPreview}
                  alt="favicon"
                  style={{
                    height: "40px",
                    width: "40px",
                    borderRadius: "6px",
                    marginBottom: "12px",
                    border: "1px solid var(--border-default)",
                  }}
                />
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  border: "2px dashed var(--border-default)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                }}
              >
                <span style={{ fontSize: "20px" }}>📁</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    color: "var(--text-secondary)",
                  }}
                >
                  {faviconFile
                    ? faviconFile.name
                    : "Click to upload favicon (32x32 ICO/PNG)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFaviconChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </>
        )}

        {/* HERO TAB */}
        {activeTab === "hero" && (
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                marginBottom: "20px",
              }}
            >
              🖼️ Hero Banner
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Heading</label>
              <input
                value={heroHeading}
                onChange={(e) => setHeroHeading(e.target.value)}
                placeholder="Buy & Sell Anything in Attock"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Subheading</label>
              <input
                value={heroSubheading}
                onChange={(e) => setHeroSubheading(e.target.value)}
                placeholder="Find great deals near you"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={labelStyle}>Button Text</label>
              <input
                value={heroButtonText}
                onChange={(e) => setHeroButtonText(e.target.value)}
                placeholder="Browse Ads"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Banner Image</label>
              {heroBannerPreview && (
                <img
                  src={heroBannerPreview}
                  alt="banner"
                  style={{
                    width: "100%",
                    height: "160px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    border: "1px solid var(--border-default)",
                  }}
                />
              )}
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "12px 16px",
                  border: "2px dashed var(--border-default)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  background: "var(--bg-secondary)",
                }}
              >
                <span style={{ fontSize: "20px" }}>📁</span>
                <span
                  style={{
                    fontSize: "13px",
                    fontFamily: "Inter, sans-serif",
                    color: "var(--text-secondary)",
                  }}
                >
                  {heroBannerFile
                    ? heroBannerFile.name
                    : "Click to upload banner image (1200x400 recommended)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB */}
        {activeTab === "categories" && (
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                marginBottom: "20px",
              }}
            >
              📂 Categories
            </h2>

            {/* Existing categories */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginBottom: "24px",
              }}
            >
              {categories.map((cat, idx) => (
                <div
                  key={cat.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    border: "1px solid var(--border-default)",
                    borderRadius: "8px",
                    background: cat.isActive ? "white" : "#f9fafb",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{cat.icon}</span>
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "600",
                      fontSize: "14px",
                      color: cat.isActive
                        ? "var(--text-primary)"
                        : "var(--text-muted)",
                    }}
                  >
                    {cat.name}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      color: "var(--text-muted)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    /{cat.slug}
                  </span>
                  <button
                    onClick={() => toggleCategory(idx)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      background: cat.isActive ? "#d1fae5" : "#fee2e2",
                      color: cat.isActive ? "#065f46" : "#991b1b",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {cat.isActive ? "✅ Active" : "❌ Hidden"}
                  </button>
                  <button
                    onClick={() => removeCategory(idx)}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: "600",
                      border: "none",
                      cursor: "pointer",
                      background: "#fef2f2",
                      color: "#b91c1c",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add new category */}
            <div
              style={{
                borderTop: "1px solid var(--border-default)",
                paddingTop: "20px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "12px",
                }}
              >
                ➕ Add New Category
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "60px 1fr 1fr",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <label style={labelStyle}>Icon</label>
                  <input
                    value={newCatIcon}
                    onChange={(e) => setNewCatIcon(e.target.value)}
                    style={{
                      ...inputStyle,
                      textAlign: "center",
                      fontSize: "20px",
                    }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Name</label>
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="e.g. Books"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Slug</label>
                  <input
                    value={newCatSlug}
                    onChange={(e) => setNewCatSlug(e.target.value)}
                    placeholder="e.g. books"
                    style={inputStyle}
                  />
                </div>
              </div>
              <button
                onClick={addCategory}
                style={{
                  padding: "10px 20px",
                  background: "var(--brand-primary)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: "600",
                  fontFamily: "Inter, sans-serif",
                  cursor: "pointer",
                }}
              >
                ➕ Add Category
              </button>
            </div>
          </div>
        )}

        {/* COLORS TAB */}
        {activeTab === "colors" && (
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                marginBottom: "20px",
              }}
            >
              🎨 Colors & Font
            </h2>

            {/* Color presets */}
            <div style={{ marginBottom: "24px" }}>
              <label style={labelStyle}>Color Presets</label>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setPrimaryColor(preset.primary);
                      setSecondaryColor(preset.secondary);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px",
                      borderRadius: "8px",
                      border:
                        primaryColor === preset.primary
                          ? "2px solid var(--text-primary)"
                          : "2px solid var(--border-default)",
                      background: "white",
                      cursor: "pointer",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "13px",
                      fontWeight: "600",
                    }}
                  >
                    <span
                      style={{
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        background: preset.primary,
                        display: "inline-block",
                      }}
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              <div>
                <label style={labelStyle}>Primary Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{
                      width: "48px",
                      height: "40px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Secondary Color</label>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{
                      width: "48px",
                      height: "40px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  />
                  <input
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Font Family</label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {FONT_OPTIONS.map((font) => (
                  <button
                    key={font}
                    onClick={() => setFontFamily(font)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "13px",
                      fontWeight: "600",
                      cursor: "pointer",
                      border: "none",
                      fontFamily: font,
                      background:
                        fontFamily === font
                          ? "var(--brand-primary)"
                          : "#f3f4f6",
                      color:
                        fontFamily === font ? "white" : "var(--text-secondary)",
                    }}
                  >
                    {font}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SOCIAL TAB */}
        {activeTab === "social" && (
          <>
            <div style={cardStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "20px",
                }}
              >
                🔗 Social Media Links
              </h2>
              {[
                {
                  label: "📘 Facebook URL",
                  value: facebookUrl,
                  set: setFacebookUrl,
                  placeholder: "https://facebook.com/yourpage",
                },
                {
                  label: "📸 Instagram URL",
                  value: instagramUrl,
                  set: setInstagramUrl,
                  placeholder: "https://instagram.com/yourpage",
                },
                {
                  label: "▶️ YouTube URL",
                  value: youtubeUrl,
                  set: setYoutubeUrl,
                  placeholder: "https://youtube.com/yourchannel",
                },
                {
                  label: "🐦 Twitter/X URL",
                  value: twitterUrl,
                  set: setTwitterUrl,
                  placeholder: "https://twitter.com/yourpage",
                },
                {
                  label: "💬 WhatsApp Number",
                  value: whatsappNumber,
                  set: setWhatsappNumber,
                  placeholder: "923001234567",
                },
              ].map((field) => (
                <div key={field.label} style={{ marginBottom: "16px" }}>
                  <label style={labelStyle}>{field.label}</label>
                  <input
                    value={field.value}
                    onChange={(e) => field.set(e.target.value)}
                    placeholder={field.placeholder}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>

            <div style={cardStyle}>
              <h2
                style={{
                  fontSize: "16px",
                  fontWeight: "700",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "20px",
                }}
              >
                💬 WhatsApp Chat Button
              </h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px",
                  border: "1px solid var(--border-default)",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <p
                    style={{
                      fontWeight: "600",
                      fontFamily: "Inter, sans-serif",
                      fontSize: "14px",
                    }}
                  >
                    Enable Chat Button
                  </p>
                  <p
                    style={{
                      color: "var(--text-muted)",
                      fontSize: "12px",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Show floating WhatsApp button on site
                  </p>
                </div>
                <button
                  onClick={() => setChatButtonEnabled(!chatButtonEnabled)}
                  style={{
                    width: "48px",
                    height: "26px",
                    borderRadius: "13px",
                    background: chatButtonEnabled
                      ? "var(--brand-primary)"
                      : "var(--border-default)",
                    border: "none",
                    cursor: "pointer",
                    position: "relative",
                    transition: "background 0.2s",
                  }}
                >
                  <span
                    style={{
                      position: "absolute",
                      top: "3px",
                      left: chatButtonEnabled ? "25px" : "3px",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      background: "white",
                      transition: "left 0.2s",
                    }}
                  />
                </button>
              </div>
              {chatButtonEnabled && (
                <div>
                  <label style={labelStyle}>Chat Button WhatsApp Number</label>
                  <input
                    value={chatButtonNumber}
                    onChange={(e) => setChatButtonNumber(e.target.value)}
                    placeholder="923001234567"
                    style={inputStyle}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* CONTACT TAB */}
        {activeTab === "contact" && (
          <div style={cardStyle}>
            <h2
              style={{
                fontSize: "16px",
                fontWeight: "700",
                fontFamily: "Inter, sans-serif",
                marginBottom: "20px",
              }}
            >
              📞 Contact & Support
            </h2>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Support Email</label>
              <input
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                placeholder="support@vexo.com"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: "16px" }}>
              <label style={labelStyle}>Support WhatsApp Number</label>
              <input
                value={supportWhatsapp}
                onChange={(e) => setSupportWhatsapp(e.target.value)}
                placeholder="923001234567"
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Footer Address</label>
              <input
                value={footerAddress}
                onChange={(e) => setFooterAddress(e.target.value)}
                placeholder="Attock, Pakistan"
                style={inputStyle}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
