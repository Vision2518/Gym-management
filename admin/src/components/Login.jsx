import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLoginMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/authState";
import { getErrorMessage } from "../utils/toastMessage";
import { MdEmail, MdLock, MdVisibility, MdVisibilityOff, MdFitnessCenter } from "react-icons/md";

/* ─────────────────────────────────────────────
   LEFT PANEL  —  cinematic gym branding side
───────────────────────────────────────────── */
const BrandPanel = ({ logoError, logoUrl, onLogoError }) => (
  <div className="al-panel">
    {/* scanline texture */}
    <div className="al-scanlines" />
    {/* radial spotlight */}
    <div className="al-spotlight" />
    {/* corner accents */}
    <div className="al-corner al-corner--tl" />
    <div className="al-corner al-corner--br" />

    <div className="al-panel__inner">
      {/* top: brand */}
      <div className="al-brand">
        <div className="al-brand__icon">
          {!logoError ? (
            <img src={logoUrl} alt="Logo" className="al-logo-img" onError={onLogoError} />
          ) : (
            <MdFitnessCenter className="al-logo-fallback" />
          )}
        </div>
        <span className="al-brand__name">IRONVAULT</span>
      </div>

      {/* center: hero text */}
      <div className="al-hero">
        <div className="al-hero__eyebrow">ADMIN PORTAL</div>
        <h2 className="al-hero__title">
          Command<br />
          <span className="al-hero__title--accent">Your Empire</span>
        </h2>
        <p className="al-hero__body">
          Full control over members, schedules, revenue, and staff — from a single powerful dashboard.
        </p>
      </div>

      {/* bottom: stats */}
      <div className="al-stats">
        {[
          { n: "12k+", l: "Members" },
          { n: "340", l: "Daily Sessions" },
          { n: "99.9%", l: "Uptime" },
        ].map(({ n, l }) => (
          <div key={l} className="al-stat">
            <span className="al-stat__n">{n}</span>
            <span className="al-stat__l">{l}</span>
          </div>
        ))}
      </div>

      {/* badges */}
      <div className="al-badges">
        {["🔐 Secure", "⚡ Real-time", "📊 Analytics"].map((b) => (
          <span key={b} className="al-badge">{b}</span>
        ))}
      </div>
    </div>

    {/* bottom gradient fade */}
    <div className="al-panel__fade" />
  </div>
);

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const logoUrl = "../assets/hero.png";

  const dispatch = useDispatch();
  const [login] = useLoginMutation();

  const handleClick = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = await login(formData).unwrap();
      const token = payload?.token;
      if (!token) { toast.error("Login failed. No access token was returned."); return; }
      localStorage.setItem("authToken", token);
      if (rememberMe) localStorage.setItem("adminUsername", formData.email);
      else localStorage.removeItem("adminUsername");
      const decoded = JSON.parse(atob(token.split(".")[1]));
      dispatch(setUser({ email: decoded.email, role: decoded.role }));
      if (decoded.role === "super_admin") navigate("/admin/dashboard");
      else toast.error("Login failed. This account is not an admin account.");
    } catch (err) {
      toast.error(getErrorMessage(err, "Login failed. Please check your email and password."));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Global styles ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap');

        /* reset for this page */
        .al-root *,
        .al-root *::before,
        .al-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── page ── */
        .al-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #08080f;
          font-family: 'Syne', sans-serif;
          padding: 1.5rem;
          overflow: hidden;
          position: relative;
        }

        /* ambient blobs */
        .al-blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
          z-index: 0;
        }
        .al-blob--1 {
          width: 520px; height: 520px;
          top: -120px; left: -120px;
          background: radial-gradient(circle, rgba(220,38,38,0.13) 0%, transparent 70%);
          animation: blobDrift 14s ease-in-out infinite;
        }
        .al-blob--2 {
          width: 420px; height: 420px;
          bottom: -80px; right: -80px;
          background: radial-gradient(circle, rgba(37,99,235,0.1) 0%, transparent 70%);
          animation: blobDrift 18s ease-in-out infinite reverse;
        }
        .al-blob--3 {
          width: 300px; height: 300px;
          top: 50%; left: 50%;
          transform: translate(-50%,-50%);
          background: radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%);
          animation: blobDrift 22s ease-in-out infinite 3s;
        }

        /* ── card ── */
        .al-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 980px;
          display: flex;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow:
            0 40px 100px rgba(0,0,0,0.7),
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 1px 0 rgba(255,255,255,0.08) inset;
          animation: cardRise 0.65s cubic-bezier(.22,1,.36,1) both;
        }

        /* ── left panel ── */
        .al-panel {
          flex: 0 0 45%;
          position: relative;
          background: linear-gradient(155deg, #0d0505 0%, #1f0808 35%, #0a0510 70%, #06060f 100%);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .al-scanlines {
          position: absolute; inset: 0; z-index: 1; pointer-events: none;
          background-image: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 3px,
            rgba(255,255,255,0.012) 3px,
            rgba(255,255,255,0.012) 4px
          );
        }
        .al-spotlight {
          position: absolute;
          top: -10%; left: -10%;
          width: 75%; height: 75%;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(220,38,38,0.22) 0%, transparent 65%);
          animation: spotPulse 5s ease-in-out infinite;
          z-index: 2;
        }
        .al-corner {
          position: absolute; z-index: 3;
          width: 40px; height: 40px;
          pointer-events: none;
        }
        .al-corner--tl {
          top: 20px; left: 20px;
          border-top: 2px solid rgba(220,38,38,0.5);
          border-left: 2px solid rgba(220,38,38,0.5);
        }
        .al-corner--br {
          bottom: 20px; right: 20px;
          border-bottom: 2px solid rgba(220,38,38,0.3);
          border-right: 2px solid rgba(220,38,38,0.3);
        }
        .al-panel__inner {
          position: relative; z-index: 10;
          display: flex; flex-direction: column;
          height: 100%;
          padding: 2.5rem 2.2rem;
          gap: 0;
          justify-content: space-between;
        }
        .al-panel__fade {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 80px;
          background: linear-gradient(0deg, rgba(0,0,0,0.5) 0%, transparent 100%);
          z-index: 5;
        }

        /* brand */
        .al-brand { display: flex; align-items: center; gap: 0.7rem; }
        .al-brand__icon {
          width: 44px; height: 44px;
          border-radius: 10px;
          background: linear-gradient(135deg, #dc2626, #991b1b);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 4px 16px rgba(220,38,38,0.45), 0 0 0 1px rgba(255,255,255,0.08);
          flex-shrink: 0;
        }
        .al-logo-img { width: 28px; height: 28px; object-fit: contain; }
        .al-logo-fallback { width: 26px; height: 26px; color: #fff; }
        .al-brand__name {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.4rem;
          letter-spacing: 0.12em;
          color: #fff;
        }

        /* hero */
        .al-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 1.5rem 0; }
        .al-hero__eyebrow {
          font-size: 0.62rem;
          font-weight: 700;
          letter-spacing: 0.22em;
          color: #f87171;
          border: 1px solid rgba(248,113,113,0.35);
          padding: 4px 10px;
          border-radius: 3px;
          display: inline-block;
          width: fit-content;
          margin-bottom: 1rem;
          font-family: 'DM Mono', monospace;
        }
        .al-hero__title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(2.8rem, 5vw, 3.8rem);
          line-height: 0.95;
          color: #fff;
          letter-spacing: 0.02em;
          margin-bottom: 1.1rem;
        }
        .al-hero__title--accent {
          background: linear-gradient(90deg, #f87171 0%, #fbbf24 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .al-hero__body {
          font-size: 0.84rem;
          color: rgba(255,255,255,0.38);
          line-height: 1.75;
          max-width: 260px;
        }

        /* stats */
        .al-stats { display: flex; gap: 1.5rem; margin-bottom: 1.2rem; }
        .al-stat { display: flex; flex-direction: column; gap: 2px; }
        .al-stat__n {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 1.8rem;
          color: #f87171;
          line-height: 1;
          letter-spacing: 0.03em;
        }
        .al-stat__l {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.35);
          letter-spacing: 0.06em;
          font-family: 'DM Mono', monospace;
        }

        /* badges */
        .al-badges { display: flex; flex-wrap: wrap; gap: 0.45rem; }
        .al-badge {
          font-size: 0.68rem;
          color: rgba(255,255,255,0.45);
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.09);
          padding: 4px 10px;
          border-radius: 100px;
        }

        /* ── right form side ── */
        .al-form-side {
          flex: 1;
          background: #0e0e16;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          position: relative;
        }
        /* top accent line */
        .al-form-side::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 2px;
          background: linear-gradient(90deg, transparent, #dc2626 40%, #f59e0b 70%, transparent);
        }

        .al-form-box { width: 100%; max-width: 360px; }

        .al-form-eyebrow {
          font-size: 0.62rem;
          letter-spacing: 0.2em;
          color: #f87171;
          font-family: 'DM Mono', monospace;
          margin-bottom: 0.6rem;
        }
        .al-form-title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 2.4rem;
          color: #fff;
          letter-spacing: 0.04em;
          line-height: 1;
          margin-bottom: 0.4rem;
        }
        .al-form-sub {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.3);
          margin-bottom: 2.2rem;
          line-height: 1.5;
        }

        /* field */
        .al-field { margin-bottom: 1.2rem; }
        .al-label {
          display: block;
          font-size: 0.68rem;
          font-weight: 700;
          letter-spacing: 0.12em;
          color: rgba(255,255,255,0.35);
          text-transform: uppercase;
          margin-bottom: 0.45rem;
        }
        .al-input-wrap { position: relative; }
        .al-input-icon {
          position: absolute;
          left: 1rem; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.2);
          display: flex; align-items: center;
          pointer-events: none;
          transition: color 0.2s;
        }
        .al-input {
          width: 100%;
          padding: 0.85rem 1rem 0.85rem 2.75rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: #fff;
          font-size: 0.88rem;
          font-family: 'Syne', sans-serif;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
        }
        .al-input::placeholder { color: rgba(255,255,255,0.2); }
        .al-input:focus {
          border-color: rgba(220,38,38,0.55);
          background: rgba(220,38,38,0.05);
          box-shadow: 0 0 0 3px rgba(220,38,38,0.1);
        }
        .al-input:focus + .al-input-icon,
        .al-input-wrap:focus-within .al-input-icon { color: #f87171; }
        .al-eye {
          position: absolute;
          right: 1rem; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,0.22);
          display: flex; align-items: center;
          transition: color 0.2s;
          padding: 0;
        }
        .al-eye:hover { color: #f87171; }

        /* row: remember + forgot */
        .al-row {
          display: flex; align-items: center;
          justify-content: space-between;
          margin: 0.2rem 0 1.5rem;
        }
        .al-check-label {
          display: flex; align-items: center; gap: 0.55rem;
          cursor: pointer;
        }
        .al-check-box {
          width: 18px; height: 18px;
          border: 1.5px solid rgba(255,255,255,0.18);
          border-radius: 5px;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.2s;
          flex-shrink: 0;
        }
        .al-check-box--checked {
          background: #dc2626;
          border-color: #dc2626;
          box-shadow: 0 0 8px rgba(220,38,38,0.4);
        }
        .al-check-text { font-size: 0.78rem; color: rgba(255,255,255,0.35); }
        .al-forgot {
          font-size: 0.78rem;
          color: #f87171;
          background: none; border: none; cursor: pointer;
          font-family: 'Syne', sans-serif;
          transition: color 0.2s;
        }
        .al-forgot:hover { color: #fca5a5; text-decoration: underline; }

        /* submit */
        .al-submit {
          width: 100%;
          padding: 1rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          color: #fff;
          font-size: 0.9rem;
          font-weight: 700;
          font-family: 'Syne', sans-serif;
          letter-spacing: 0.04em;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          box-shadow: 0 4px 20px rgba(220,38,38,0.35);
          margin-bottom: 1.5rem;
        }
        .al-submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(220,38,38,0.5);
        }
        .al-submit:not(:disabled):active { transform: translateY(0); }
        .al-submit:disabled { opacity: 0.55; cursor: not-allowed; }

        /* spinner */
        .al-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        /* divider */
        .al-divider {
          display: flex; align-items: center; gap: 1rem;
          margin-bottom: 1.2rem;
        }
        .al-divider__line { flex: 1; height: 1px; background: rgba(255,255,255,0.07); }
        .al-divider__text { font-size: 0.72rem; color: rgba(255,255,255,0.22); white-space: nowrap; }

        /* social */
        .al-social { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.5rem; }
        .al-social-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.7rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          color: rgba(255,255,255,0.5);
          font-size: 0.82rem;
          font-family: 'Syne', sans-serif;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .al-social-btn:hover {
          background: rgba(255,255,255,0.08);
          border-color: rgba(255,255,255,0.15);
          transform: translateY(-1px);
        }

        /* footer */
        .al-footer {
          text-align: center;
          font-size: 0.74rem;
          color: rgba(255,255,255,0.2);
        }
        .al-footer a { color: #f87171; text-decoration: none; }
        .al-footer a:hover { text-decoration: underline; }

        /* ── animations ── */
        @keyframes blobDrift {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(18px,-14px) scale(1.04); }
          66%      { transform: translate(-10px,12px) scale(0.97); }
        }
        @keyframes spotPulse {
          0%,100% { opacity: 0.8; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.08); }
        }
        @keyframes cardRise {
          from { opacity: 0; transform: translateY(24px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── responsive ── */
        @media (max-width: 768px) {
          .al-panel { display: none; }
          .al-form-side { padding: 2.5rem 1.5rem; min-height: 100vh; }
        }
      `}</style>

      <div className="al-root">
        {/* ambient blobs */}
        <div className="al-blob al-blob--1" />
        <div className="al-blob al-blob--2" />
        <div className="al-blob al-blob--3" />

        <div className="al-card">
          {/* LEFT */}
          <BrandPanel
            logoError={logoError}
            logoUrl={logoUrl}
            onLogoError={() => setLogoError(true)}
          />

          {/* RIGHT */}
          <div className="al-form-side">
            <div className="al-form-box">
              <div className="al-form-eyebrow">ADMIN ACCESS</div>
              <h1 className="al-form-title">Welcome Back</h1>
              <p className="al-form-sub">Sign in to your administrative dashboard</p>

              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="al-field">
                  <label className="al-label" htmlFor="email">Email Address</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon">
                      <MdEmail size={17} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      className="al-input"
                      placeholder="admin@gym.com"
                      required
                      value={formData.email}
                      onChange={handleClick}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="al-field">
                  <label className="al-label" htmlFor="password">Password</label>
                  <div className="al-input-wrap">
                    <span className="al-input-icon">
                      <MdLock size={17} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="al-input"
                      style={{ paddingRight: "3rem" }}
                      placeholder="••••••••"
                      required
                      value={formData.password}
                      onChange={handleClick}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="al-eye"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <MdVisibilityOff size={17} /> : <MdVisibility size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember / Forgot */}
                <div className="al-row">
                  <label className="al-check-label" onClick={() => setRememberMe((v) => !v)}>
                    <div className={`al-check-box ${rememberMe ? "al-check-box--checked" : ""}`}>
                      {rememberMe && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className="al-check-text">Remember me</span>
                  </label>
                  <button
                    type="button"
                    className="al-forgot"
                    onClick={() => toast.info("Password reset coming soon!")}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={isLoading} className="al-submit">
                  {isLoading ? (
                    <><span className="al-spinner" /> Signing in…</>
                  ) : (
                    <>
                      Sign In
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="al-divider">
                <div className="al-divider__line" />
                <span className="al-divider__text">or continue with</span>
                <div className="al-divider__line" />
              </div>

              {/* Social */}
              <div className="al-social">
                {["Google", "GitHub"].map((provider) => (
                  <button
                    key={provider}
                    type="button"
                    className="al-social-btn"
                    onClick={() => toast.info(`${provider} login coming soon!`)}
                  >
                    {provider === "Google" ? (
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115Z"/>
                        <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/>
                        <path fill="#4A90E2" d="M19.834 21c2.195-2.048 3.62-5.096 3.62-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/>
                        <path fill="#FBBC05" d="M5.277 14.332A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.003Z"/>
                      </svg>
                    ) : (
                      <svg width="17" height="17" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                      </svg>
                    )}
                    {provider}
                  </button>
                ))}
              </div>

              <p className="al-footer">
                By signing in, you agree to our{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>Terms</a> &{" "}
                <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;