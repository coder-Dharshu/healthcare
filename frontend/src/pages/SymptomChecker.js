import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Brain, Plus, X, AlertTriangle, CheckCircle, Stethoscope } from "lucide-react";
import Sidebar from "../components/Sidebar";

const commonSymptoms = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea",
  "Chest pain", "Shortness of breath", "Dizziness", "Back pain",
  "Sore throat", "Stomach pain", "Joint pain", "Rash", "Vomiting",
];

const urgencyColors = {
  "Immediate":      "var(--red)",
  "Within 24hrs":   "var(--orange)",
  "Within a week":  "var(--blue)",
  "Monitor at home": "var(--teal)",
};

const severityLabels = {
  mild:     "😌 Mild",
  moderate: "😟 Moderate",
  severe:   "😰 Severe",
};

export default function SymptomChecker() {
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [symptoms, setSymptoms]       = useState([]);
  const [custom, setCustom]           = useState("");
  const [age, setAge]                 = useState("");
  const [gender, setGender]           = useState("");
  const [duration, setDuration]       = useState("");
  const [severity, setSeverity]       = useState("moderate");
  const [result, setResult]           = useState(null);
  const [busy, setBusy]               = useState(false);

  function addSymptom(name) {
    const trimmed = name.trim();
    if (trimmed && !symptoms.includes(trimmed)) {
      setSymptoms(prev => [...prev, trimmed]);
    }
    setCustom("");
  }

  function removeSymptom(name) {
    setSymptoms(prev => prev.filter(s => s !== name));
  }

  async function analyze() {
    if (!symptoms.length) return toast.error("Add at least one symptom");
    if (!age || !gender)  return toast.error("Please fill age and gender");

    setBusy(true);
    try {
      const { data } = await axios.post("/symptoms/analyze", { symptoms, age, gender, duration, severity });
      setResult(data.aiResponse);
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || "Analysis failed — check your Groq API key");
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setStep(1);
    setSymptoms([]);
    setAge(""); setGender(""); setDuration(""); setSeverity("moderate");
    setResult(null);
  }

  // helpers
  const probColor = p =>
    p === "High" ? "var(--red)" : p === "Medium" ? "var(--orange)" : "var(--teal)";

  const probBg = p =>
    p === "High" ? "rgba(239,68,68,0.13)" : p === "Medium" ? "rgba(249,115,22,0.13)" : "rgba(0,212,170,0.13)";

  return (
    <div className="page">
      <Sidebar />

      <main className="content">
        {/* Page header */}
        <div className="ph">
          <div className="row gap12">
            <div style={{ width: 42, height: 42, borderRadius: 12, background: "rgba(0,212,170,0.09)", border: "1px solid var(--teal-line)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Brain size={21} color="var(--teal)" />
            </div>
            <div>
              <h1>AI Symptom Checker</h1>
              <p>Powered by Groq LLM — Llama 3</p>
            </div>
          </div>
        </div>

        {/* Step indicator */}
        <div className="steps">
          {["Symptoms", "Details", "Results"].map((label, i) => {
            const n = i + 1;
            return (
              <React.Fragment key={label}>
                <div className="row gap8">
                  <div className={`step-dot ${step > n ? "done" : step === n ? "cur" : ""}`}>
                    {step > n ? "✓" : n}
                  </div>
                  <span className={`step-name ${step === n ? "cur" : ""}`}>{label}</span>
                </div>
                {i < 2 && <div className="step-line" />}
              </React.Fragment>
            );
          })}
        </div>

        {/* ── Step 1: Pick symptoms ── */}
        {step === 1 && (
          <div className="card show" style={{ maxWidth: 660 }}>
            <h2 className="mb8" style={{ fontSize: "1.15rem" }}>What symptoms are you experiencing?</h2>
            <p className="muted sm-txt mb24">Select from the list or type your own</p>

            {/* Selected tags */}
            {symptoms.length > 0 && (
              <div className="row wrap gap8 mb20">
                {symptoms.map(s => (
                  <div key={s} className="tag">
                    {s}
                    <button onClick={() => removeSymptom(s)}><X size={11} /></button>
                  </div>
                ))}
              </div>
            )}

            {/* Common symptom pills */}
            <div className="row wrap gap8 mb20">
              {commonSymptoms
                .filter(s => !symptoms.includes(s))
                .map(s => (
                  <button key={s} className="pill-btn" onClick={() => addSymptom(s)}>
                    + {s}
                  </button>
                ))}
            </div>

            {/* Custom input */}
            <div className="row gap10 mb28">
              <input
                className="input"
                placeholder="Type a custom symptom..."
                value={custom}
                onChange={e => setCustom(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addSymptom(custom)}
              />
              <button className="btn btn-outline" onClick={() => addSymptom(custom)}>
                <Plus size={15} /> Add
              </button>
            </div>

            <button className="btn btn-green" disabled={!symptoms.length} onClick={() => setStep(2)}>
              Continue →
            </button>
          </div>
        )}

        {/* ── Step 2: Patient details ── */}
        {step === 2 && (
          <div className="card show" style={{ maxWidth: 660 }}>
            <h2 className="mb8" style={{ fontSize: "1.15rem" }}>Tell us a bit about yourself</h2>
            <p className="muted sm-txt mb24">Helps the AI give a more accurate result</p>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="cols2">
                <div className="field">
                  <label className="label">Age</label>
                  <input className="input" type="number" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} />
                </div>
                <div className="field">
                  <label className="label">Gender</label>
                  <select className="select" value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="field">
                <label className="label">How long have you had these symptoms?</label>
                <select className="select" value={duration} onChange={e => setDuration(e.target.value)}>
                  <option value="">Select duration</option>
                  <option>Less than 24 hours</option>
                  <option>1-3 days</option>
                  <option>4-7 days</option>
                  <option>1-2 weeks</option>
                  <option>More than 2 weeks</option>
                </select>
              </div>

              <div className="field">
                <label className="label">Severity</label>
                <div className="row gap10">
                  {["mild", "moderate", "severe"].map(s => (
                    <button
                      key={s}
                      className={`sev-btn ${severity === s ? "picked" : ""}`}
                      onClick={() => setSeverity(s)}
                    >
                      {severityLabels[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="row gap12 mt24">
              <button className="btn btn-outline" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-green" disabled={busy || !age || !gender} onClick={analyze}>
                {busy ? (
                  <>
                    <span className="spin" style={{ display: "inline-block", width: 14, height: 14, border: "2px solid #000", borderTopColor: "transparent", borderRadius: "50%" }} />
                    Analyzing...
                  </>
                ) : (
                  <><Brain size={15} /> Analyze with AI</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Results ── */}
        {step === 3 && result && (
          <div className="show" style={{ maxWidth: 700 }}>

            {/* Urgency banner */}
            <div
              className="row gap12 mb20"
              style={{
                background: `${urgencyColors[result.urgencyLevel] || "var(--blue)"}14`,
                border: `1px solid ${urgencyColors[result.urgencyLevel] || "var(--blue)"}3a`,
                borderRadius: 12, padding: "13px 18px",
              }}
            >
              <AlertTriangle size={19} color={urgencyColors[result.urgencyLevel]} />
              <div>
                <div className="sm-txt w700">Urgency: {result.urgencyLevel}</div>
                <div className="xs-txt muted">
                  See a <strong style={{ color: "var(--white)" }}>{result.recommendedSpecialist}</strong>
                </div>
              </div>
            </div>

            {/* AI summary */}
            <div className="ai-box mb20">
              <div className="row gap10 mb16">
                <Brain size={19} color="var(--teal)" />
                <span style={{ fontFamily: "var(--display)", fontWeight: 700 }}>AI Analysis</span>
                <span className="ai-label">Groq LLM</span>
              </div>
              <p className="sm-txt muted" style={{ lineHeight: 1.75 }}>{result.summary}</p>
            </div>

            {/* Conditions */}
            <div className="card mb20">
              <h3 className="mb16" style={{ fontSize: "1rem" }}>Possible Conditions</h3>
              {result.possibleConditions?.map((c, i) => (
                <div key={i} className="condition">
                  <div className="row sb mb8">
                    <span className="sm-txt w700">{c.condition}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, padding: "2px 9px", borderRadius: 20, background: probBg(c.probability), color: probColor(c.probability) }}>
                      {c.probability}
                    </span>
                  </div>
                  <p className="xs-txt muted">{c.description}</p>
                </div>
              ))}
            </div>

            {/* Remedies + warnings */}
            <div className="cols2 mb20">
              <div className="card">
                <h3 className="row gap8 mb14" style={{ fontSize: "0.95rem" }}>
                  <CheckCircle size={15} color="var(--teal)" /> Home Remedies
                </h3>
                {result.homeRemedies?.map((r, i) => (
                  <div key={i} className="row gap8 sm-txt muted mb8" style={{ alignItems: "flex-start" }}>
                    <span className="teal" style={{ marginTop: 2 }}>•</span> {r}
                  </div>
                ))}
              </div>

              <div className="card">
                <h3 className="row gap8 mb14" style={{ fontSize: "0.95rem" }}>
                  <AlertTriangle size={15} color="var(--red)" /> Warning Signs
                </h3>
                {result.warningsigns?.map((w, i) => (
                  <div key={i} className="row gap8 sm-txt muted mb8" style={{ alignItems: "flex-start" }}>
                    <span style={{ color: "var(--red)", marginTop: 2 }}>⚠</span> {w}
                  </div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="row gap12">
              <button className="btn btn-green" onClick={() => navigate(`/doctors?specialization=${result.recommendedSpecialist}`)}>
                <Stethoscope size={15} /> Book {result.recommendedSpecialist}
              </button>
              <button className="btn btn-outline" onClick={reset}>
                New Check
              </button>
            </div>

            <p className="xs-txt muted mt16">
              ⚕️ This is AI-generated and for informational purposes only. Always consult a qualified doctor.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
