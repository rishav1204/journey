// src/components/profile/tabs/Following.jsx
import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { userService } from "../../../api/services/user/userService";

const Following = () => {
  const [activeTab, setActiveTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [followersData, followingData] = await Promise.all([
          userService.getFollowers(),
          userService.getFollowing(),
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  }

  const UserList = ({ users }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <img
            src={user.profilePicture || "/default-avatar.png"}
            alt={user.username}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="ml-4">
            <h4 className="font-semibold">{user.username}</h4>
            {user.bio && (
              <p className="text-sm text-gray-500 truncate">{user.bio}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  UserList.propTypes = {
    users: PropTypes.arrayOf(
      PropTypes.shape({
        _id: PropTypes.string.isRequired,
        username: PropTypes.string.isRequired,
        profilePicture: PropTypes.string,
        bio: PropTypes.string
      })
    ).isRequired
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("followers")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "followers"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600"
          }`}
        >
          Followers ({followers.length})
        </button>
        <button
          onClick={() => setActiveTab("following")}
          className={`px-4 py-2 rounded-md ${
            activeTab === "following"
              ? "bg-blue-500 text-white"
              : "bg-white text-gray-600"
          }`}
        >
          Following ({following.length})
        </button>
      </div>

      {activeTab === "followers" ? (
        followers.length > 0 ? (
          <UserList users={followers} />
        ) : (
          <p className="text-center text-gray-500">No followers yet</p>
        )
      ) : following.length > 0 ? (
        <UserList users={following} />
      ) : (
        <p className="text-center text-gray-500">Not following anyone yet</p>
      )}
    </div>
  );
};

export default Following;
