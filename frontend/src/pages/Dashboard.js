import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Calendar, Activity, CheckCircle, Brain, Clock, ArrowRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user }          = useAuth();
  const navigate          = useNavigate();
  const [stats, setStats] = useState(null);
  const [busy, setBusy]   = useState(true);

  useEffect(() => {
    axios.get("/dashboard/stats")
      .then(r => setStats(r.data))
      .catch(console.error)
      .finally(() => setBusy(false));
  }, []);

  function greeting() {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  }

  const cards = stats ? [
    { label: "Total Appointments", value: stats.totalAppointments  || 0, icon: Calendar,     color: "var(--blue)"   },
    { label: "Upcoming",           value: stats.upcomingAppointments || 0, icon: Clock,       color: "var(--orange)" },
    { label: "Completed",          value: stats.completedAppointments || 0, icon: CheckCircle, color: "var(--teal)"  },
    { label: "AI Checks Done",     value: stats.symptomChecks       || 0, icon: Brain,        color: "var(--purple)" },
  ] : [];

  return (
    <div className="page">
      <Sidebar />

      <main className="content">
        {/* Header */}
        <div className="mb32">
          <h1 style={{ fontSize: "1.9rem", fontWeight: 800 }}>
            {greeting()}, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="muted mt4">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {busy ? (
          <div className="empty">Loading your health data...</div>
        ) : (
          <>
            {/* Stat row */}
            <div className="cols4 mb28">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="stat">
                  <div className="stat-ico" style={{ background: `${color}18` }}>
                    <Icon size={21} color={color} />
                  </div>
                  <div>
                    <div className="stat-num">{value}</div>
                    <div className="stat-lbl">{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="cols2 mb28">
              <div
                className="action-card"
                onClick={() => navigate("/symptom-checker")}
                style={{ background: "linear-gradient(135deg, rgba(0,212,170,0.07), rgba(59,130,246,0.07))", borderColor: "var(--teal-line)" }}
              >
                <div>
                  <div className="row gap10 mb8">
                    <Brain size={19} color="var(--teal)" />
                    <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "1rem" }}>
                      AI Symptom Checker
                    </span>
                  </div>
                  <p className="sm-txt muted">Get instant AI-powered diagnosis from your symptoms</p>
                </div>
                <ArrowRight size={19} color="var(--teal)" />
              </div>

              <div className="action-card" onClick={() => navigate("/doctors")}>
                <div>
                  <div className="row gap10 mb8">
                    <Activity size={19} color="var(--blue)" />
                    <span style={{ fontFamily: "var(--display)", fontWeight: 700, fontSize: "1rem" }}>
                      Find a Doctor
                    </span>
                  </div>
                  <p className="sm-txt muted">Browse verified specialists and book a slot</p>
                </div>
                <ArrowRight size={19} color="var(--blue)" />
              </div>
            </div>

            {/* Recent appointments */}
            {stats?.recentAppointments?.length > 0 && (
              <div className="card">
                <div className="row sb mb20">
                  <h3 style={{ fontSize: "1.05rem", fontWeight: 700 }}>Recent Appointments</h3>
                  <button className="btn btn-outline sm" onClick={() => navigate("/appointments")}>
                    View all
                  </button>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {stats.recentAppointments.slice(0, 4).map(apt => (
                    <div key={apt._id} className="apt-row">
                      <div className="row gap14">
                        <div style={{ width: 38, height: 38, borderRadius: 10, background: "rgba(59,130,246,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Calendar size={15} color="var(--blue)" />
                        </div>
                        <div>
                          <div className="sm-txt w700">{apt.timeSlot}</div>
                          <div className="xs-txt muted">{new Date(apt.date).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <span className={`badge ${apt.status}`}>{apt.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!stats?.recentAppointments?.length && (
              <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
                <Brain size={44} color="var(--muted)" style={{ margin: "0 auto 14px" }} />
                <h3 className="mb8">Start your health journey</h3>
                <p className="muted sm-txt mb24">Use the AI checker or book your first appointment</p>
                <button className="btn btn-green" onClick={() => navigate("/symptom-checker")}>
                  <Brain size={15} /> Try Symptom Checker
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
