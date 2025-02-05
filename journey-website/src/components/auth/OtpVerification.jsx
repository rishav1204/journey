// src/components/auth/OtpVerification.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../api/services/auth/authService";

const OtpVerification = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email;
  const flow = location.state?.flow;

  useEffect(() => {
    if (!email) {
      navigate("/auth/login");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Move to next input
    if (element.value && index < 5) {
      const nextInput = document.querySelector(`input[name=otp-${index + 1}]`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.querySelector(`input[name=otp-${index - 1}]`);
      prevInput?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const otpString = otp.join("");
      await authService.verifyOtp({ email, otp: otpString });

      if (flow === "reset-password") {
        navigate("/auth/reset-password", { state: { email } });
      } else {
        navigate("/auth/login", {
          state: { message: "Email verified successfully. Please login." },
        });
      }
    } catch (err) {
      setError(err.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setLoading(true);
    setError("");
    try {
      await authService.forgotPassword(email);
      setTimeLeft(180);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    } catch (err) {
      setError(err.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">OTP Verification</h2>
      <p className="text-gray-600 mb-4 text-center">
        Enter the 6-digit code sent to {email}
      </p>
      <form onSubmit={handleSubmit}>
        <div className="flex justify-between mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              type="text"
              name={`otp-${index}`}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              className="w-12 h-12 text-center text-xl border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          ))}
        </div>
        <div className="text-center mb-4">
          <span className={`text-${timeLeft ? "blue" : "red"}-500`}>
            {formatTime(timeLeft)}
          </span>
        </div>
        <button
          type="submit"
          disabled={loading || otp.some((digit) => !digit)}
          className="w-full mb-3 bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? "Verifying..." : "Verify OTP"}
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend || loading}
          className="w-full bg-gray-100 text-gray-700 p-2 rounded hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400"
        >
          Resend OTP
        </button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </form>
    </div>
  );
};

export default OtpVerification;
