import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Bell, Plus, Trash2, Pill } from "lucide-react";
import Sidebar from "../components/Sidebar";

const STORAGE_KEY = "healthai_medicines";

export default function MedicineReminder() {
    const [medicines, setMedicines] = useState(() => {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
        catch { return []; }
    });
    const [form, setForm] = useState({ name: "", time: "" });
    const [notifGranted, setNotifGranted] = useState(Notification.permission === "granted");

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines));
    }, [medicines]);

    // Check every minute for due reminders
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
            medicines.forEach(med => {
                if (med.time === hhmm && notifGranted) {
                    new Notification("💊 Medicine Reminder — HealthAI", {
                        body: `Time to take: ${med.name}`,
                        icon: "/logo192.png"
                    });
                }
            });
        }, 60000);
        return () => clearInterval(interval);
    }, [medicines, notifGranted]);

    async function requestPermission() {
        const result = await Notification.requestPermission();
        setNotifGranted(result === "granted");
        if (result === "granted") toast.success("Notifications enabled!");
        else toast.error("Please allow notifications in browser settings.");
    }

    function addMedicine(e) {
        e.preventDefault();
        if (!form.name || !form.time) return toast.error("Enter medicine name and time");
        setMedicines(prev => [...prev, { ...form, id: Date.now() }]);
        setForm({ name: "", time: "" });
        toast.success(`Reminder set for ${form.name} at ${form.time}`);
    }

    function deleteMed(id) {
        setMedicines(prev => prev.filter(m => m.id !== id));
    }

    function testNotif() {
        if (!notifGranted) return toast.error("Enable notifications first");
        new Notification("💊 HealthAI Test", { body: "Notifications are working!" });
    }

    return (
        <div className="page">
            <Sidebar />
            <main className="content">
                <div className="ph">
                    <div className="row gap12">
                        <Bell size={22} color="var(--orange)" />
                        <div>
                            <h1>Medicine Reminder</h1>
                            <p className="muted">Browser notifications at the right time</p>
                        </div>
                    </div>
                </div>

                {/* Permission Banner */}
                {!notifGranted && (
                    <div className="card mb20" style={{ background: "rgba(249,115,22,0.08)", borderColor: "rgba(249,115,22,0.3)" }}>
                        <div className="row sb">
                            <div>
                                <div className="sm-txt w700">Enable Browser Notifications</div>
                                <div className="xs-txt muted mt4">Required for medicine reminders to work</div>
                            </div>
                            <button className="btn btn-green sm" onClick={requestPermission}><Bell size={13} /> Allow</button>
                        </div>
                    </div>
                )}

                {/* Add Medicine */}
                <div className="card mb24">
                    <h2 className="mb16" style={{ fontSize: "1rem" }}>Add New Reminder</h2>
                    <form onSubmit={addMedicine}>
                        <div className="cols2 mb16">
                            <div className="field">
                                <label className="label">Medicine Name</label>
                                <input className="input" placeholder="e.g. Paracetamol" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div className="field">
                                <label className="label">Reminder Time</label>
                                <input className="input" type="time" value={form.time} onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                            </div>
                        </div>
                        <div className="row gap10">
                            <button className="btn btn-green" type="submit"><Plus size={14} /> Add Reminder</button>
                            {notifGranted && <button type="button" className="btn btn-outline sm" onClick={testNotif}>Test Notification</button>}
                        </div>
                    </form>
                </div>

                {/* Active Reminders */}
                <h3 className="mb16" style={{ fontSize: "1rem" }}>Active Reminders ({medicines.length})</h3>
                {medicines.length === 0 ? (
                    <div className="card" style={{ textAlign: "center", padding: "48px 22px" }}>
                        <Pill size={44} color="var(--muted)" style={{ margin: "0 auto 14px" }} />
                        <p className="muted">No reminders set yet. Add your first medicine above.</p>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {medicines.map(med => (
                            <div key={med.id} className="card apt-row">
                                <div className="row gap14">
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(249,115,22,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        <Pill size={16} color="var(--orange)" />
                                    </div>
                                    <div>
                                        <div className="sm-txt w700">{med.name}</div>
                                        <div className="xs-txt muted">Daily at {med.time}</div>
                                    </div>
                                </div>
                                <button className="btn btn-outline sm" onClick={() => deleteMed(med.id)}><Trash2 size={13} /></button>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
