import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { FileText, Plus, Trash2, Download } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

const emptyMed = { name: "", dosage: "", frequency: "", duration: "" };

export default function PrescriptionPage() {
    const { appointmentId } = useParams();
    const { user } = useAuth();
    const isDoctor = user?.role === "doctor";

    const [prescription, setPrescription] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState({
        patientId: "",
        diagnosis: "",
        notes: "",
        medicines: [{ ...emptyMed }]
    });

    useEffect(() => {
        axios.get(`/prescriptions/appointment/${appointmentId}`)
            .then(r => setPrescription(r.data))
            .catch(() => { }); // 404 = no prescription yet
    }, [appointmentId]);

    function setMed(i, field, val) {
        setForm(prev => {
            const meds = [...prev.medicines];
            meds[i] = { ...meds[i], [field]: val };
            return { ...prev, medicines: meds };
        });
    }

    function addMed() { setForm(prev => ({ ...prev, medicines: [...prev.medicines, { ...emptyMed }] })); }
    function removeMed(i) { setForm(prev => ({ ...prev, medicines: prev.medicines.filter((_, idx) => idx !== i) })); }

    async function save() {
        setSaving(true);
        try {
            const { data } = await axios.post("/prescriptions", {
                appointmentId,
                patientId: form.patientId || "000000000000000000000000",
                medicines: form.medicines.filter(m => m.name),
                diagnosis: form.diagnosis,
                notes: form.notes
            });
            setPrescription(data);
            toast.success("Prescription saved!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Save failed");
        } finally { setSaving(false); }
    }

    function downloadPDF() {
        window.open(`http://localhost:5000/api/prescriptions/${prescription._id}/pdf`, "_blank");
    }

    return (
        <div className="page">
            <Sidebar />
            <main className="content">
                <div className="ph">
                    <div className="row gap12">
                        <FileText size={22} color="var(--blue)" />
                        <div>
                            <h1>Prescription</h1>
                            <p className="muted">Appointment #{appointmentId?.slice(-6)}</p>
                        </div>
                    </div>
                </div>

                {prescription ? (
                    <div className="card">
                        <div className="row sb mb20">
                            <h2 style={{ fontSize: "1.1rem" }}>Prescription Details</h2>
                            <button className="btn btn-green sm" onClick={downloadPDF}>
                                <Download size={14} /> Download PDF
                            </button>
                        </div>
                        {prescription.diagnosis && <p className="mb12"><strong>Diagnosis:</strong> {prescription.diagnosis}</p>}
                        <h3 className="mb12" style={{ fontSize: "0.95rem" }}>Medicines</h3>
                        {prescription.medicines?.map((m, i) => (
                            <div key={i} className="apt-row mb8">
                                <div>
                                    <div className="sm-txt w700">{m.name}</div>
                                    <div className="xs-txt muted">{[m.dosage, m.frequency, m.duration].filter(Boolean).join(" · ")}</div>
                                </div>
                            </div>
                        ))}
                        {prescription.notes && <p className="mt12 sm-txt muted">Notes: {prescription.notes}</p>}
                    </div>
                ) : isDoctor ? (
                    <div className="card">
                        <h2 className="mb20" style={{ fontSize: "1.1rem" }}>Write Prescription</h2>
                        <div className="field mb16">
                            <label className="label">Diagnosis</label>
                            <input className="input" placeholder="e.g. Acute pharyngitis" value={form.diagnosis} onChange={e => setForm(p => ({ ...p, diagnosis: e.target.value }))} />
                        </div>
                        <h3 className="mb12" style={{ fontSize: "0.95rem" }}>Medicines</h3>
                        {form.medicines.map((med, i) => (
                            <div key={i} className="card mb12" style={{ background: "var(--dark3)", padding: 14 }}>
                                <div className="row sb mb8">
                                    <span className="xs-txt muted">Medicine {i + 1}</span>
                                    {i > 0 && <button className="btn btn-outline sm" onClick={() => removeMed(i)}><Trash2 size={12} /></button>}
                                </div>
                                <div className="cols2">
                                    <div className="field"><label className="label">Name *</label><input className="input" placeholder="Paracetamol" value={med.name} onChange={e => setMed(i, "name", e.target.value)} /></div>
                                    <div className="field"><label className="label">Dosage</label><input className="input" placeholder="500mg" value={med.dosage} onChange={e => setMed(i, "dosage", e.target.value)} /></div>
                                    <div className="field"><label className="label">Frequency</label><input className="input" placeholder="3x daily" value={med.frequency} onChange={e => setMed(i, "frequency", e.target.value)} /></div>
                                    <div className="field"><label className="label">Duration</label><input className="input" placeholder="5 days" value={med.duration} onChange={e => setMed(i, "duration", e.target.value)} /></div>
                                </div>
                            </div>
                        ))}
                        <button className="btn btn-outline mb20" onClick={addMed}><Plus size={14} /> Add Medicine</button>
                        <div className="field mb20">
                            <label className="label">Additional Notes</label>
                            <textarea className="textarea" rows={3} placeholder="Special instructions..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                        </div>
                        <button className="btn btn-green" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save Prescription"}</button>
                    </div>
                ) : (
                    <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
                        <FileText size={44} color="var(--muted)" style={{ margin: "0 auto 14px" }} />
                        <p className="muted">No prescription has been written yet for this appointment.</p>
                    </div>
                )}
            </main>
        </div>
    );
}
