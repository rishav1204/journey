// src/components/profile/tabs/Settings.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../api/services/user/userService";

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleDeactivate = async () => {
    if (
      window.confirm(
        "Are you sure you want to deactivate your account? This can be reactivated later."
      )
    ) {
      setLoading(true);
      try {
        await userService.deactivateAccount();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      setLoading(true);
      try {
        await userService.deleteAccount();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/auth/login");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/auth/login");
  };

  return (
    <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
      {/* Account Settings Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">Account Settings</h3>
        <div className="mt-4 space-y-4">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Email Notifications
              </h4>
              <p className="text-sm text-gray-500">
                Receive email notifications about your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Two-Factor Authentication
              </h4>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
        <div className="mt-4 space-y-4">
          <div className="flex flex-col space-y-2">
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className="px-4 py-2 text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 disabled:opacity-50"
            >
              Deactivate Account
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 disabled:opacity-50"
            >
              Delete Account Permanently
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Settings;
