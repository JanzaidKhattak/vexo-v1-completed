"use client";

import { useState, useEffect, useRef } from "react";
import api from "../../../lib/axios";
import toast from "react-hot-toast";
import { useSiteSettings } from "../../../context/SiteSettingsContext";

const TABS = [
  { key: "branding",    label: "Branding"      },
  { key: "hero",        label: "Hero Banner"   },
  { key: "categories",  label: "Categories"    },
  { key: "colors",      label: "Colors & Font" },
  { key: "social",      label: "Social Links"  },
  { key: "contact",     label: "Contact"       },
];

const FONT_OPTIONS = ["Inter","Roboto","Poppins","Nunito","Lato","Montserrat"];

const COLOR_PRESETS = [
  { name: "Purple", primary: "#6C3AF5" },
  { name: "Blue",   primary: "#2563EB" },
  { name: "Green",  primary: "#059669" },
  { name: "Red",    primary: "#DC2626" },
  { name: "Pink",   primary: "#DB2777" },
  { name: "Orange", primary: "#EA580C" },
];

// Icon size options in px
const ICON_SIZES = [
  { label: "Small",    value: 20  },
  { label: "Standard", value: 28  },
  { label: "Medium",   value: 36  },
  { label: "Large",    value: 48  },
];

const getToken = () => localStorage.getItem("vexo_admin_token");

// ── Reusable input / label styles ────────────────────────────────────────────
const inp = {
  width: "100%", padding: "11px 14px",
  border: "1.5px solid #E2E8F0", borderRadius: "10px",
  fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
  outline: "none", boxSizing: "border-box", color: "#0f172a",
  transition: "border-color 0.15s",
};
const lbl = {
  display: "block", fontSize: "11px", fontWeight: "700",
  marginBottom: "7px", fontFamily: "'DM Sans', sans-serif",
  color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em",
};
const card = {
  background: "white", borderRadius: "16px", padding: "28px",
  border: "1px solid #E2E8F0", marginBottom: "18px",
  boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
};

// ── Section header inside card ────────────────────────────────────────────────
function SectionTitle({ children }) {
  return (
    <p style={{ fontSize: "15px", fontWeight: "800", color: "#0f172a",
      fontFamily: "'DM Sans', sans-serif", marginBottom: "22px",
      letterSpacing: "-0.01em" }}>
      {children}
    </p>
  );
}

// ── Upload zone ───────────────────────────────────────────────────────────────
function UploadZone({ label, accept, onChange, fileName, hint }) {
  return (
    <label style={{ display: "block", cursor: "pointer" }}>
      <div style={{ padding: "18px 20px", border: "2px dashed #E2E8F0",
        borderRadius: "12px", background: "#FAFAFA", textAlign: "center",
        transition: "all 0.15s" }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "#6C3AF5"; e.currentTarget.style.background = "#FAF5FF" }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.background = "#FAFAFA" }}
      >
        <p style={{ fontSize: "13px", fontWeight: "600", color: "#64748B",
          fontFamily: "'DM Sans', sans-serif", marginBottom: "2px" }}>
          {fileName ? fileName : label}
        </p>
        {hint && (
          <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
            {hint}
          </p>
        )}
      </div>
      <input type="file" accept={accept} onChange={onChange} style={{ display: "none" }} />
    </label>
  );
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none",
      background: value ? "#6C3AF5" : "#CBD5E1", cursor: "pointer",
      position: "relative", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: "3px",
        left: value ? "23px" : "3px",
        width: "18px", height: "18px",
        borderRadius: "50%", background: "white",
        transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

// ── Category Row ──────────────────────────────────────────────────────────────
function CategoryRow({ cat, idx, onToggle, onRemove, onEdit, onIconUpload }) {
  const [editing, setEditing]     = useState(false);
  const [editName, setEditName]   = useState(cat.name);
  const [editSlug, setEditSlug]   = useState(cat.slug || cat.id);
  const iconRef = useRef(null);

  const saveEdit = () => {
    if (!editName.trim()) { toast.error("Name required"); return; }
    onEdit(idx, { name: editName, slug: editSlug });
    setEditing(false);
  };

  return (
    <div style={{
      border: "1.5px solid #E2E8F0", borderRadius: "12px",
      background: cat.isActive ? "white" : "#F8FAFC",
      overflow: "hidden", transition: "all 0.15s",
    }}>
      {/* Main row */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px 16px" }}>

        {/* Icon preview + upload */}
        <div style={{ position: "relative", flexShrink: 0 }}>
          <div style={{
            width: `${cat.iconSize || 28}px`, height: `${cat.iconSize || 28}px`,
            borderRadius: "8px", background: "#EDE9FE",
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", cursor: "pointer",
            transition: "all 0.15s",
          }}
            onClick={() => iconRef.current?.click()}
            title="Click to change icon"
          >
            {cat.iconUrl ? (
              <img src={cat.iconUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
            ) : cat.icon ? (
              <span style={{ fontSize: `${(cat.iconSize || 28) * 0.7}px` }}>{cat.icon}</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6C3AF5" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
              </svg>
            )}
          </div>
          <input ref={iconRef} type="file" accept="image/*" style={{ display: "none" }}
            onChange={e => { const f = e.target.files[0]; if (f) onIconUpload(idx, f) }} />
        </div>

        {/* Name / slug */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontWeight: "700", fontSize: "14px", color: cat.isActive ? "#0f172a" : "#94A3B8",
            fontFamily: "'DM Sans', sans-serif", marginBottom: "1px",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {cat.name}
          </p>
          <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
            /{cat.slug || cat.id}
          </p>
        </div>

        {/* Homepage toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap" }}>
            Homepage
          </span>
          <Toggle value={cat.showOnHome ?? cat.isActive} onChange={v => onToggle(idx, "showOnHome", v)} />
        </div>

        {/* Active toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
            Active
          </span>
          <Toggle value={cat.isActive} onChange={v => onToggle(idx, "isActive", v)} />
        </div>

        {/* Edit button */}
        <button onClick={() => { setEditing(!editing); setEditName(cat.name); setEditSlug(cat.slug || cat.id); }}
          style={{ padding: "6px 12px", background: editing ? "#EDE9FE" : "#F8FAFC",
            color: editing ? "#6C3AF5" : "#64748B", border: "1.5px solid",
            borderColor: editing ? "#C4B5FD" : "#E2E8F0",
            borderRadius: "8px", fontSize: "12px", fontWeight: "700",
            fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
          {editing ? "Cancel" : "Edit"}
        </button>

        {/* Remove */}
        <button onClick={() => onRemove(idx)}
          style={{ padding: "6px 12px", background: "#FEF2F2", color: "#B91C1C",
            border: "1.5px solid #FECACA", borderRadius: "8px", fontSize: "12px",
            fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer", transition: "all 0.15s" }}>
          Remove
        </button>
      </div>

      {/* Edit panel */}
      {editing && (
        <div style={{ padding: "16px 16px 18px", borderTop: "1px solid #F1F5F9",
          background: "#FAFAFA", animation: "fadeIn 0.2s ease" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label style={lbl}>Category Name</label>
              <input value={editName} onChange={e => setEditName(e.target.value)}
                style={inp} onFocus={e => e.target.style.borderColor = "#6C3AF5"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
            <div>
              <label style={lbl}>Slug</label>
              <input value={editSlug} onChange={e => setEditSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))}
                style={inp} onFocus={e => e.target.style.borderColor = "#6C3AF5"}
                onBlur={e => e.target.style.borderColor = "#E2E8F0"} />
            </div>
          </div>

          {/* Icon size */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Icon Size</label>
            <div style={{ display: "flex", gap: "8px" }}>
              {ICON_SIZES.map(s => (
                <button key={s.value} onClick={() => onEdit(idx, { iconSize: s.value })}
                  style={{ padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: (cat.iconSize || 28) === s.value ? "#6C3AF5" : "#E2E8F0",
                    background: (cat.iconSize || 28) === s.value ? "#EDE9FE" : "white",
                    color: (cat.iconSize || 28) === s.value ? "#6C3AF5" : "#64748B",
                    transition: "all 0.15s" }}>
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Icon upload */}
          <div style={{ marginBottom: "14px" }}>
            <label style={lbl}>Upload Custom Icon</label>
            <UploadZone
              label="Click to upload icon (PNG/SVG recommended)"
              accept="image/*"
              hint="From your PC, or download from FontAwesome / Icons8 and upload here"
              onChange={e => { const f = e.target.files[0]; if (f) onIconUpload(idx, f) }}
              fileName={null}
            />
          </div>

          <button onClick={saveEdit} style={{ padding: "9px 22px", background: "#6C3AF5",
            color: "white", border: "none", borderRadius: "8px", fontSize: "13px",
            fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}>
            Save Changes
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AdminSettingsPage() {
  const { refreshSettings } = useSiteSettings();
  const [activeTab, setActiveTab] = useState("branding");
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);

  // Branding
  const [siteName,       setSiteName]       = useState("");
  const [logoFile,       setLogoFile]       = useState(null);
  const [logoPreview,    setLogoPreview]    = useState("");
  const [faviconFile,    setFaviconFile]    = useState(null);
  const [faviconPreview, setFaviconPreview] = useState("");

  // Hero
  const [heroHeading,     setHeroHeading]     = useState("");
  const [heroSubheading,  setHeroSubheading]  = useState("");
  const [heroButtonText,  setHeroButtonText]  = useState("");
  const [heroBannerFile,  setHeroBannerFile]  = useState(null);
  const [heroBannerPreview, setHeroBannerPreview] = useState("");

  // Colors
  const [primaryColor,   setPrimaryColor]   = useState("#6C3AF5");
  const [secondaryColor, setSecondaryColor] = useState("#F59E0B");
  const [fontFamily,     setFontFamily]     = useState("Inter");

  // Categories
  const [categories,  setCategories]  = useState([]);
  const [newCatName,  setNewCatName]  = useState("");
  const [newCatSlug,  setNewCatSlug]  = useState("");
  const [newCatFile,  setNewCatFile]  = useState(null);
  const [newCatPreview, setNewCatPreview] = useState("");
  const [newCatIcon,  setNewCatIcon]  = useState("");
  const [newCatSize,  setNewCatSize]  = useState(28);
  const [newCatShowOnHome, setNewCatShowOnHome] = useState(true);
  const [catIconUploads, setCatIconUploads] = useState({});

  // Social
  const [whatsappNumber,    setWhatsappNumber]    = useState("");
  const [facebookUrl,       setFacebookUrl]       = useState("");
  const [instagramUrl,      setInstagramUrl]      = useState("");
  const [youtubeUrl,        setYoutubeUrl]        = useState("");
  const [twitterUrl,        setTwitterUrl]        = useState("");
  const [chatButtonEnabled, setChatButtonEnabled] = useState(true);
  const [chatButtonNumber,  setChatButtonNumber]  = useState("");

  // Contact
  const [supportEmail,    setSupportEmail]    = useState("");
  const [supportWhatsapp, setSupportWhatsapp] = useState("");
  const [footerAddress,   setFooterAddress]   = useState("");

  useEffect(() => { fetchSettings() }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/settings", { headers: { Authorization: `Bearer ${getToken()}` } });
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
      setCategories((s.categories || []).map(c => ({ ...c, showOnHome: c.showOnHome !== undefined ? c.showOnHome : true })));
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
    } catch { toast.error("Failed to load settings") }
    finally { setLoading(false) }
  };

  // Upload individual category icon files to Cloudinary via existing upload endpoint
  const uploadCatIcon = async (file) => {
    const fd = new FormData();
    fd.append("image", file);
    try {
      const res = await api.post("/upload/image", fd, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken()}` }
      });
      return res.data.url || res.data.imageUrl || "";
    } catch {
      // Upload failed — return empty string, don't save blob URL
      toast.error("Icon upload failed. Try again.");
      return "";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Categories ko clean karo — blob URLs hata do, backend upload karega
      const catsToSave = categories.map(c => {
        const { _blobPreview, ...rest } = c;
        // Agar blob URL hai toh empty karo — backend file se set karega
        if (rest.iconUrl && rest.iconUrl.startsWith("blob:")) rest.iconUrl = "";
        return rest;
      });

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
      formData.append("categories", JSON.stringify(catsToSave));

      // Standard files
      if (logoFile)       formData.append("logo",       logoFile);
      if (faviconFile)    formData.append("favicon",    faviconFile);
      if (heroBannerFile) formData.append("heroBanner", heroBannerFile);

      // Category icon files — field name: catIcon_INDEX
      Object.entries(catIconUploads).forEach(([idx, file]) => {
        formData.append(`catIcon_${idx}`, file);
      });

      const res = await api.put("/settings", formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${getToken()}` }
      });

      // Backend se returned settings use karo — real Cloudinary URLs hongi
      if (res.data.settings?.categories) {
        setCategories(res.data.settings.categories);
      }
      setCatIconUploads({});
      await refreshSettings();
      toast.success("Settings saved!");
    } catch { toast.error("Failed to save") }
    finally { setSaving(false) }
  };

  // Category helpers
  const handleCatToggle = (idx, field, value) => {
    const u = [...categories];
    u[idx] = { ...u[idx], [field]: value };
    setCategories(u);
  };

  const handleCatEdit = (idx, changes) => {
    const u = [...categories];
    u[idx] = { ...u[idx], ...changes };
    setCategories(u);
  };

  const handleCatIconUpload = (idx, file) => {
    setCatIconUploads(prev => ({ ...prev, [idx]: file }));
    // Show blob preview in UI only — actual Cloudinary URL set on Save
    const blobUrl = URL.createObjectURL(file);
    const u = [...categories];
    u[idx] = { ...u[idx], iconUrl: blobUrl, _blobPreview: true };
    setCategories(u);
  };

  const handleRemoveCat = (idx) => {
    if (!window.confirm("Remove this category?")) return;
    setCategories(categories.filter((_, i) => i !== idx));
  };

  const addCategory = () => {
    if (!newCatName || !newCatSlug) { toast.error("Name and slug required"); return; }
    const id = newCatSlug.toLowerCase().replace(/\s+/g, "-");
    const newIndex = categories.length;
    setCategories(prev => {
      const updated = [...prev, {
        id, name: newCatName, slug: id,
        icon: newCatIcon || "📦",
        iconUrl: "",
        iconSize: newCatSize,
        isActive: true,
        showOnHome: newCatShowOnHome,
      }];
      return updated;
    });
    if (newCatFile) {
      setCatIconUploads(prev => ({ ...prev, [newIndex]: newCatFile }));
    }
    setNewCatName(""); setNewCatSlug(""); setNewCatIcon("");
    setNewCatFile(null); setNewCatPreview(""); setNewCatSize(28);
    setNewCatShowOnHome(true);
    toast.success("Category added! Press Save All Settings to upload icon.");
  };

  const focusIn  = e => e.target.style.borderColor = "#6C3AF5";
  const focusOut = e => e.target.style.borderColor = "#E2E8F0";

  if (loading) return (
    <div style={{ padding: "32px", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "300px" }}>
      <div style={{ width: "32px", height: "32px", borderRadius: "50%", border: "3px solid #E2E8F0", borderTopColor: "#6C3AF5", animation: "spin 0.75s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ padding: "32px", background: "#F8FAFC", minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes spin   { to { transform: rotate(360deg); } }
        .tab-btn:hover  { border-color: #6C3AF5 !important; color: #6C3AF5 !important; }
        .save-btn:hover { background: #5B2FD4 !important; transform: translateY(-1px) !important; box-shadow: 0 6px 20px rgba(108,58,245,0.3) !important; }
        .inp-focus:focus { border-color: #6C3AF5 !important; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "28px", animation: "fadeUp 0.4s ease", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em", marginBottom: "4px" }}>
            Site Settings
          </h1>
          <p style={{ color: "#94A3B8", fontSize: "14px", fontFamily: "'DM Sans', sans-serif" }}>
            Manage your website appearance and configuration
          </p>
        </div>
        <button onClick={handleSave} disabled={saving} className="save-btn" style={{
          padding: "11px 28px", background: "#6C3AF5", color: "white",
          border: "none", borderRadius: "10px", fontWeight: "700",
          fontFamily: "'DM Sans', sans-serif", cursor: saving ? "not-allowed" : "pointer",
          opacity: saving ? 0.7 : 1, fontSize: "14px",
          transition: "all 0.2s", boxShadow: "0 4px 16px rgba(108,58,245,0.25)",
        }}>
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", marginBottom: "24px", flexWrap: "wrap", animation: "fadeUp 0.4s ease 0.05s both" }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} className="tab-btn" style={{
            padding: "8px 18px", borderRadius: "10px", fontSize: "13px",
            fontWeight: "600", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
            transition: "all 0.15s",
            border: `1.5px solid ${activeTab === t.key ? "#6C3AF5" : "#E2E8F0"}`,
            background: activeTab === t.key ? "#6C3AF5" : "white",
            color: activeTab === t.key ? "white" : "#64748B",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: "700px", animation: "fadeUp 0.4s ease 0.1s both" }}>

        {/* ── BRANDING ─────────────────────────────────────────── */}
        {activeTab === "branding" && (<>
          <div style={card}>
            <SectionTitle>Site Name</SectionTitle>
            <label style={lbl}>Display Name</label>
            <input value={siteName} onChange={e => setSiteName(e.target.value)}
              placeholder="e.g. VEXO" style={inp} onFocus={focusIn} onBlur={focusOut} />
          </div>

          <div style={card}>
            <SectionTitle>Logo</SectionTitle>
            {logoPreview && (
              <img src={logoPreview} alt="logo" style={{ height: "56px", borderRadius: "8px", marginBottom: "14px", border: "1px solid #E2E8F0" }} />
            )}
            <UploadZone label="Click to upload logo"
              accept="image/*" hint="PNG or SVG recommended"
              onChange={e => { const f = e.target.files[0]; if (f) { setLogoFile(f); setLogoPreview(URL.createObjectURL(f)) } }}
              fileName={logoFile?.name} />
          </div>

          <div style={card}>
            <SectionTitle>Favicon</SectionTitle>
            {faviconPreview && (
              <img src={faviconPreview} alt="fav" style={{ width: "40px", height: "40px", borderRadius: "8px", marginBottom: "14px", border: "1px solid #E2E8F0" }} />
            )}
            <UploadZone label="Click to upload favicon"
              accept="image/*" hint="32×32 ICO or PNG recommended"
              onChange={e => { const f = e.target.files[0]; if (f) { setFaviconFile(f); setFaviconPreview(URL.createObjectURL(f)) } }}
              fileName={faviconFile?.name} />
          </div>
        </>)}

        {/* ── HERO ─────────────────────────────────────────────── */}
        {activeTab === "hero" && (
          <div style={card}>
            <SectionTitle>Hero Banner</SectionTitle>
            {[
              { label: "Heading", val: heroHeading, set: setHeroHeading, ph: "Buy & Sell Anything in Attock" },
              { label: "Subheading", val: heroSubheading, set: setHeroSubheading, ph: "Find great deals near you" },
              { label: "Button Text", val: heroButtonText, set: setHeroButtonText, ph: "Browse Ads" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: "16px" }}>
                <label style={lbl}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}
            <label style={lbl}>Banner Image</label>
            {heroBannerPreview && (
              <img src={heroBannerPreview} alt="banner" style={{ width: "100%", height: "150px", objectFit: "cover", borderRadius: "10px", marginBottom: "12px", border: "1px solid #E2E8F0" }} />
            )}
            <UploadZone label="Click to upload banner image"
              accept="image/*" hint="1200×400 recommended"
              onChange={e => { const f = e.target.files[0]; if (f) { setHeroBannerFile(f); setHeroBannerPreview(URL.createObjectURL(f)) } }}
              fileName={heroBannerFile?.name} />
          </div>
        )}

        {/* ── CATEGORIES ───────────────────────────────────────── */}
        {activeTab === "categories" && (<>
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
              <SectionTitle>Categories</SectionTitle>
              <p style={{ fontSize: "12px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                {categories.filter(c => c.isActive).length} active
              </p>
            </div>

            {/* Info */}
            <div style={{ padding: "12px 16px", background: "#EDE9FE", borderRadius: "10px", marginBottom: "18px" }}>
              <p style={{ fontSize: "12px", color: "#5B21B6", fontFamily: "'DM Sans', sans-serif", fontWeight: "500", lineHeight: "1.6" }}>
                Homepage toggle controls whether a category section appears on the home page (max 4 products shown).
                Active toggle controls visibility in the navbar category bar.
                Click Edit on any category to rename, change slug, upload a custom icon, or adjust icon size.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {categories.map((cat, idx) => (
                <CategoryRow key={cat.id + idx} cat={cat} idx={idx}
                  onToggle={handleCatToggle}
                  onRemove={handleRemoveCat}
                  onEdit={handleCatEdit}
                  onIconUpload={handleCatIconUpload}
                />
              ))}
            </div>
          </div>

          {/* Add new category */}
          <div style={card}>
            <SectionTitle>Add New Category</SectionTitle>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "14px" }}>
              <div>
                <label style={lbl}>Category Name</label>
                <input value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="e.g. Books"
                  style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
              <div>
                <label style={lbl}>Slug</label>
                <input value={newCatSlug} onChange={e => setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-"))} placeholder="e.g. books"
                  style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Emoji Icon (optional, or upload below)</label>
              <input value={newCatIcon} onChange={e => setNewCatIcon(e.target.value)} placeholder="📦"
                style={{ ...inp, width: "80px", textAlign: "center", fontSize: "20px" }} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Upload Custom Icon</label>
              {newCatPreview && (
                <img src={newCatPreview} alt="" style={{ width: "40px", height: "40px", borderRadius: "8px", marginBottom: "10px", objectFit: "contain", border: "1px solid #E2E8F0" }} />
              )}
              <UploadZone label="Click to upload icon (PNG/SVG)"
                accept="image/*" hint="Download from FontAwesome or Icons8 and upload here"
                onChange={e => { const f = e.target.files[0]; if (f) { setNewCatFile(f); setNewCatPreview(URL.createObjectURL(f)) } }}
                fileName={newCatFile?.name} />
            </div>

            <div style={{ marginBottom: "14px" }}>
              <label style={lbl}>Icon Size</label>
              <div style={{ display: "flex", gap: "8px" }}>
                {ICON_SIZES.map(s => (
                  <button key={s.value} onClick={() => setNewCatSize(s.value)} style={{
                    padding: "6px 14px", borderRadius: "8px", fontSize: "12px",
                    fontWeight: "700", fontFamily: "'DM Sans', sans-serif", cursor: "pointer",
                    border: "1.5px solid",
                    borderColor: newCatSize === s.value ? "#6C3AF5" : "#E2E8F0",
                    background: newCatSize === s.value ? "#EDE9FE" : "white",
                    color: newCatSize === s.value ? "#6C3AF5" : "#64748B",
                    transition: "all 0.15s",
                  }}>
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <Toggle value={newCatShowOnHome} onChange={setNewCatShowOnHome} />
              <div>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "#0f172a", fontFamily: "'DM Sans', sans-serif" }}>
                  Show on Homepage
                </p>
                <p style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "'DM Sans', sans-serif" }}>
                  Display this category section on the home page
                </p>
              </div>
            </div>

            <button onClick={addCategory} style={{
              padding: "10px 24px", background: "#6C3AF5", color: "white",
              border: "none", borderRadius: "10px", fontWeight: "700",
              fontFamily: "'DM Sans', sans-serif", cursor: "pointer", fontSize: "14px",
            }}>
              Add Category
            </button>
          </div>
        </>)}

        {/* ── COLORS ───────────────────────────────────────────── */}
        {activeTab === "colors" && (
          <div style={card}>
            <SectionTitle>Colors & Font</SectionTitle>

            <label style={{ ...lbl, marginBottom: "10px" }}>Color Presets</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "24px" }}>
              {COLOR_PRESETS.map(p => (
                <button key={p.name} onClick={() => setPrimaryColor(p.primary)} style={{
                  display: "flex", alignItems: "center", gap: "8px",
                  padding: "8px 16px", borderRadius: "10px", cursor: "pointer",
                  border: `1.5px solid ${primaryColor === p.primary ? "#6C3AF5" : "#E2E8F0"}`,
                  background: primaryColor === p.primary ? "#EDE9FE" : "white",
                  fontFamily: "'DM Sans', sans-serif", fontSize: "13px", fontWeight: "600",
                  color: primaryColor === p.primary ? "#6C3AF5" : "#374151",
                  transition: "all 0.15s",
                }}>
                  <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: p.primary, display: "inline-block", flexShrink: 0 }} />
                  {p.name}
                </button>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
              {[
                { label: "Primary Color", val: primaryColor, set: setPrimaryColor },
                { label: "Secondary Color", val: secondaryColor, set: setSecondaryColor },
              ].map(c => (
                <div key={c.label}>
                  <label style={lbl}>{c.label}</label>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input type="color" value={c.val} onChange={e => c.set(e.target.value)}
                      style={{ width: "44px", height: "44px", border: "1.5px solid #E2E8F0", borderRadius: "8px", cursor: "pointer", padding: "2px" }} />
                    <input value={c.val} onChange={e => c.set(e.target.value)}
                      style={{ ...inp, flex: 1 }} onFocus={focusIn} onBlur={focusOut} />
                  </div>
                </div>
              ))}
            </div>

            <label style={{ ...lbl, marginBottom: "10px" }}>Font Family</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {FONT_OPTIONS.map(f => (
                <button key={f} onClick={() => setFontFamily(f)} style={{
                  padding: "8px 18px", borderRadius: "10px", fontSize: "13px",
                  fontWeight: "600", cursor: "pointer",
                  border: `1.5px solid ${fontFamily === f ? "#6C3AF5" : "#E2E8F0"}`,
                  background: fontFamily === f ? "#EDE9FE" : "white",
                  color: fontFamily === f ? "#6C3AF5" : "#374151",
                  fontFamily: f, transition: "all 0.15s",
                }}>
                  {f}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── SOCIAL ───────────────────────────────────────────── */}
        {activeTab === "social" && (<>
          <div style={card}>
            <SectionTitle>Social Media Links</SectionTitle>
            {[
              { label: "Facebook URL",    val: facebookUrl,    set: setFacebookUrl,    ph: "https://facebook.com/yourpage" },
              { label: "Instagram URL",   val: instagramUrl,   set: setInstagramUrl,   ph: "https://instagram.com/yourpage" },
              { label: "YouTube URL",     val: youtubeUrl,     set: setYoutubeUrl,     ph: "https://youtube.com/yourchannel" },
              { label: "Twitter / X URL", val: twitterUrl,     set: setTwitterUrl,     ph: "https://twitter.com/yourpage" },
              { label: "WhatsApp Number", val: whatsappNumber, set: setWhatsappNumber, ph: "923001234567" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: "16px" }}>
                <label style={lbl}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}
          </div>

          <div style={card}>
            <SectionTitle>WhatsApp Chat Button</SectionTitle>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "16px", border: "1.5px solid #E2E8F0", borderRadius: "12px", marginBottom: "16px" }}>
              <div>
                <p style={{ fontWeight: "700", fontFamily: "'DM Sans', sans-serif", fontSize: "14px", color: "#0f172a", marginBottom: "2px" }}>
                  Enable Chat Button
                </p>
                <p style={{ color: "#94A3B8", fontSize: "12px", fontFamily: "'DM Sans', sans-serif" }}>
                  Show floating WhatsApp button on site
                </p>
              </div>
              <Toggle value={chatButtonEnabled} onChange={setChatButtonEnabled} />
            </div>
            {chatButtonEnabled && (
              <div style={{ animation: "fadeIn 0.2s ease" }}>
                <label style={lbl}>Chat Button WhatsApp Number</label>
                <input value={chatButtonNumber} onChange={e => setChatButtonNumber(e.target.value)}
                  placeholder="923001234567" style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
            )}
          </div>
        </>)}

        {/* ── CONTACT ──────────────────────────────────────────── */}
        {activeTab === "contact" && (
          <div style={card}>
            <SectionTitle>Contact & Support</SectionTitle>
            {[
              { label: "Support Email",    val: supportEmail,    set: setSupportEmail,    ph: "support@vexo.com" },
              { label: "Support WhatsApp", val: supportWhatsapp, set: setSupportWhatsapp, ph: "923001234567" },
              { label: "Footer Address",   val: footerAddress,   set: setFooterAddress,   ph: "Attock, Pakistan" },
            ].map(f => (
              <div key={f.label} style={{ marginBottom: "16px" }}>
                <label style={lbl}>{f.label}</label>
                <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                  style={inp} onFocus={focusIn} onBlur={focusOut} />
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}