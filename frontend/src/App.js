import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import DoctorsPage from "./pages/DoctorsPage";
import SymptomChecker from "./pages/SymptomChecker";
import AppointmentsPage from "./pages/AppointmentsPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import PrescriptionPage from "./pages/PrescriptionPage";
import HealthTimeline from "./pages/HealthTimeline";
import MedicineReminder from "./pages/MedicineReminder";


const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "#0a0f1e", color: "#00d4aa", fontSize: "1.2rem" }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/doctors" element={<PrivateRoute><DoctorsPage /></PrivateRoute>} />
      <Route path="/symptom-checker" element={<PrivateRoute><SymptomChecker /></PrivateRoute>} />
      <Route path="/appointments" element={<PrivateRoute><AppointmentsPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/chat/:appointmentId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
      <Route path="/prescription/:appointmentId" element={<PrivateRoute><PrescriptionPage /></PrivateRoute>} />
      <Route path="/timeline" element={<PrivateRoute><HealthTimeline /></PrivateRoute>} />
      <Route path="/medicine-reminder" element={<PrivateRoute><MedicineReminder /></PrivateRoute>} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}
