import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { User, Shield, Save, FileDown } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [busy, setBusy] = useState(false);
  const [genBusy, setGenBusy] = useState(false);

  async function generateReport() {
    setGenBusy(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/reports/generate", {
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` }
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "health_report.pdf";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      const { toast } = await import("react-toastify");
      toast.error("Could not generate report — add symptom checks first");
    } finally { setGenBusy(false); }
  }

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    age: user?.age || "",
    gender: user?.gender || "",
    bloodGroup: user?.bloodGroup || "",
    allergies: user?.allergies?.join(", ") || "",
    chronicConditions: user?.chronicConditions?.join(", ") || "",
  });

  function set(key) {
    return e => setForm(prev => ({ ...prev, [key]: e.target.value }));
  }

  async function save() {
    setBusy(true);
    try {
      const payload = {
        ...form,
        allergies: form.allergies.split(",").map(s => s.trim()).filter(Boolean),
        chronicConditions: form.chronicConditions.split(",").map(s => s.trim()).filter(Boolean),
      };
      await axios.put("/auth/profile", payload);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <Sidebar />

      <main className="content">
        <div className="ph">
          <h1>My Profile</h1>
          <p>Manage your personal and medical information</p>
        </div>

        <div className="cols2" style={{ alignItems: "start" }}>
          {/* Personal info */}
          <div className="card">
            <div className="row gap10 mb24">
              <User size={17} color="var(--teal)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Personal Information</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div className="field">
                <label className="label">Full Name</label>
                <input className="input" value={form.name} onChange={set("name")} />
              </div>
              <div className="field">
                <label className="label">Email</label>
                <input className="input" value={user?.email} disabled style={{ opacity: 0.55 }} />
              </div>
              <div className="field">
                <label className="label">Phone</label>
                <input className="input" placeholder="+91 xxxxxxxxxx" value={form.phone} onChange={set("phone")} />
              </div>
              <div className="cols2">
                <div className="field">
                  <label className="label">Age</label>
                  <input className="input" type="number" value={form.age} onChange={set("age")} />
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
            </div>
          </div>

          {/* Medical info */}
          <div className="card">
            <div className="row gap10 mb24">
              <Shield size={17} color="var(--blue)" />
              <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Medical Information</h3>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
              <div className="field">
                <label className="label">Blood Group</label>
                <select className="select" value={form.bloodGroup} onChange={set("bloodGroup")}>
                  <option value="">Select</option>
                  {bloodGroups.map(b => <option key={b}>{b}</option>)}
                </select>
              </div>

              <div className="field">
                <label className="label">Allergies (comma separated)</label>
                <input className="input" placeholder="e.g. Penicillin, Dust" value={form.allergies} onChange={set("allergies")} />
              </div>

              <div className="field">
                <label className="label">Chronic Conditions (comma separated)</label>
                <input className="input" placeholder="e.g. Diabetes, Hypertension" value={form.chronicConditions} onChange={set("chronicConditions")} />
              </div>

              {/* Account card */}
              <div className="row gap12" style={{ background: "var(--dark2)", borderRadius: 10, padding: "12px 15px" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, var(--teal), var(--blue))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#000", fontSize: "1rem" }}>
                  {user?.name?.[0]}
                </div>
                <div>
                  <div className="sm-txt w700">{user?.name}</div>
                  <div className="xs-txt teal" style={{ textTransform: "capitalize" }}>{user?.role} Account</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt24 row gap12">
          <button className="btn btn-green lg" onClick={save} disabled={busy}>
            <Save size={17} /> {busy ? "Saving..." : "Save Changes"}
          </button>
          <button className="btn btn-outline lg" onClick={generateReport} disabled={genBusy}>
            <FileDown size={17} /> {genBusy ? "Generating..." : "AI Health Report"}
          </button>
        </div>
      </main>
    </div>
  );
}
