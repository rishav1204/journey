// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";
import OtpVerification from "./components/auth/OtpVerification";
import ForgotPassword from "./components/auth/ForgotPassword";
import ResetPassword from "./components/auth/ResetPassword";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <main className="container mx-auto py-8">
          <Routes>
            <Route path="/auth/signup" element={<SignupForm />} />
            <Route path="/auth/login" element={<LoginForm />} />
            <Route path="/auth/verify-otp" element={<OtpVerification />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/dashboard" element={<div>Dashboard</div>} />
            <Route path="/" element={<LoginForm />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
