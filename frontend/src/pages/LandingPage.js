import React from "react";
import { useNavigate } from "react-router-dom";
import { Brain, Shield, Calendar, Clock, ArrowRight, Heart } from "lucide-react";

const features = [
  { icon: Brain,    color: "var(--teal)",   title: "AI Symptom Analysis",  desc: "Describe symptoms and get instant AI-powered diagnosis via Groq LLM." },
  { icon: Shield,   color: "var(--blue)",   title: "Find Specialists",     desc: "Get matched to the right doctor based on your symptoms." },
  { icon: Calendar, color: "var(--purple)", title: "Easy Booking",         desc: "Book with verified doctors in seconds — real-time availability." },
  { icon: Clock,    color: "var(--orange)", title: "24/7 Access",          desc: "Access your health dashboard and AI checker anytime, anywhere." },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", background: "var(--dark)" }}>

      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 56px", borderBottom: "1px solid var(--line)" }}>
        <div style={{ fontFamily: "var(--display)", fontSize: "1.4rem", fontWeight: 800, color: "var(--teal)" }}>
          HealthAI
        </div>
        <div className="row gap12">
          <button className="btn btn-outline" onClick={() => navigate("/login")}>Sign In</button>
          <button className="btn btn-green"   onClick={() => navigate("/register")}>Get Started</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ textAlign: "center", padding: "90px 36px 56px", position: "relative" }}>
        {/* subtle glow */}
        <div style={{ position: "absolute", top: "40%", left: "50%", transform: "translate(-50%,-50%)", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(0,212,170,0.055) 0%, transparent 68%)", pointerEvents: "none" }} />

        <div className="row gap8 mb28" style={{ justifyContent: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(0,212,170,0.09)", border: "1px solid var(--teal-line)", borderRadius: 20, padding: "5px 14px" }}>
            <Brain size={13} color="var(--teal)" />
            <span style={{ fontSize: "0.78rem", color: "var(--teal)", fontWeight: 600 }}>AI-Powered Healthcare</span>
          </div>
        </div>

        <h1 style={{ fontFamily: "var(--display)", fontSize: "clamp(2.4rem,5vw,3.8rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 18 }}>
          Your Health, Powered by<br />
          <span style={{ color: "var(--teal)" }}>Artificial Intelligence</span>
        </h1>

        <p className="muted mb40" style={{ fontSize: "1.05rem", maxWidth: 530, margin: "0 auto 36px", lineHeight: 1.72 }}>
          Describe your symptoms, get instant AI analysis, find the right specialist, and book appointments — all in one place.
        </p>

        <div className="row gap14 wrap" style={{ justifyContent: "center" }}>
          <button className="btn btn-green lg" onClick={() => navigate("/register")}>
            Start for Free <ArrowRight size={17} />
          </button>
          <button className="btn btn-outline lg" onClick={() => navigate("/login")}>
            Sign In
          </button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 18, padding: "0 56px 72px", maxWidth: 1160, margin: "0 auto" }}>
        {features.map(({ icon: Icon, color, title, desc }) => (
          <div key={title} className="card">
            <div style={{ width: 46, height: 46, borderRadius: 13, background: `${color}17`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
              <Icon size={21} color={color} />
            </div>
            <h3 className="mb8" style={{ fontSize: "0.97rem", fontWeight: 700 }}>{title}</h3>
            <p className="sm-txt muted" style={{ lineHeight: 1.6 }}>{desc}</p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={{ textAlign: "center", padding: "18px", borderTop: "1px solid var(--line)" }} className="xs-txt muted">
        <Heart size={11} style={{ display: "inline", marginRight: 5, color: "var(--red)" }} />
        Built for Flipr.ai · HealthAI 2025
      </div>
    </div>
  );
}
