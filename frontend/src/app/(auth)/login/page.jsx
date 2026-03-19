"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ReCAPTCHA from "react-google-recaptcha";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { useSiteSettings } from "../../../context/SiteSettingsContext";
import api from "../../../lib/axios";

export default function LoginPage() {
  const { login, user } = useAuth();
  const { settings } = useSiteSettings();
  const router = useRouter();
  const recaptchaRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/");
  }, [user]);

  const validate = () => {
    const e = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email address";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) { toast.error("Please complete the reCAPTCHA"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password, recaptchaToken });
      login(res.data.user, res.data.token);
      toast.success("Welcome back!");
      router.push("/");
    } catch (err) {
      if (err.response?.data?.suspended || err.response?.data?.blocked) {
        setBlockedMessage(err.response.data.message);
      } else {
        toast.error(err.response?.data?.message || "Login failed");
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
    <div style={{
      minHeight: "100vh",
      background: "#0B0C10",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatGlow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.08); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        .vx-input {
          width: 100%;
          padding: 12px 16px;
          background: rgba(31,40,51,0.6);
          border: 1.5px solid rgba(102,252,241,0.15);
          border-radius: 6px;
          font-size: 15px;
          font-family: 'Afacad', sans-serif;
          color: #C5C6C7;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }
        .vx-input:focus {
          border-color: #66FCF1;
          box-shadow: 0 0 0 3px rgba(102,252,241,0.08);
          background: rgba(31,40,51,0.9);
        }
        .vx-input::placeholder { color: rgba(197,198,199,0.35); }
        .vx-input.err { border-color: #ff4757 !important; }
        .vx-btn {
          width: 100%;
          padding: 13px;
          background: transparent;
          color: #66FCF1;
          border: 1.5px solid #66FCF1;
          border-radius: 6px;
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.12em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: color 0.25s ease;
        }
        .vx-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: #66FCF1;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.25s ease;
        }
        .vx-btn:hover::before { transform: scaleX(1); }
        .vx-btn:hover { color: #0B0C10; }
        .vx-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vx-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vx-google {
          width: 100%;
          padding: 12px;
          background: transparent;
          border: 1.5px solid rgba(197,198,199,0.2);
          border-radius: 6px;
          font-family: 'Afacad', sans-serif;
          font-size: 14px;
          color: #C5C6C7;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.2s ease;
        }
        .vx-google:hover {
          border-color: rgba(197,198,199,0.45);
          background: rgba(197,198,199,0.05);
        }
        .field-err {
          font-family: 'Afacad', sans-serif;
          font-size: 12px;
          color: #ff4757;
          margin-top: 4px;
          animation: fadeInUp 0.2s ease;
        }
      `}</style>

      {/* Glow orbs */}
      <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(102,252,241,0.07) 0%, transparent 70%)", animation: "floatGlow 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(69,162,158,0.07) 0%, transparent 70%)", animation: "floatGlow 8s ease-in-out infinite" }} />

      {/* Scanline */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", left: 0, right: 0, height: "80px", background: "linear-gradient(transparent, rgba(102,252,241,0.015), transparent)", animation: "scanline 6s linear infinite" }} />
      </div>

      {/* Card */}
      <div style={{
        background: "rgba(31,40,51,0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "12px",
        padding: "44px 40px",
        width: "100%",
        maxWidth: "420px",
        border: "1px solid rgba(102,252,241,0.12)",
        boxShadow: "0 0 60px rgba(0,0,0,0.6), 0 0 30px rgba(102,252,241,0.03)",
        position: "relative",
        zIndex: 1,
        animation: "fadeInUp 0.5s ease forwards",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" style={{ height: "36px", width: "auto" }} />
            ) : (
              <div style={{ width: "42px", height: "42px", background: "transparent", border: "2px solid #66FCF1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#66FCF1", fontFamily: "'Orbitron', sans-serif", fontWeight: "900", fontSize: "16px" }}>V</span>
              </div>
            )}
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "#66FCF1", letterSpacing: "0.1em" }}>
              {settings?.siteName || "VEXO"}
            </span>
          </Link>
          <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "13px", color: "rgba(197,198,199,0.5)", marginTop: "6px" }}>
            Pakistan's trusted marketplace
          </p>
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "32px", color: "#C5C6C7", letterSpacing: "0.06em", marginBottom: "6px" }}>
          SIGN IN
        </h1>
        <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "14px", color: "rgba(197,198,199,0.5)", marginBottom: "28px" }}>
          Access your account
        </p>

        {/* Blocked message */}
        {blockedMessage && (
          <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "13px", color: "#ff4757", marginBottom: "4px", fontWeight: "600" }}>Account Suspended</p>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "12px", color: "rgba(255,71,87,0.8)" }}>{blockedMessage}</p>
          </div>
        )}

        {/* Google */}
        <button onClick={handleGoogle} className="vx-google" style={{ marginBottom: "20px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(197,198,199,0.1)" }} />
          <span style={{ fontFamily: "'Afacad', sans-serif", fontSize: "12px", color: "rgba(197,198,199,0.35)", letterSpacing: "0.06em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(197,198,199,0.1)" }} />
        </div>

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: "10px", fontWeight: "600", color: "rgba(197,198,199,0.6)", letterSpacing: "0.1em", marginBottom: "7px" }}>
              EMAIL
            </label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }}
              placeholder="you@example.com" className={`vx-input${errors.email ? ' err' : ''}`} />
            {errors.email && <p className="field-err">{errors.email}</p>}
          </div>

          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", fontFamily: "'Orbitron', sans-serif", fontSize: "10px", fontWeight: "600", color: "rgba(197,198,199,0.6)", letterSpacing: "0.1em", marginBottom: "7px" }}>
              PASSWORD
            </label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }}
                placeholder="Enter your password" className={`vx-input${errors.password ? ' err' : ''}`}
                style={{ paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(197,198,199,0.4)", fontSize: "14px" }}>
                {showPassword ? "✕" : "○"}
              </button>
            </div>
            {errors.password && <p className="field-err">{errors.password}</p>}
          </div>

          <div style={{ textAlign: "right", marginBottom: "20px" }}>
            <Link href="/forgot-password" style={{ fontFamily: "'Afacad', sans-serif", fontSize: "13px", color: "#45A29E", textDecoration: "none", transition: "color 0.15s" }}
              onMouseEnter={e => e.target.style.color = "#66FCF1"}
              onMouseLeave={e => e.target.style.color = "#45A29E"}>
              Forgot password?
            </Link>
          </div>

          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA ref={recaptchaRef} sitekey="6LeJpIIsAAAAAAWE1elHvJD17sfw4KpCVYLAyUv2" theme="dark" />
          </div>

          <button type="submit" disabled={loading} className="vx-btn">
            <span>
              {loading ? (
                <><span className="vexo-spinner vexo-spinner-sm" style={{ borderTopColor: "#0B0C10" }} /> SIGNING IN...</>
              ) : "SIGN IN"}
            </span>
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Afacad', sans-serif", fontSize: "14px", color: "rgba(197,198,199,0.5)" }}>
          No account?{" "}
          <Link href="/signup" style={{ color: "#66FCF1", fontWeight: "600", textDecoration: "none" }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}