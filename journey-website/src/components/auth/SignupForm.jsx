// src/components/auth/SignupForm.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../api/services/auth/authService";
import { validateFormField } from "../../utils/validation";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const SignupForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;
  const newFormData = {
    ...formData,
    [name]: value,
  };
  setFormData(newFormData);

  // Validate field
  const error = validateFormField(name, value, newFormData);
  setErrors((prev) => ({
    ...prev,
    [name]: error
  }));

  // Additional validation for confirmPassword when password changes
  if (name === "password" && newFormData.confirmPassword) {
    const confirmError = validateFormField("confirmPassword", newFormData.confirmPassword, newFormData);
    setErrors((prev) => ({
      ...prev,
      confirmPassword: confirmError
    }));
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords must match",
      }));
      setLoading(false);
      return;
    }

    try {
      await authService.signup(formData);
      navigate("/dashboard", { state: { email: formData.email } });
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message || "Signup failed",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
          />
          {errors.username && (
            <p className="text-red-500 text-sm mt-1">{errors.username}</p>
          )}
        </div>
        <div className="mb-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </button>
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password}</p>
          )}
        </div>
        <div className="mb-4 relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2"
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
        {errors.submit && (
          <p className="text-red-500 text-sm mt-2">{errors.submit}</p>
        )}
      </form>
      <div className="mt-4 text-center">
        <Link to="/auth/login" className="text-blue-500 hover:text-blue-600">
          Already have an account?
        </Link>
      </div>
    </div>
  );
};

export default SignupForm;
