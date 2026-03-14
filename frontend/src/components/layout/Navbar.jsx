"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { CATEGORIES } from "../../constants/categories";
import NotificationBell from "../notifications/NotificationBell";
import { useSiteSettings } from "../../context/SiteSettingsContext";
import toast from "react-hot-toast";

function UserDropdown({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = (user.firstName?.charAt(0) || user.email?.charAt(0) || "U").toUpperCase();
  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

  const handleLogout = () => {
    setOpen(false);
    if (window.confirm("Are you sure you want to logout?")) {
      onLogout();
      toast.success("Logged out successfully!");
      router.push("/");
    }
  };

  return (
    <div ref={dropdownRef} style={{ position: "relative" }}>
      <style>{`
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .user-avatar-btn:hover {
          box-shadow: 0 0 0 3px rgba(108,58,245,0.2) !important;
        }
        .dropdown-item:hover {
          background: #F8FAFC !important;
          color: #6C3AF5 !important;
        }
        .logout-item:hover {
          background: #FEF2F2 !important;
          color: #DC2626 !important;
        }
      `}</style>

      {/* Avatar Button */}
      <button
        onClick={() => setOpen(!open)}
        className="user-avatar-btn"
        style={{
          width: "38px", height: "38px", borderRadius: "10px",
          background: "var(--brand-primary)", color: "white",
          fontWeight: "800", fontSize: "15px",
          fontFamily: "'DM Sans', sans-serif",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, transition: "box-shadow 0.2s ease",
          overflow: "hidden",
        }}
      >
        {user.avatar ? (
          <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : initials}
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 199 }} />
          <div style={{
            position: "absolute", top: "48px", right: 0,
            width: "220px", background: "white",
            borderRadius: "14px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.06)",
            border: "1px solid #F1F5F9",
            zIndex: 200, overflow: "hidden",
            animation: "dropdownIn 0.2s ease forwards",
          }}>
            {/* User Info */}
            <div style={{
              padding: "16px", background: "linear-gradient(135deg, #6C3AF5 0%, #9B6DFF 100%)",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: "rgba(255,255,255,0.2)", overflow: "hidden",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <span style={{ color: "white", fontWeight: "800", fontSize: "16px", fontFamily: "'DM Sans', sans-serif" }}>
                      {initials}
                    </span>
                  )}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{
                    fontWeight: "700", fontFamily: "'DM Sans', sans-serif",
                    fontSize: "14px", color: "white",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{fullName}</p>
                  <p style={{
                    fontSize: "11px", color: "rgba(255,255,255,0.7)",
                    fontFamily: "'DM Sans', sans-serif",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{user.email}</p>
                </div>
              </div>
              {user.isEmailVerified && (
                <div style={{
                  marginTop: "8px", display: "inline-flex", alignItems: "center",
                  gap: "4px", background: "rgba(255,255,255,0.15)",
                  padding: "3px 8px", borderRadius: "20px",
                }}>
                  <span style={{ fontSize: "10px", color: "white", fontFamily: "'DM Sans', sans-serif", fontWeight: "600" }}>
                    Verified Account
                  </span>
                </div>
              )}
            </div>

            {/* Menu Items */}
            <div style={{ padding: "6px" }}>
              {[
                { label: "My Profile", href: "/profile" },
                { label: "Edit Profile", href: "/profile?tab=edit" },
                { label: "My Ads", href: "/profile?tab=ads" },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="dropdown-item"
                  style={{
                    display: "block", padding: "10px 12px",
                    borderRadius: "8px", textDecoration: "none",
                    fontSize: "13px", fontWeight: "600",
                    fontFamily: "'DM Sans', sans-serif",
                    color: "#374151", transition: "all 0.15s",
                  }}
                >
                  {item.label}
                </Link>
              ))}

              <div style={{ height: "1px", background: "#F1F5F9", margin: "4px 0" }} />

              <button
                onClick={handleLogout}
                className="logout-item"
                style={{
                  display: "block", width: "100%", padding: "10px 12px",
                  borderRadius: "8px", textAlign: "left",
                  fontSize: "13px", fontWeight: "600",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "#DC2626", background: "none",
                  border: "none", cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Navbar Category Item with optional multi-level dropdown ──────────────────
function DropdownItem({ child, allCats }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const grandChildren = allCats.filter(c => c.parentId === child.id && c.isActive);
  const hasGrandChildren = grandChildren.length > 0;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => { clearTimeout(timerRef.current); setOpen(true); }}
      onMouseLeave={() => { timerRef.current = setTimeout(() => setOpen(false), 120); }}
    >
      <Link
        href={`/category/${child.id}`}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px",
          padding: "9px 12px", borderRadius: "8px",
          textDecoration: "none", fontSize: "13px", fontWeight: "500",
          color: "#374151", fontFamily: "'DM Sans', sans-serif",
          transition: "all 0.12s", whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.color = "var(--brand-primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {child.iconUrl ? (
            <img src={child.iconUrl} alt="" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: 0 }} />
          ) : child.icon ? (
            <span style={{ fontSize: "14px" }}>{child.icon}</span>
          ) : null}
          {child.name}
        </span>
        {hasGrandChildren && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        )}
      </Link>
      {/* Grand-children flyout */}
      {hasGrandChildren && open && (
        <div style={{
          position: "absolute", top: "0", left: "100%", marginLeft: "4px",
          minWidth: "180px", background: "white", borderRadius: "12px", padding: "6px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12)", border: "1px solid #F1F5F9",
          zIndex: 210, animation: "dropIn 0.15s ease",
        }}>
          {grandChildren.map(gc => (
            <Link key={gc.id} href={`/category/${gc.id}`}
              style={{ display: "flex", alignItems: "center", gap: "8px", padding: "9px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "13px", fontWeight: "500", color: "#374151", fontFamily: "'DM Sans', sans-serif", transition: "all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#F5F3FF"; e.currentTarget.style.color = "var(--brand-primary)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#374151"; }}
            >
              {gc.icon && <span style={{ fontSize: "13px" }}>{gc.icon}</span>}
              {gc.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function NavCategoryItem({ cat, allCats }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const children = allCats.filter(c => c.parentId === cat.id && c.isActive);
  const hasChildren = children.length > 0;

  const showDropdown = () => { clearTimeout(timerRef.current); setOpen(true); };
  const hideDropdown = () => { timerRef.current = setTimeout(() => setOpen(false), 120); };

  const linkStyle = {
    display: "flex", alignItems: "center", gap: "4px",
    padding: "12px 16px", fontSize: "13px", fontWeight: "500",
    color: open ? "var(--brand-primary)" : "var(--text-secondary)",
    textDecoration: "none", fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap", borderBottom: `2px solid ${open ? "var(--brand-primary)" : "transparent"}`,
    transition: "all 0.15s", cursor: "pointer",
  };

  if (!hasChildren) {
    return (
      <Link href={`/category/${cat.id}`} style={{ ...linkStyle, color: "var(--text-secondary)", borderBottom: "2px solid transparent" }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--brand-primary)"; e.currentTarget.style.borderBottomColor = "var(--brand-primary)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.borderBottomColor = "transparent"; }}
      >
        {cat.name}
      </Link>
    );
  }

  return (
    <div style={{ position: "relative" }} onMouseEnter={showDropdown} onMouseLeave={hideDropdown}>
      <style>{`
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <Link href={`/category/${cat.id}`} style={linkStyle}>
        {cat.name}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </Link>
      {open && (
        <div style={{
          position: "absolute", top: "100%", left: "0",
          minWidth: "210px", background: "white", borderRadius: "12px", padding: "6px",
          boxShadow: "0 16px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.06)",
          border: "1px solid #F1F5F9", zIndex: 200, animation: "dropIn 0.18s ease",
        }}>
          {children.map(child => (
            <DropdownItem key={child.id} child={child} allCats={allCats} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const router = useRouter();
  const { settings } = useSiteSettings();
  const { user, logout } = useAuth();
  const [query, setQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      setMobileSearch(false);
    }
  };

  return (
    <header style={{
      background: "white",
      borderBottom: "1px solid var(--border-default)",
      position: "sticky", top: 0, zIndex: 100, width: "100%",
    }}>
      {/* Main Row */}
      <div className="page-container" style={{
        display: "flex", alignItems: "center",
        gap: "12px", height: "64px",
      }}>
        {/* Logo */}
        <Link href="/" style={{
          textDecoration: "none", display: "flex",
          alignItems: "center", gap: "8px", flexShrink: 0,
        }}>
          {settings?.logoUrl ? (
            <img src={settings.logoUrl} alt="logo" style={{ height: "32px", width: "auto", borderRadius: "6px" }} />
          ) : (
            <div style={{
              width: "32px", height: "32px", background: "var(--brand-primary)",
              borderRadius: "8px", display: "flex", alignItems: "center",
              justifyContent: "center", color: "white", fontWeight: "800",
              fontSize: "14px", fontFamily: "'DM Sans', sans-serif",
            }}>
              {settings?.siteName?.charAt(0) || "V"}
            </div>
          )}
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: "800",
            fontSize: "18px", color: "var(--text-primary)", letterSpacing: "-0.03em",
          }}>
            {settings?.siteName || "VEXO"}
          </span>
        </Link>

        {/* Attock badge */}
        <div className="hide-mobile" style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "6px 12px", background: "var(--bg-secondary)",
          border: "1px solid var(--border-default)", borderRadius: "8px",
          cursor: "pointer", flexShrink: 0,
        }}>
          <span style={{
            fontSize: "13px", fontWeight: "500",
            color: "var(--text-secondary)", fontFamily: "'DM Sans', sans-serif",
          }}>Attock</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="hide-mobile" style={{ flex: 1, display: "flex", maxWidth: "480px" }}>
          <div style={{
            display: "flex", width: "100%",
            border: "1.5px solid var(--border-default)",
            borderRadius: "8px", overflow: "hidden", background: "white",
          }}>
            <input
              type="text" value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search in Attock..."
              style={{
                flex: 1, border: "none", outline: "none",
                padding: "10px 14px", fontSize: "14px",
                fontFamily: "'DM Sans', sans-serif",
                color: "var(--text-primary)", background: "transparent",
              }}
            />
            <button type="submit" style={{
              padding: "0 16px", background: "var(--brand-primary)",
              border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>
          </div>
        </form>

        {/* Right side */}
        <div style={{
          marginLeft: "auto", display: "flex",
          alignItems: "center", gap: "8px", flexShrink: 0,
        }}>
          {/* Mobile search */}
          <button className="show-mobile" onClick={() => setMobileSearch(!mobileSearch)} style={{
            display: "none", background: "none", border: "none",
            cursor: "pointer", padding: "8px",
            alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>

          <Link href="/post-ad" style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "9px 18px", background: "var(--brand-primary)",
            color: "white", borderRadius: "8px", textDecoration: "none",
            fontSize: "14px", fontWeight: "700",
            fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
          }}>
            + Post Ad
          </Link>

          <NotificationBell />

          {user ? (
            <UserDropdown user={user} onLogout={logout} />
          ) : (
            <Link href="/login" className="hide-mobile" style={{
              padding: "9px 18px", border: "1.5px solid var(--border-default)",
              borderRadius: "8px", color: "var(--text-secondary)",
              textDecoration: "none", fontSize: "14px", fontWeight: "600",
              fontFamily: "'DM Sans', sans-serif", background: "white",
            }}>
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      {mobileSearch && (
        <div className="show-mobile" style={{ padding: "10px 16px", borderTop: "1px solid var(--border-light)", display: "flex" }}>
          <form onSubmit={handleSearch} style={{ width: "100%", display: "flex" }}>
            <div style={{
              display: "flex", width: "100%",
              border: "1.5px solid var(--border-default)",
              borderRadius: "8px", overflow: "hidden",
            }}>
              <input
                autoFocus type="text" value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search in Attock..."
                style={{
                  flex: 1, border: "none", outline: "none",
                  padding: "10px 14px", fontSize: "14px",
                  fontFamily: "'DM Sans', sans-serif",
                  color: "var(--text-primary)", background: "transparent",
                }}
              />
              <button type="submit" style={{
                padding: "0 16px", background: "var(--brand-primary)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories */}
      <div style={{ borderTop: "1px solid var(--border-light)" }}>
        <div className="page-container">
          <nav style={{ display: "flex", gap: "0", overflowX: "auto", scrollbarWidth: "none" }}>
            {(() => {
              const allCats = settings?.categories?.filter(c => c.isActive) || CATEGORIES;
              const parents = allCats.filter(c => !c.parentId);
              return parents.map(cat => (
                <NavCategoryItem
                  key={cat.id}
                  cat={cat}
                  allCats={allCats}
                />
              ));
            })()}
          </nav>
        </div>
      </div>
    </header>
  );
}