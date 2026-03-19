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
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setMounted(true);
    if (user) router.push("/");
  }, [user]);

  const validate = () => {
    const e = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    else if (password.length < 6) e.password = "Min. 6 characters";
    if (!confirmPassword) e.confirmPassword = "Please confirm password";
    else if (password !== confirmPassword) e.confirmPassword = "Passwords do not match";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSignup = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    const recaptchaToken = recaptchaRef.current?.getValue();
    if (!recaptchaToken) { toast.error("Please complete the reCAPTCHA"); return; }
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { firstName, lastName, email, password, recaptchaToken });
      login(res.data.user, res.data.token);
      toast.success("Account created!");
      router.push("/profile");
    } catch (err) {
      if (err.response?.data?.suspended) setSuspendedMessage(err.response.data.message);
      else toast.error(err.response?.data?.message || "Signup failed");
      recaptchaRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  if (!mounted) return null;

  const pwStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const pwColors = ['', '#ff4757', '#ffa502', '#66FCF1'];
  const pwLabels = ['', 'Weak', 'Good', 'Strong'];

  return (
    <div style={{ minHeight: "100vh", background: "#0B0C10", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", position: "relative", overflow: "hidden" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes floatGlow { 0%, 100% { opacity: 0.12; transform: scale(1); } 50% { opacity: 0.25; transform: scale(1.08); } }
        .vx-input { width: 100%; padding: 12px 16px; background: rgba(31,40,51,0.6); border: 1.5px solid rgba(102,252,241,0.15); border-radius: 6px; font-size: 15px; font-family: 'Afacad', sans-serif; color: #C5C6C7; outline: none; transition: all 0.2s ease; box-sizing: border-box; }
        .vx-input:focus { border-color: #66FCF1; box-shadow: 0 0 0 3px rgba(102,252,241,0.08); background: rgba(31,40,51,0.9); }
        .vx-input::placeholder { color: rgba(197,198,199,0.35); }
        .vx-input.err { border-color: #ff4757 !important; }
        .vx-input.ok { border-color: rgba(102,252,241,0.4) !important; }
        .vx-btn { width: 100%; padding: 13px; background: transparent; color: #66FCF1; border: 1.5px solid #66FCF1; border-radius: 6px; font-family: 'Orbitron', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; cursor: pointer; position: relative; overflow: hidden; transition: color 0.25s ease; }
        .vx-btn::before { content: ''; position: absolute; inset: 0; background: #66FCF1; transform: scaleX(0); transform-origin: left; transition: transform 0.25s ease; }
        .vx-btn:hover::before { transform: scaleX(1); }
        .vx-btn:hover { color: #0B0C10; }
        .vx-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .vx-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .vx-google { width: 100%; padding: 12px; background: transparent; border: 1.5px solid rgba(197,198,199,0.2); border-radius: 6px; font-family: 'Afacad', sans-serif; font-size: 14px; color: #C5C6C7; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.2s ease; }
        .vx-google:hover { border-color: rgba(197,198,199,0.45); background: rgba(197,198,199,0.05); }
        .field-err { font-family: 'Afacad', sans-serif; font-size: 12px; color: #ff4757; margin-top: 4px; animation: fadeInUp 0.2s ease; }
        .lbl { display: block; font-family: 'Orbitron', sans-serif; font-size: 10px; font-weight: 600; color: rgba(197,198,199,0.6); letter-spacing: 0.1em; margin-bottom: 7px; }
      `}</style>

      <div style={{ position: "absolute", top: "-200px", right: "-200px", width: "500px", height: "500px", borderRadius: "50%", background: "radial-gradient(circle, rgba(102,252,241,0.07) 0%, transparent 70%)", animation: "floatGlow 6s ease-in-out infinite" }} />
      <div style={{ position: "absolute", bottom: "-150px", left: "-150px", width: "400px", height: "400px", borderRadius: "50%", background: "radial-gradient(circle, rgba(69,162,158,0.07) 0%, transparent 70%)", animation: "floatGlow 9s ease-in-out infinite" }} />

      <div style={{ background: "rgba(31,40,51,0.7)", backdropFilter: "blur(20px)", borderRadius: "12px", padding: "40px 36px", width: "100%", maxWidth: "460px", border: "1px solid rgba(102,252,241,0.12)", boxShadow: "0 0 60px rgba(0,0,0,0.6)", position: "relative", zIndex: 1, animation: "fadeInUp 0.5s ease forwards" }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <Link href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "40px", height: "40px", background: "transparent", border: "2px solid #66FCF1", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#66FCF1", fontFamily: "'Orbitron', sans-serif", fontWeight: "900", fontSize: "15px" }}>V</span>
            </div>
            <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "26px", color: "#66FCF1", letterSpacing: "0.1em" }}>{settings?.siteName || "VEXO"}</span>
          </Link>
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "30px", color: "#C5C6C7", letterSpacing: "0.06em", marginBottom: "4px" }}>CREATE ACCOUNT</h1>
        <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "14px", color: "rgba(197,198,199,0.5)", marginBottom: "24px" }}>Join Pakistan's growing marketplace</p>

        {suspendedMessage && (
          <div style={{ background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.25)", borderRadius: "8px", padding: "14px 16px", marginBottom: "20px" }}>
            <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "13px", color: "#ff4757" }}>{suspendedMessage}</p>
          </div>
        )}

        <button onClick={handleGoogle} className="vx-google" style={{ marginBottom: "20px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
          <div style={{ flex: 1, height: "1px", background: "rgba(197,198,199,0.1)" }} />
          <span style={{ fontFamily: "'Afacad', sans-serif", fontSize: "12px", color: "rgba(197,198,199,0.35)", letterSpacing: "0.06em" }}>OR</span>
          <div style={{ flex: 1, height: "1px", background: "rgba(197,198,199,0.1)" }} />
        </div>

        <form onSubmit={handleSignup}>
          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
            <div>
              <label className="lbl">FIRST NAME *</label>
              <input value={firstName} onChange={e => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: ''})); }} placeholder="John" className={`vx-input${errors.firstName ? ' err' : firstName ? ' ok' : ''}`} />
              {errors.firstName && <p className="field-err">{errors.firstName}</p>}
            </div>
            <div>
              <label className="lbl">LAST NAME</label>
              <input value={lastName} onChange={e => setLastName(e.target.value)} placeholder="Doe" className="vx-input" />
            </div>
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="lbl">EMAIL *</label>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({...p, email: ''})); }} placeholder="you@example.com" className={`vx-input${errors.email ? ' err' : email && /\S+@\S+\.\S+/.test(email) ? ' ok' : ''}`} />
            {errors.email && <p className="field-err">{errors.email}</p>}
          </div>

          <div style={{ marginBottom: "14px" }}>
            <label className="lbl">PASSWORD *</label>
            <div style={{ position: "relative" }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({...p, password: ''})); }} placeholder="Min. 6 characters" className={`vx-input${errors.password ? ' err' : ''}`} style={{ paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(197,198,199,0.4)", fontSize: "14px" }}>
                {showPassword ? "✕" : "○"}
              </button>
            </div>
            {errors.password && <p className="field-err">{errors.password}</p>}
            {password && (
              <div style={{ marginTop: "6px", display: "flex", gap: "4px", alignItems: "center" }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ flex: 1, height: "3px", borderRadius: "2px", background: i <= pwStrength ? pwColors[pwStrength] : "rgba(197,198,199,0.1)", transition: "all 0.3s ease" }} />
                ))}
                <span style={{ fontFamily: "'Afacad', sans-serif", fontSize: "11px", color: pwColors[pwStrength], marginLeft: "6px" }}>{pwLabels[pwStrength]}</span>
              </div>
            )}
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label className="lbl">CONFIRM PASSWORD *</label>
            <div style={{ position: "relative" }}>
              <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setErrors(p => ({...p, confirmPassword: ''})); }} placeholder="Re-enter password" className={`vx-input${errors.confirmPassword ? ' err' : confirmPassword && password === confirmPassword ? ' ok' : ''}`} style={{ paddingRight: "44px" }} />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(197,198,199,0.4)", fontSize: "14px" }}>
                {showConfirm ? "✕" : "○"}
              </button>
            </div>
            {errors.confirmPassword && <p className="field-err">{errors.confirmPassword}</p>}
            {confirmPassword && !errors.confirmPassword && password === confirmPassword && (
              <p style={{ fontFamily: "'Afacad', sans-serif", fontSize: "12px", color: "#66FCF1", marginTop: "4px" }}>Passwords match</p>
            )}
          </div>

          <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center" }}>
            <ReCAPTCHA ref={recaptchaRef} sitekey="6LeJpIIsAAAAAAWE1elHvJD17sfw4KpCVYLAyUv2" theme="dark" />
          </div>

          <button type="submit" disabled={loading} className="vx-btn">
            <span>
              {loading ? (
                <><span className="vexo-spinner vexo-spinner-sm" style={{ borderTopColor: "#0B0C10" }} /> CREATING ACCOUNT...</>
              ) : "CREATE ACCOUNT"}
            </span>
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontFamily: "'Afacad', sans-serif", fontSize: "14px", color: "rgba(197,198,199,0.5)" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#66FCF1", fontWeight: "600", textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}