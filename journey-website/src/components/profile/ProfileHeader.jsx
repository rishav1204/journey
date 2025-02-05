// src/components/profile/ProfileHeader.jsx
import { useState } from "react";
import PropTypes from "prop-types";

const ProfileHeader = ({ profile, onUploadImage }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePic", file);
      try {
        await onUploadImage(formData);
      } catch (error) {
        console.error("Upload failed:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  // Add null checks for profile data
  const profileData = {
    username: profile?.username || "User",
    email: profile?.email || "",
    bio: profile?.bio || "",
    profilePicture: profile?.profilePicture || "/default-avatar.png",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center space-x-6">
        <div className="relative">
          <img
            src={profileData.profilePicture}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover"
          />
          <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading}
            />
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </label>
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          )}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{profileData.username}</h1>
          <p className="text-gray-600">{profileData.email}</p>
          {profileData.bio && (
            <p className="mt-2 text-gray-700">{profileData.bio}</p>
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
  }).isRequired,
  onUploadImage: PropTypes.func.isRequired,
};

export default ProfileHeader;
