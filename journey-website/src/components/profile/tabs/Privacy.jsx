// src/components/profile/tabs/Privacy.jsx
import { useState } from "react";
import PropTypes from 'prop-types';
import { userService } from "../../../api/services/user/userService";

const Privacy = ({ settings, onUpdate }) => {
  const [formData, setFormData] = useState({
    isProfilePublic: settings?.isProfilePublic ?? true,
    showEmail: settings?.showEmail ?? false,
    showPhoneNumber: settings?.showPhoneNumber ?? false,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await userService.updatePrivacySettings(formData);
      // Only update the privacySettings portion of the profile
      onUpdate((prev) => ({
        ...prev,
        privacySettings: response.data.privacySettings,
      }));
    } catch (error) {
      console.error("Failed to update privacy settings:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Privacy Settings</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Profile Visibility
              </h4>
              <p className="text-sm text-gray-500">
                Make your profile visible to other users
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isProfilePublic}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isProfilePublic: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Show Email Address
              </h4>
              <p className="text-sm text-gray-500">
                Allow others to see your email address
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showEmail}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    showEmail: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Show Phone Number
              </h4>
              <p className="text-sm text-gray-500">
                Allow others to see your phone number
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.showPhoneNumber}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    showPhoneNumber: e.target.checked,
                  }))
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Saving..." : "Save Privacy Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};
Privacy.propTypes = {
  settings: PropTypes.shape({
    isProfilePublic: PropTypes.bool,
    showEmail: PropTypes.bool,
    showPhoneNumber: PropTypes.bool,
  }),
  onUpdate: PropTypes.func.isRequired,
};

export default Privacy;
