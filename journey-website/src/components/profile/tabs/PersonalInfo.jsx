// src/components/profile/tabs/PersonalInfo.jsx
import { useState } from "react";
import PropTypes from 'prop-types';
import { userService } from "../../../api/services/user/userService";

const PersonalInfo = ({ profile, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username || "",
    bio: profile.bio || "",
    location: profile.location || "",
    phone: profile.phone || "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedProfile = await userService.updateProfile(formData);
      // Pass the entire updated profile
      onUpdate((prev) => ({
        ...prev,
        ...updatedProfile.data,
      }));
      setEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      {editing ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bio: e.target.value }))
                }
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    location: e.target.value,
                  }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, phone: e.target.value }))
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Personal Information</h3>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500">Username</p>
                <p className="mt-1">{profile.username}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Bio</p>
                <p className="mt-1">{profile.bio || "No bio added yet"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1">{profile.location || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="mt-1">{profile.phone || "Not specified"}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="px-4 py-2 text-blue-500 border border-blue-500 rounded-md hover:bg-blue-50"
          >
            Edit Profile
          </button>
        </div>
      )}
    </div>
  );
};
PersonalInfo.propTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string,
    bio: PropTypes.string,
    location: PropTypes.string,
    phone: PropTypes.string
  }).isRequired,
  onUpdate: PropTypes.func.isRequired
};

export default PersonalInfo;
