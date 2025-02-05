// src/App.jsx
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import SignupForm from "./components/auth/SignupForm";
import LoginForm from "./components/auth/LoginForm";
import OtpVerification from "./components/auth/OtpVerification";
import ResetPassword from "./components/auth/ResetPassword";
import Profile from "./pages/profile/Profile";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/signup" element={<SignupForm />} />
        <Route path="/auth/login" element={<LoginForm />} />
        <Route path="/auth/verify-otp" element={<OtpVerification />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
