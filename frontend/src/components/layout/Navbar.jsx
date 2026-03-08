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
            {(settings?.categories?.filter(c => c.isActive) || CATEGORIES).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                style={{
                  display: "flex", alignItems: "center",
                  padding: "12px 16px", fontSize: "13px", fontWeight: "500",
                  color: "var(--text-secondary)", textDecoration: "none",
                  fontFamily: "'DM Sans', sans-serif", whiteSpace: "nowrap",
                  borderBottom: "2px solid transparent", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--brand-primary)";
                  e.currentTarget.style.borderBottomColor = "var(--brand-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.borderBottomColor = "transparent";
                }}
              >
                {cat.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}