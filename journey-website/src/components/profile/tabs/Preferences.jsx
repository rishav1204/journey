// src/components/profile/tabs/Preferences.jsx
import { useState } from "react";
import PropTypes from 'prop-types';
import { userService } from "../../../api/services/user/userService";

const Preferences = ({ preferences, onUpdate }) => {
  const [formData, setFormData] = useState({
    travelStyle: preferences?.travelStyle || "",
    transportation: preferences?.transportation || "",
    accommodation: preferences?.accommodation || "",
    budget: preferences?.budget || "",
    interests: preferences?.interests || [],
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedPreferences = await userService.updatePreferences(formData);
      onUpdate((prev) => ({
        ...prev,
        preferences: updatedPreferences.data.preferences,
        travelStyle: updatedPreferences.data.travelStyle,
      }));
    } catch (error) {
      console.error("Failed to update preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const interests = [
    "Adventure",
    "Culture",
    "Food",
    "Nature",
    "Relaxation",
    "Shopping",
    "Sightseeing",
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">Travel Preferences</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Travel Style
          </label>
          <select
            value={formData.travelStyle}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                travelStyle: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select travel style</option>
            <option value="luxury">Luxury</option>
            <option value="budget">Budget</option>
            <option value="backpacker">Backpacker</option>
            <option value="family">Family</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Transportation
          </label>
          <select
            value={formData.transportation}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                transportation: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select transportation</option>
            <option value="car">Car</option>
            <option value="public">Public Transport</option>
            <option value="walking">Walking</option>
            <option value="bike">Bike</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Interests
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {interests.map((interest) => (
              <label key={interest} className="inline-flex items-center">
                <input
                  type="checkbox"
                  checked={formData.interests.includes(interest)}
                  onChange={(e) => {
                    const newInterests = e.target.checked
                      ? [...formData.interests, interest]
                      : formData.interests.filter((i) => i !== interest);
                    setFormData((prev) => ({
                      ...prev,
                      interests: newInterests,
                    }));
                  }}
                  className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
                />
                <span className="ml-2">{interest}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
          >
            {loading ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      </form>
    </div>
  );
};
Preferences.propTypes = {
  preferences: PropTypes.shape({
    travelStyle: PropTypes.string,
    transportation: PropTypes.string,
    accommodation: PropTypes.string,
    budget: PropTypes.string,
    interests: PropTypes.arrayOf(PropTypes.string)
  }),
  onUpdate: PropTypes.func.isRequired
};

export default Preferences;
