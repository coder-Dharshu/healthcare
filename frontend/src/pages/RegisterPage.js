import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { UserPlus } from "lucide-react";
import { useAuth } from "../context/AuthContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [busy, setBusy] = useState(false);

  const [form, setForm] = useState({
    name: "", email: "", password: "",
    role: "patient", age: "", gender: "",
    phone: "", bloodGroup: "",
  });

  function set(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password needs at least 6 characters");
    setBusy(true);
    try {
      await register(form);
      toast.success("Account created!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--dark)", padding: 20 }}>
      <div style={{ width: "100%", maxWidth: 470 }}>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "rgba(0,212,170,0.1)", border: "1px solid var(--teal-line)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <UserPlus size={24} color="var(--teal)" />
          </div>
          <h1 style={{ fontSize: "1.7rem", fontWeight: 800 }}>Create account</h1>
          <p className="muted mt4 sm-txt">Join HealthAI — your smart health companion</p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 15 }}>
            <div className="cols2">
              <div className="field">
                <label className="label">Full Name</label>
                <input className="input" placeholder="John Doe" value={form.name} onChange={set("name")} required />
              </div>
              <div className="field">
                <label className="label">Role</label>
                <select className="select" value={form.role} onChange={set("role")}>
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
              </div>
            </div>

            <div className="field">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
            </div>

            <div className="field">
              <label className="label">Password</label>
              <input className="input" type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required />
            </div>

            <div className="cols2">
              <div className="field">
                <label className="label">Age</label>
                <input className="input" type="number" placeholder="25" value={form.age} onChange={set("age")} />
              </div>
              <div className="field">
                <label className="label">Gender</label>
                <select className="select" value={form.gender} onChange={set("gender")}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="cols2">
              <div className="field">
                <label className="label">Phone</label>
                <input className="input" placeholder="+91 xxxxxxxxxx" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="field">
                <label className="label">Blood Group</label>
                <select className="select" value={form.bloodGroup} onChange={set("bloodGroup")}>
                  <option value="">Select</option>
                  {bloodGroups.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>

            <button
              className="btn btn-green"
              type="submit"
              disabled={busy}
              style={{ width: "100%", justifyContent: "center", marginTop: 4 }}
            >
              {busy ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="sm-txt muted mt20" style={{ textAlign: "center" }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--teal)", fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
