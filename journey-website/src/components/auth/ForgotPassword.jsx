// src/components/auth/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../../api/services/auth/authService";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await authService.forgotPassword(email);
      navigate("/auth/reset-password", { state: { email } });
    } catch (err) {
      setError(err.message || "Failed to send reset code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Reset Password</h2>
      <p className="text-gray-600 mb-4 text-center">
        Enter your email address and we will send you a code to reset your
        password
      </p>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Sending..." : "Send Reset Code"}
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default ForgotPassword;
