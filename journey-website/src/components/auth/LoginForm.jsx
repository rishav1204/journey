// src/components/auth/LoginForm.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/services/auth/authService";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login(formData);
      localStorage.setItem("user", JSON.stringify(response.user));
      navigate("/");
    } catch (error) {
      setError(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    setForgotPasswordLoading(true);
    setError("");

    try {
      await authService.forgotPassword(formData.email);
      // Navigate to OTP verification with email and reset password flow
      navigate("/auth/verify-otp", {
        state: {
          email: formData.email,
          flow: "reset-password",
        },
      });
    } catch (err) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
            required
          />
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={handleForgotPassword}
          disabled={forgotPasswordLoading}
          className="w-full mt-2 text-blue-500 hover:text-blue-600 disabled:text-blue-300"
        >
          {forgotPasswordLoading ? "Sending reset code..." : "Forgot Password?"}
        </button>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
      <div className="mt-4 text-center">
        <a href="/auth/signup" className="text-blue-500 hover:text-blue-600">
          Dont have an account? Sign Up
        </a>
      </div>
    </div>
  );
};

export default LoginForm;
