import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Activity,
  Stethoscope,
  Calendar,
  User,
  LogOut,
  Clock,
  Pill,
  Bell,
} from "lucide-react";

const links = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/symptom-checker", icon: Activity, label: "Symptom Checker" },
  { path: "/doctors", icon: Stethoscope, label: "Find Doctors" },
  { path: "/appointments", icon: Calendar, label: "Appointments" },
  { path: "/timeline", icon: Clock, label: "Health Timeline" },
  { path: "/medicine-reminder", icon: Bell, label: "Med Reminders" },
  { path: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="logo-wrap">
        <div className="logo-name">HealthAI</div>
        <div className="logo-tag">Smart Healthcare</div>
      </div>

      <nav className="nav">
        {links.map(({ path, icon: Icon, label }) => (
          <div
            key={path}
            className={`nav-link ${location.pathname === path ? "active" : ""}`}
            onClick={() => navigate(path)}
          >
            <Icon size={17} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      <div className="user-strip">
        <div className="avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="uname">{user?.name}</div>
          <div className="urole">{user?.role}</div>
        </div>
        <button className="logout-btn" onClick={logout} title="Logout">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  );
}
