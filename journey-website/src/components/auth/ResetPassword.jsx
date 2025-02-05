// src/components/auth/ResetPassword.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/services/auth/authService";
import { validateFormField } from "../../utils/validation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.email) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email,
      }));
    } else {
      navigate("/auth/forgot-password");
    }
  }, [location.state, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: validateFormField(name, value, { ...formData, [name]: value }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords must match",
      }));
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: formData.email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      navigate("/auth/login", {
        state: {
          message:
            "Password reset successful. Please login with your new password.",
        },
      });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Failed to reset password",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Set New Password</h2>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="email" value={formData.email} />
        <div className="mb-4 relative">
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            placeholder="New Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showNewPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm New Password"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
            required
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showConfirmPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
          {errors.confirmPassword && (
            <p className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
        {errors.submit && (
          <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;