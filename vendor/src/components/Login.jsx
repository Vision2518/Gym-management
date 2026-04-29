import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useVendorLoginMutation } from "../redux/features/authSlice";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/features/authState";
import { toast } from "react-toastify";
import { getErrorMessage } from "../utils/toastMessage";

const GymPanel = () => (
  <div style={panelStyles.wrap}>
    <div style={panelStyles.overlay} />
    <svg
      style={panelStyles.texture}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="diag"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="24"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1.5"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#diag)" />
    </svg>
    <div style={panelStyles.glow} />

    <div style={panelStyles.content}>
      <div style={panelStyles.brand}>
        <div style={panelStyles.logoMark}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14H7M21 14H24M7 14V10C7 8.9 7.9 8 9 8H10C11.1 8 12 8.9 12 10V18C12 19.1 11.1 20 10 20H9C7.9 20 7 19.1 7 18V14ZM21 14V10C21 8.9 20.1 8 19 8H18C16.9 8 16 8.9 16 10V18C16 19.1 16.9 20 18 20H19C20.1 20 21 19.1 21 18V14ZM12 14H16"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <span style={panelStyles.brandName}>IronVault</span>
      </div>

      <div style={panelStyles.hero}>
        <div style={panelStyles.tag}>VENDOR PORTAL</div>
        <h2 style={panelStyles.headline}>
          Manage Your
          <br />
          <span style={panelStyles.headlineAccent}>Fitness Empire</span>
        </h2>
        <p style={panelStyles.heroSub}>
          Track memberships, manage schedules, and grow your gym business — all
          in one powerful dashboard.
        </p>
      </div>

      <div style={panelStyles.stats}>
        {[
          { value: "2.4k", label: "Active Members" },
          { value: "98%", label: "Retention Rate" },
          { value: "15+", label: "Class Types" },
        ].map((s) => (
          <div key={s.label} style={panelStyles.stat}>
            <span style={panelStyles.statValue}>{s.value}</span>
            <span style={panelStyles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={panelStyles.pills}>
        {[
          "Member Analytics",
          "Schedule Manager",
          "Revenue Insights",
          "Staff Tools",
        ].map((f) => (
          <span key={f} style={panelStyles.pill}>
            {f}
          </span>
        ))}
      </div>
    </div>

    <div style={panelStyles.bottomFade} />
  </div>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login, { isLoading }] = useVendorLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login({ email, password }).unwrap();
      if (result.token) {
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("vendorUsername", result.vendor?.username || "");
        const decoded = JSON.parse(atob(result.token.split(".")[1]));
        dispatch(
          setUser({
            email: decoded.email,
            role: decoded.role,
            username: result.vendor?.username,
          }),
        );
        toast.success("Login successful!");
        navigate("/vendor/dashboard");
      }
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Login failed. Please check your email and password.",
        ),
      );
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideIn { from { opacity:0; transform:translateX(-30px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse-glow { 0%,100%{opacity:0.4} 50%{opacity:0.75} }
        .__panel { animation: slideIn 0.7s cubic-bezier(.22,1,.36,1) both; }
        .__form-side { animation: fadeUp 0.7s 0.15s cubic-bezier(.22,1,.36,1) both; opacity:0; }
        .__input::placeholder { color: rgba(100,116,139,0.5); }
        .__input:focus {
          border-color: rgba(251,146,60,0.6) !important;
          background: rgba(251,146,60,0.04) !important;
          box-shadow: 0 0 0 3px rgba(251,146,60,0.12) !important;
          outline: none;
        }
        .__submit:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(234,88,12,0.5) !important;
        }
        .__submit:not(:disabled):active { transform: translateY(0); }
        .__eye:hover { color: rgba(251,146,60,0.85) !important; }
        @media (max-width: 768px) {
          .__split { flex-direction: column !important; }
          .__gym-panel { display: none !important; }
        }
      `}</style>

      <div className="__split" style={styles.split}>
        <div className="__gym-panel __panel" style={styles.gymPanel}>
          <GymPanel />
        </div>

        <div className="__form-side" style={styles.formSide}>
          <div style={styles.formBox}>
            <div style={styles.formHeader}>
              <div style={styles.welcomeTag}>WELCOME BACK</div>
              <h1 style={styles.formHeading}>Vendor Sign In</h1>
              <p style={styles.formSub}>
                Enter your credentials to access the dashboard
              </p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.field}>
                <label style={styles.label}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span style={styles.iconLeft}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </span>
                  <input
                    className="__input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Password</label>
                <div style={{ position: "relative" }}>
                  <span style={styles.iconLeft}>
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input
                    className="__input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    style={{ ...styles.input, paddingRight: "3rem" }}
                  />
                  <button
                    type="button"
                    className="__eye"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                        <line x1="2" y1="2" x2="22" y2="22" />
                      </svg>
                    ) : (
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="__submit"
                disabled={isLoading}
                style={{
                  ...styles.submit,
                  ...(isLoading
                    ? { opacity: 0.55, cursor: "not-allowed" }
                    : {}),
                }}
              >
                {isLoading ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.6rem",
                    }}
                  >
                    <span style={styles.spinner} />
                    Signing in…
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    Access Dashboard
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            <p style={styles.footerNote}>
              Don't have access?{" "}
              <span style={styles.footerLink}>Contact your administrator</span>
            </p>
          </div>

          <div style={styles.bottomBar} />
        </div>
      </div>
    </div>
  );
};

const panelStyles = {
  wrap: {
    position: "relative",
    width: "100%",
    height: "100%",
    background: "linear-gradient(160deg,#0a0a0a 0%,#1a0a00 40%,#0f0a1a 100%)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(180deg,rgba(0,0,0,0.2) 0%,rgba(0,0,0,0.65) 100%)",
    zIndex: 1,
  },
  texture: { position: "absolute", inset: 0, zIndex: 2 },
  glow: {
    position: "absolute",
    top: "20%",
    left: "-20%",
    width: "80%",
    height: "60%",
    borderRadius: "50%",
    background:
      "radial-gradient(ellipse,rgba(234,88,12,0.2) 0%,transparent 70%)",
    zIndex: 3,
    animation: "pulse-glow 4s ease-in-out infinite",
  },
  content: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    padding: "2.5rem",
    justifyContent: "space-between",
  },
  brand: { display: "flex", alignItems: "center", gap: "0.6rem" },
  logoMark: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg,#ea580c,#dc2626)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 16px rgba(234,88,12,0.4)",
  },
  brandName: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#ffffff",
    letterSpacing: "0.08em",
    fontFamily: "'Barlow Condensed',sans-serif",
    textTransform: "uppercase",
  },
  hero: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    paddingTop: "2rem",
  },
  tag: {
    display: "inline-block",
    fontSize: "0.65rem",
    fontWeight: "600",
    letterSpacing: "0.18em",
    color: "#fb923c",
    border: "1px solid rgba(251,146,60,0.4)",
    padding: "4px 12px",
    borderRadius: "4px",
    marginBottom: "1.2rem",
    width: "fit-content",
    fontFamily: "'DM Sans',sans-serif",
  },
  headline: {
    fontSize: "clamp(2.2rem,3.5vw,3rem)",
    fontWeight: "800",
    color: "#ffffff",
    lineHeight: 1.05,
    letterSpacing: "-0.02em",
    margin: "0 0 1.2rem",
    fontFamily: "'Barlow Condensed',sans-serif",
    textTransform: "uppercase",
  },
  headlineAccent: {
    background: "linear-gradient(90deg,#fb923c,#f97316)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  heroSub: {
    fontSize: "0.875rem",
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.7,
    maxWidth: "300px",
    margin: 0,
    fontFamily: "'DM Sans',sans-serif",
  },
  stats: { display: "flex", gap: "1.5rem", marginBottom: "1.5rem" },
  stat: { display: "flex", flexDirection: "column", gap: "2px" },
  statValue: {
    fontSize: "1.6rem",
    fontWeight: "800",
    color: "#fb923c",
    lineHeight: 1,
    fontFamily: "'Barlow Condensed',sans-serif",
  },
  statLabel: {
    fontSize: "0.68rem",
    color: "rgba(255,255,255,0.38)",
    fontFamily: "'DM Sans',sans-serif",
    letterSpacing: "0.04em",
  },
  pills: { display: "flex", flexWrap: "wrap", gap: "0.5rem" },
  pill: {
    fontSize: "0.7rem",
    fontWeight: "500",
    color: "rgba(255,255,255,0.5)",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: "5px 12px",
    borderRadius: "100px",
    fontFamily: "'DM Sans',sans-serif",
  },
  bottomFade: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100px",
    background: "linear-gradient(0deg,rgba(0,0,0,0.7) 0%,transparent 100%)",
    zIndex: 5,
  },
};

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    background: "#0c0c0c",
    fontFamily: "'DM Sans',system-ui,sans-serif",
  },
  split: { display: "flex", width: "100%", minHeight: "100vh" },
  gymPanel: { flex: "0 0 50%", maxWidth: "50%", position: "relative" },
  formSide: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#111111",
    padding: "3rem 2rem",
    position: "relative",
    minHeight: "100vh",
  },
  formBox: { width: "100%", maxWidth: "380px" },
  formHeader: { marginBottom: "2.5rem" },
  welcomeTag: {
    fontSize: "0.65rem",
    fontWeight: "600",
    letterSpacing: "0.18em",
    color: "#fb923c",
    marginBottom: "0.75rem",
  },
  formHeading: {
    fontSize: "2rem",
    fontWeight: "800",
    color: "#ffffff",
    margin: "0 0 0.5rem",
    letterSpacing: "-0.03em",
    lineHeight: 1.1,
    fontFamily: "'Barlow Condensed',sans-serif",
    textTransform: "uppercase",
  },
  formSub: {
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.3)",
    margin: 0,
    lineHeight: 1.6,
  },
  form: { display: "flex", flexDirection: "column", gap: "1.25rem" },
  field: { display: "flex", flexDirection: "column", gap: "0.45rem" },
  label: {
    fontSize: "0.72rem",
    fontWeight: "600",
    color: "rgba(255,255,255,0.38)",
    letterSpacing: "0.1em",
    textTransform: "uppercase",
  },
  iconLeft: {
    position: "absolute",
    left: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.22)",
    display: "flex",
    alignItems: "center",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "0.875rem 1rem 0.875rem 2.75rem",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#ffffff",
    fontSize: "0.9rem",
    outline: "none",
    transition: "all 0.2s",
    fontFamily: "'DM Sans',sans-serif",
  },
  eyeBtn: {
    position: "absolute",
    right: "1rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "rgba(255,255,255,0.22)",
    padding: 0,
    display: "flex",
    alignItems: "center",
    transition: "color 0.2s",
  },
  submit: {
    marginTop: "0.5rem",
    width: "100%",
    padding: "1rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg,#ea580c 0%,#dc2626 100%)",
    color: "#ffffff",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
    boxShadow: "0 4px 20px rgba(234,88,12,0.35)",
    fontFamily: "'DM Sans',sans-serif",
    letterSpacing: "0.02em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    display: "inline-block",
    width: "15px",
    height: "15px",
    border: "2px solid rgba(255,255,255,0.3)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    flexShrink: 0,
  },
  footerNote: {
    marginTop: "2rem",
    textAlign: "center",
    fontSize: "0.8rem",
    color: "rgba(255,255,255,0.22)",
  },
  footerLink: {
    color: "rgba(251,146,60,0.65)",
    fontWeight: "500",
    cursor: "default",
  },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "3px",
    background: "linear-gradient(90deg,#ea580c,#dc2626,#ea580c)",
  },
};

export default Login;
