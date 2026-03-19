"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import api from "../../../lib/axios";

export default function SignupPage() {
  const { login, user } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const recaptchaRef = useRef(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [suspendedMessage, setSuspendedMessage] = useState("");

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/");
  }, [user]);

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!firstName || !email || !password || !confirmPassword) {
      toast.error("Please fill all required fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/auth/register", {
        firstName,
        lastName,
        email,
        password,
        recaptchaToken,
      });
      login(res.data.user, res.data.token);
      toast.success("Account created! Please verify your email.");
      router.push("/profile");
    } catch (err) {
      if (err.response?.data?.suspended) {
        setSuspendedMessage(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || "Signup failed");
      }
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (!mounted) return null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background blobs */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-120px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(108,58,245,0.15) 0%, transparent 70%)",
          animation: "pulse 4s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-100px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(230,57,70,0.1) 0%, transparent 70%)",
          animation: "pulse 6s ease-in-out infinite",
        }}
      />

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .auth-input:focus {
          border-color: var(--brand-primary) !important;
          box-shadow: 0 0 0 3px rgba(108,58,245,0.1) !important;
        }
        .auth-input { transition: all 0.2s ease !important; }
        .google-btn:hover { background: #f8f8f8 !important; box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important; }
        .submit-btn:hover { opacity: 0.92 !important; transform: translateY(-1px) !important; }
        .submit-btn { transition: all 0.2s ease !important; }
      `}</style>

      <div
        style={{
          background: "white",
          borderRadius: "24px",
          padding: "44px 40px",
          width: "100%",
          maxWidth: "460px",
          boxShadow: "0 32px 100px rgba(0,0,0,0.4)",
          position: "relative",
          zIndex: 1,
          animation: "fadeInUp 0.5s ease forwards",
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "6px",
            }}
          >
            {settings?.logoUrl ? (
              <img
                src={settings.logoUrl}
                alt="logo"
                style={{ height: "36px", width: "auto" }}
              />
            ) : (
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--brand-primary)",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "800",
                  fontSize: "18px",
                }}
              >
                {settings?.siteName?.charAt(0) || "V"}
              </div>
            )}
            <span
              style={{
                fontSize: "24px",
                fontWeight: "800",
                color: "#111827",
                letterSpacing: "-0.03em",
                fontFamily: "Inter, sans-serif",
              }}
            >
              {settings?.siteName || "VEXO"}
            </span>
          </Link>
          <p
            style={{
              fontSize: "13px",
              color: "#9CA3AF",
              fontFamily: "Inter, sans-serif",
              marginTop: "4px",
            }}
          >
            Attock's trusted marketplace
          </p>
        </div>

        {/* Heading */}
        <div style={{ marginBottom: "24px" }}>
          <h1
            style={{
              fontSize: "26px",
              fontWeight: "800",
              color: "#111827",
              fontFamily: "Inter, sans-serif",
              letterSpacing: "-0.02em",
              marginBottom: "6px",
            }}
          >
            Create account
          </h1>
          <p
            style={{
              fontSize: "14px",
              color: "#6B7280",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Join thousands of buyers and sellers in Attock
          </p>
        </div>

        {/* Suspended Message */}
        {suspendedMessage && (
          <div
            style={{
              background: "#FEF2F2",
              border: "1px solid #FECACA",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
            }}
          >
            <span style={{ fontSize: "20px", flexShrink: 0 }}>🚫</span>
            <div>
              <p
                style={{
                  fontWeight: "700",
                  color: "#991B1B",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "14px",
                  marginBottom: "4px",
                }}
              >
                Account Permanently Suspended
              </p>
              <p
                style={{
                  color: "#B91C1C",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                }}
              >
                {suspendedMessage}
              </p>
              <p
                style={{
                  color: "#EF4444",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "12px",
                  marginTop: "6px",
                }}
              >
                This email is permanently banned from VEXO.
              </p>
            </div>
          </div>
        )}

        {/* Google */}
        <button
          onClick={handleGoogle}
          className="google-btn"
          style={{
            width: "100%",
            padding: "12px",
            border: "1.5px solid #E5E7EB",
            borderRadius: "10px",
            background: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            fontSize: "14px",
            fontWeight: "600",
            fontFamily: "Inter, sans-serif",
            color: "#374151",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
          <span
            style={{
              fontSize: "12px",
              color: "#9CA3AF",
              fontFamily: "Inter, sans-serif",
              fontWeight: "500",
            }}
          >
            or sign up with email
          </span>
          <div style={{ flex: 1, height: "1px", background: "#E5E7EB" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleSignup}>
          {/* Name row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "6px",
                }}
              >
                First Name *
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#374151",
                  fontFamily: "Inter, sans-serif",
                  marginBottom: "6px",
                }}
              >
                Last Name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                fontFamily: "Inter, sans-serif",
                marginBottom: "6px",
              }}
            >
              Email Address *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="auth-input"
              style={{
                width: "100%",
                padding: "11px 14px",
                border: "1.5px solid #E5E7EB",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                fontFamily: "Inter, sans-serif",
                marginBottom: "6px",
              }}
            >
              Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "11px 44px 11px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: "600",
                color: "#374151",
                fontFamily: "Inter, sans-serif",
                marginBottom: "6px",
              }}
            >
              Confirm Password *
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="auth-input"
                style={{
                  width: "100%",
                  padding: "11px 44px 11px 14px",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontFamily: "Inter, sans-serif",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#9CA3AF",
                }}
              >
                {showConfirm ? "🙈" : "👁️"}
              </button>
            </div>
            {/* Password match indicator */}
            {confirmPassword && (
              <p
                style={{
                  fontSize: "12px",
                  marginTop: "4px",
                  fontFamily: "Inter, sans-serif",
                  color: password === confirmPassword ? "#10B981" : "#EF4444",
                }}
              >
                {password === confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords do not match"}
              </p>
            )}
          </div>

          {/* reCAPTCHA */}
          <div
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey="6LeJpIIsAAAAAAWE1elHvJD17sfw4KpCVYLAyUv2"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="submit-btn"
            style={{
              width: "100%",
              padding: "13px",
              background: "var(--brand-primary)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              fontSize: "15px",
              fontWeight: "700",
              fontFamily: "Inter, sans-serif",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "14px",
            fontFamily: "Inter, sans-serif",
            color: "#6B7280",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "var(--brand-primary)",
              fontWeight: "700",
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </p>

        <p
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
            textAlign: "center",
            marginTop: "16px",
            fontFamily: "Inter, sans-serif",
            lineHeight: "1.6",
          }}
        >
          By creating an account, you agree to our{" "}
          <Link href="/terms" style={{ color: "var(--brand-primary)" }}>
            Terms
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy-policy"
            style={{ color: "var(--brand-primary)" }}
          >
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}
