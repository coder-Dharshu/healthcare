import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Search, Award, Calendar, DollarSign } from "lucide-react";
import Sidebar from "../components/Sidebar";

const specializations = [
  "All", "Cardiologist", "Neurologist", "Dermatologist",
  "Orthopedic", "Pediatrician", "General Physician", "Psychiatrist",
];

// ── Booking modal ──────────────────────────────────────────────

function BookingModal({ doctor, onClose, onDone }) {
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const dayName = date ? new Date(date).toLocaleDateString("en-US", { weekday: "long" }) : "";
  const slots = doctor.availableSlots?.find(s => s.day === dayName)?.slots || [];

  async function book() {
    if (!date || !slot) return toast.error("Pick a date and time slot");
    setBusy(true);
    try {
      await axios.post("/appointments", {
        doctorId: doctor._id,
        date,
        timeSlot: slot,
        symptoms: notes,
      });
      toast.success("Appointment booked!");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-top">
          <h2>Book Appointment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        {/* Doctor preview */}
        <div className="row gap14 mb24" style={{ background: "var(--dark2)", borderRadius: 11, padding: "13px 15px" }}>
          <div className="doc-pic">👨‍⚕️</div>
          <div>
            <div className="doc-name">{doctor.user?.name}</div>
            <div className="doc-spec">{doctor.specialization}</div>
            <div className="xs-txt muted mt4">{doctor.experience} yrs exp · ₹{doctor.consultationFee}</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="field">
            <label className="label">Date</label>
            <input
              className="input"
              type="date"
              value={date}
              min={new Date().toISOString().split("T")[0]}
              onChange={e => { setDate(e.target.value); setSlot(""); }}
            />
          </div>

          {date && (
            <div className="field">
              <label className="label">Available slots — {dayName}</label>
              {slots.length ? (
                <div className="row wrap gap8">
                  {slots.map(s => (
                    <button
                      key={s}
                      className={`slot-btn ${slot === s ? "picked" : ""}`}
                      onClick={() => setSlot(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="sm-txt muted">No slots on {dayName}. Try another date.</p>
              )}
            </div>
          )}

          <div className="field">
            <label className="label">Symptoms / Notes (optional)</label>
            <textarea
              className="textarea"
              placeholder="Briefly describe your condition..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ minHeight: 75 }}
            />
          </div>

          <div className="row gap12">
            <button className="btn btn-outline" style={{ flex: 1, justifyContent: "center" }} onClick={onClose}>Cancel</button>
            <button className="btn btn-green" style={{ flex: 1, justifyContent: "center" }} onClick={book} disabled={busy}>
              {busy ? "Booking..." : "Confirm"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState([]);
  const [busy, setBusy] = useState(true);
  const [search, setSearch] = useState("");
  const [spec, setSpec] = useState("All");
  const [selected, setSelected] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const s = searchParams.get("specialization");
    if (s) setSpec(s);
    load();
  }, []);

  async function load() {
    try {
      const { data } = await axios.get("/doctors");
      setDoctors(data);
    } catch {
      toast.error("Failed to load doctors");
    } finally {
      setBusy(false);
    }
  }

  async function seedSamples() {
    try {
      await axios.post("/doctors/seed");
      toast.success("Sample doctors added!");
      load();
    } catch {
      toast.error("Seed failed");
    }
  }

  const visible = doctors.filter(d => {
    const matchSearch = !search
      || d.user?.name?.toLowerCase().includes(search.toLowerCase())
      || d.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchSpec = spec === "All" || d.specialization === spec;
    return matchSearch && matchSpec;
  });

  return (
    <div className="page">
      <Sidebar />

      <main className="content">
        <div className="ph">
          <h1>Find a Doctor</h1>
          <p>Browse verified specialists and book instantly</p>
        </div>

        {/* Search bar */}
        <div className="row gap14 mb24 wrap">
          <div style={{ position: "relative", flex: 1, minWidth: 240 }}>
            <Search size={15} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "var(--muted)" }} />
            <input
              className="input"
              placeholder="Search by name or specialization..."
              style={{ paddingLeft: 38 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          {doctors.length === 0 && (
            <button className="btn btn-outline" onClick={seedSamples}>+ Add Sample Doctors</button>
          )}
        </div>

        {/* Spec filter pills */}
        <div className="row wrap gap8 mb28">
          {specializations.map(s => (
            <button
              key={s}
              className={`pill-btn ${spec === s ? "picked" : ""}`}
              style={spec === s ? { border: "1px solid var(--teal)", color: "var(--teal)" } : {}}
              onClick={() => setSpec(s)}
            >
              {s}
            </button>
          ))}
        </div>

        {busy ? (
          <div className="empty">Loading doctors...</div>
        ) : visible.length === 0 ? (
          <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
            <p className="muted mb16">No doctors found. Add sample doctors to get started.</p>
            <button className="btn btn-green" onClick={seedSamples}>Add Sample Doctors</button>
          </div>
        ) : (
          <div className="cols3">
            {visible.map(doc => (
              <div key={doc._id} className="doc-card">
                <div className="row gap14 mb16">
                  <div className="doc-pic">👨‍⚕️</div>
                  <div style={{ flex: 1 }}>
                    <div className="doc-name">{doc.user?.name}</div>
                    <div className="doc-spec">{doc.specialization}</div>
                    <div className="stars mt4">
                      {"★".repeat(Math.round(doc.rating))}
                      {"☆".repeat(5 - Math.round(doc.rating))}
                      <span className="muted" style={{ marginLeft: 4 }}>({doc.totalReviews})</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 16 }}>
                  <div className="row gap8 sm-txt muted"><Award size={12} color="var(--blue)" /> {doc.qualification}</div>
                  <div className="row gap8 sm-txt muted"><Calendar size={12} color="var(--teal)" /> {doc.experience} yrs experience</div>
                  <div className="row gap8 sm-txt muted"><DollarSign size={12} color="var(--orange)" /> ₹{doc.consultationFee}</div>
                </div>

                <div className="row sb">
                  <div className="row gap6">
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: doc.isAvailable ? "var(--teal)" : "var(--red)" }} />
                    <span className="xs-txt muted">{doc.isAvailable ? "Available" : "Unavailable"}</span>
                  </div>
                  <button
                    className="btn btn-green sm"
                    onClick={() => setSelected(doc)}
                    disabled={!doc.isAvailable}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <BookingModal
            doctor={selected}
            onClose={() => setSelected(null)}
            onDone={() => setSelected(null)}
          />
        )}
      </main>
    </div>
  );
}
