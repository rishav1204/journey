// src/components/layout/Navbar.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../common/Logo";
import Button from "../common/Button";
import { IoNotificationsOutline } from "react-icons/io5";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  // Check authentication status on component mount and when token changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!token && !!user);
    };

    checkAuth();
    // Add event listener for storage changes
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, []);

  const notifications = [
    {
      id: 1,
      message: "Welcome to Journey!",
      time: "2 hours ago",
      read: false,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/auth/login");
  };

  return (
    <nav className="bg-white shadow-md fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <Logo />
            </Link>
          </div>

          {/* Right Side Navigation */}
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <>
                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 rounded-full hover:bg-gray-100 focus:outline-none relative"
                    aria-label="Notifications"
                  >
                    <IoNotificationsOutline className="h-6 w-6 text-gray-600" />
                    {notifications.some((n) => !n.read) && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <div className="px-4 py-2 border-b">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 cursor-pointer ${
                                !notification.read ? "bg-blue-50" : ""
                              }`}
                            >
                              <p className="text-sm text-gray-800">
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {notification.time}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-sm text-gray-500">
                            No new notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile */}
                <div className="relative">
                  <Link to="/profile">
                    <img
                      className="h-8 w-8 rounded-full border-2 border-gray-200"
                      src="/default-avatar.png"
                      alt="Profile"
                    />
                  </Link>
                </div>
                <Button onClick={handleLogout} variant="outlined">
                  Logout
                </Button>
              </>
            ) : (
              <Button
                onClick={() => navigate("/auth/login")}
                variant="contained"
              >
                Login / Sign Up
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
