import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { Calendar, Clock, X, CheckCircle, MessageCircle, FileText } from "lucide-react";
import Sidebar from "../components/Sidebar";

const filters = ["all", "pending", "confirmed", "completed", "cancelled"];

export default function AppointmentsPage() {
  const navigate = useNavigate();
  const [list, setList] = useState([]);
  const [busy, setBusy] = useState(true);
  const [tab, setTab] = useState("all");

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data } = await axios.get("/appointments");
      setList(data);
    } catch {
      toast.error("Failed to load appointments");
    } finally {
      setBusy(false);
    }
  }

  async function cancel(id) {
    if (!window.confirm("Cancel this appointment?")) return;
    try {
      await axios.delete(`/appointments/${id}`);
      toast.success("Appointment cancelled");
      load();
    } catch {
      toast.error("Could not cancel");
    }
  }

  async function markDone(id) {
    try {
      await axios.put(`/appointments/${id}`, { status: "completed" });
      toast.success("Marked as completed");
      load();
    } catch {
      toast.error("Could not update");
    }
  }

  const shown = list.filter(a => tab === "all" || a.status === tab);

  return (
    <div className="page">
      <Sidebar />

      <main className="content">
        <div className="ph">
          <h1>My Appointments</h1>
          <p>Manage your scheduled consultations</p>
        </div>

        {/* Filter tabs */}
        <div className="row wrap gap8 mb24">
          {filters.map(f => (
            <button
              key={f}
              className={`pill-btn ${tab === f ? "picked" : ""}`}
              onClick={() => setTab(f)}
              style={{ textTransform: "capitalize", ...(tab === f ? { border: "1px solid var(--teal)", color: "var(--teal)" } : {}) }}
            >
              {f}
            </button>
          ))}
        </div>

        {busy ? (
          <div className="empty">Loading appointments...</div>
        ) : shown.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
            <Calendar size={44} color="var(--muted)" style={{ margin: "0 auto 12px" }} />
            <p className="muted">No appointments found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {shown.map(apt => (
              <div key={apt._id} className="card row gap20" style={{ alignItems: "flex-start" }}>

                {/* Date block */}
                <div style={{ textAlign: "center", background: "var(--dark2)", borderRadius: 11, padding: "11px 14px", minWidth: 64, flexShrink: 0 }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "1.55rem", fontWeight: 800, color: "var(--teal)", lineHeight: 1 }}>
                    {new Date(apt.date).getDate()}
                  </div>
                  <div className="xs-txt muted" style={{ textTransform: "uppercase", letterSpacing: 1 }}>
                    {new Date(apt.date).toLocaleDateString("en-US", { month: "short" })}
                  </div>
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div className="row sb mb8">
                    <div>
                      <h3 style={{ fontSize: "0.97rem", fontWeight: 700 }}>
                        {apt.doctor?.user?.name || "Doctor"}
                      </h3>
                      <p className="xs-txt muted mt4">{apt.doctor?.specialization}</p>
                    </div>
                    <span className={`badge ${apt.status}`}>{apt.status}</span>
                  </div>

                  <div className="row gap16 wrap">
                    <div className="row gap6 sm-txt muted">
                      <Clock size={12} color="var(--blue)" /> {apt.timeSlot}
                    </div>
                    {apt.symptoms && (
                      <div className="sm-txt muted">
                        {apt.symptoms.substring(0, 70)}{apt.symptoms.length > 70 ? "..." : ""}
                      </div>
                    )}
                  </div>

                  {apt.aiDiagnosis && (
                    <div className="sm-txt muted mt10" style={{ padding: "9px 13px", background: "rgba(0,212,170,0.05)", border: "1px solid var(--teal-line)", borderRadius: 8 }}>
                      🤖 {apt.aiDiagnosis.substring(0, 100)}...
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flexShrink: 0 }}>
                  <button className="btn btn-outline sm" onClick={() => navigate(`/chat/${apt._id}`)}>
                    <MessageCircle size={12} /> Chat
                  </button>
                  <button className="btn btn-outline sm" onClick={() => navigate(`/prescription/${apt._id}`)}>
                    <FileText size={12} /> Rx
                  </button>
                  {apt.status === "pending" && (
                    <>
                      <button className="btn btn-outline sm" onClick={() => markDone(apt._id)}>
                        <CheckCircle size={12} /> Done
                      </button>
                      <button className="btn btn-ghost-red sm" onClick={() => cancel(apt._id)}>
                        <X size={12} /> Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
