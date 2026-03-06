import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login }                     = useAuth();
  const navigate                      = useNavigate();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [busy, setBusy]               = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dark)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 410 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,170,0.1)", border: "1px solid var(--teal-line)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <Activity size={24} color="var(--teal)" />
          </div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800 }}>Welcome back</h1>
          <p className="muted mt4 sm-txt">Sign in to your HealthAI account</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="field">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <div style={{ position: "relative" }}>
                <input
                  className="input"
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 42 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: "var(--muted)", cursor: "pointer" }}
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              className="btn btn-green"
              type="submit"
              disabled={busy}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            >
              {busy ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="sm-txt muted mt20" style={{ textAlign: "center" }}>
            Don't have an account?{" "}
            <Link to="/register" style={{ color: "var(--teal)", fontWeight: 600 }}>Create one</Link>
          </p>
        </div>

        <p className="sm-txt mt16" style={{ textAlign: "center" }}>
          <Link to="/" className="muted">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
