// src/pages/profile/Profile.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../api/services/user/userService";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import PersonalInfo from "../../components/profile/tabs/PersonalInfo";
import Preferences from "../../components/profile/tabs/Preferences";
import Privacy from "../../components/profile/tabs/Privacy";
import Following from "../../components/profile/tabs/Following";
import Settings from "../../components/profile/tabs/Settings";
import Navbar from "../../components/layout/Navbar";

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getProfile();
        setProfile(data);
      } catch (error) {
        setError(error.message);
        if (error.response?.status === 401) {
          navigate("/auth/login");
        }
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleProfileUpdate = async (updatedProfile) => {
    setUpdateLoading(true);
    try {
      let newProfile;
      if (typeof updatedProfile === "function") {
        newProfile = updatedProfile(profile);
      } else {
        newProfile = {
          ...profile,
          ...updatedProfile,
          preferences: {
            ...profile?.preferences,
            ...(updatedProfile?.preferences || {}),
          },
          privacySettings: {
            ...profile?.privacySettings,
            ...(updatedProfile?.privacySettings || {}),
          },
        };
      }
      setProfile(newProfile);
    } catch (error) {
      console.error("Profile update failed:", error);
      setError("Failed to update profile");
    } finally {
      setUpdateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 pt-16">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <ProfileHeader
            profile={profile}
            onUploadImage={async (formData) => {
              try {
                const result = await userService.uploadProfilePicture(formData);
                handleProfileUpdate({
                  profilePicture: result.data.profilePicture,
                });
              } catch (error) {
                console.error("Upload failed:", error);
                throw new Error(
                  error.message || "Failed to upload profile picture"
                );
              }
            }}
          />

          <ProfileTabs defaultTab="info">
            <div value="info" label="Personal Information">
              <PersonalInfo
                profile={profile}
                onUpdate={handleProfileUpdate}
                loading={updateLoading}
              />
            </div>
            <div value="preferences" label="Preferences">
              <Preferences
                preferences={profile?.preferences}
                travelStyle={profile?.travelStyle}
                onUpdate={handleProfileUpdate}
                loading={updateLoading}
              />
            </div>
            <div value="privacy" label="Privacy">
              <Privacy
                settings={profile?.privacySettings}
                onUpdate={handleProfileUpdate}
                loading={updateLoading}
              />
            </div>
            <div value="following" label="Following">
              <Following />
            </div>
            <div value="settings" label="Settings">
              <Settings onUpdate={handleProfileUpdate} />
            </div>
          </ProfileTabs>
        </div>
      </div>
    </>
  );
};

export default Profile;
