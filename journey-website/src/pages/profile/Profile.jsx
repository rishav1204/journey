// src/pages/profile/Profile.jsx
import { useState, useEffect } from "react";
import { userService } from "../../api/services/user/userService";
import ProfileHeader from "../../components/profile/ProfileHeader";
import ProfileTabs from "../../components/profile/ProfileTabs";
import { useNavigate } from "react-router-dom";
import PersonalInfo from "../../components/profile/tabs/PersonalInfo";
import Preferences from "../../components/profile/tabs/Preferences";
import Privacy from "../../components/profile/tabs/Privacy";
import Following from "../../components/profile/tabs/Following";
import Settings from "../../components/profile/tabs/Settings";


const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  const handleProfileUpdate = (updatedProfile) => {
    setProfile((prev) => {
      if (typeof updatedProfile === "function") {
        return updatedProfile(prev);
      }
      // Ensure we maintain all existing profile data
      return {
        ...prev,
        ...updatedProfile,
        // Preserve nested objects that might be undefined in updatedProfile
        preferences: {
          ...prev?.preferences,
          ...(updatedProfile?.preferences || {}),
        },
        privacySettings: {
          ...prev?.privacySettings,
          ...(updatedProfile?.privacySettings || {}),
        },
      };
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <ProfileHeader
          profile={profile}
          onUploadImage={async (formData) => {
            try {
              const result = await userService.uploadProfilePicture(formData);
              handleProfileUpdate({
                ...profile,
                profilePicture: result.data.profilePicture,
              });
            } catch (error) {
              console.error("Upload failed:", error);
            }
          }}
        />

        <ProfileTabs defaultTab="info">
          <div value="info" label="Personal Information">
            <PersonalInfo profile={profile} onUpdate={handleProfileUpdate} />
          </div>
          <div value="preferences" label="Preferences">
            <Preferences
              preferences={profile?.preferences}
              travelStyle={profile?.travelStyle}
              onUpdate={handleProfileUpdate}
            />
          </div>
          <div value="privacy" label="Privacy">
            <Privacy settings={profile.privacySettings} onUpdate={setProfile} />
          </div>
          <div value="following" label="Following">
            <Following />
          </div>
          <div value="settings" label="Settings">
            <Settings />
          </div>
        </ProfileTabs>
      </div>
    </div>
  );
};

export default Profile;
