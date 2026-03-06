import React, { useState, useEffect } from "react";
import axios from "axios";
import { Clock, Brain, Calendar, Activity } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function HealthTimeline() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            axios.get("/symptoms/history").catch(() => ({ data: [] })),
            axios.get("/appointments").catch(() => ({ data: [] }))
        ]).then(([symptomsRes, aptsRes]) => {
            const symptomItems = (symptomsRes.data || []).map(s => ({
                type: "symptom",
                date: new Date(s.createdAt),
                title: `Symptom Check`,
                detail: `Symptoms: ${s.symptoms?.join(", ")}`,
                sub: s.recommendedSpecialist ? `→ See ${s.recommendedSpecialist}` : "",
                color: "var(--purple)",
                icon: "brain"
            }));
            const aptItems = (aptsRes.data || []).map(a => ({
                type: "appointment",
                date: new Date(a.date),
                title: `Appointment`,
                detail: a.timeSlot ? `Time: ${a.timeSlot}` : "Booked",
                sub: `Status: ${a.status}`,
                color: a.status === "completed" ? "var(--teal)" : a.status === "cancelled" ? "var(--red)" : "var(--blue)",
                icon: "calendar"
            }));
            const all = [...symptomItems, ...aptItems].sort((a, b) => b.date - a.date);
            setItems(all);
        }).finally(() => setLoading(false));
    }, []);

    return (
        <div className="page">
            <Sidebar />
            <main className="content">
                <div className="ph">
                    <div className="row gap12">
                        <Clock size={22} color="var(--purple)" />
                        <div>
                            <h1>Health Timeline</h1>
                            <p className="muted">Your complete medical history in one view</p>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="empty">Loading your timeline...</div>
                ) : items.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
                        <Activity size={44} color="var(--muted)" style={{ margin: "0 auto 14px" }} />
                        <p className="muted">No health history yet. Use Symptom Checker or book an appointment to get started.</p>
                    </div>
                ) : (
                    <div style={{ position: "relative", paddingLeft: 32 }}>
                        {/* Vertical line */}
                        <div style={{ position: "absolute", left: 15, top: 0, bottom: 0, width: 2, background: "var(--border)", borderRadius: 2 }} />

                        {items.map((item, i) => (
                            <div key={i} style={{ position: "relative", marginBottom: 28 }}>
                                {/* Dot */}
                                <div style={{
                                    position: "absolute", left: -24, top: 12,
                                    width: 18, height: 18, borderRadius: "50%",
                                    background: item.color, border: "3px solid var(--dark)",
                                    display: "flex", alignItems: "center", justifyContent: "center"
                                }}>
                                    {item.icon === "brain" ? <Brain size={8} color="#000" /> : <Calendar size={8} color="#000" />}
                                </div>

                                <div className="card" style={{ borderLeft: `3px solid ${item.color}` }}>
                                    <div className="row sb mb6">
                                        <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{item.title}</span>
                                        <span className="xs-txt muted">
                                            {item.date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                                        </span>
                                    </div>
                                    <p className="sm-txt mb4">{item.detail}</p>
                                    {item.sub && <p className="xs-txt muted">{item.sub}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
