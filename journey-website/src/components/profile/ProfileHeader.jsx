// src/components/profile/ProfileHeader.jsx
import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { FaCamera } from "react-icons/fa";

const ProfileHeader = ({ profile, onUploadImage }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Please select a valid image file (JPEG, PNG, or WEBP)");
    }

    if (file.size > maxSize) {
      throw new Error("File size should be less than 5MB");
    }
  }, []);

  const handleImageUpload = async (e) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;

      // Clear previous errors
      setError(null);

      // Validate file
      validateFile(file);

      // Show upload state
      setUploading(true);

      // Prepare form data
      const formData = new FormData();
      formData.append("profilePic", file);

      // Upload image
      await onUploadImage(formData);

      // Reset file input
      e.target.value = "";
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Default values with null checks
  const profileData = {
    username: profile?.username || "User",
    email: profile?.email || "",
    bio: profile?.bio || "",
    profilePicture: profile?.profilePicture || "/default-avatar.png",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            ×
          </button>
        </div>
      )}

      <div className="flex items-center space-x-6">
        <div className="relative group">
          <img
            src={profileData.profilePicture}
            alt={`${profileData.username}'s profile`}
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-200"
          />

          <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-all transform group-hover:scale-110 shadow-lg">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent" />
            ) : (
              <FaCamera className="w-4 h-4 text-white" />
            )}
          </label>

          {/* Upload overlay */}
          <div
            className={`absolute inset-0 rounded-full flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-200 ${
              uploading ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <span className="text-white text-sm">
              {uploading ? "Uploading..." : "Change Photo"}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{profileData.username}</h1>
              <p className="text-gray-600">{profileData.email}</p>
            </div>
          </div>

          {profileData.bio && (
            <p className="mt-2 text-gray-700 line-clamp-2">{profileData.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
};

ProfileHeader.propTypes = {
  profile: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    bio: PropTypes.string,
    profilePicture: PropTypes.string,
  }),
  onUploadImage: PropTypes.func.isRequired,
};

export default ProfileHeader;
