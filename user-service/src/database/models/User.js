import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true, required: true },
  phoneNumber: String,
  profilePicture: String,
  bio: String,
  location: String,

  // Social Media Links
  socialMediaLinks: [
    { platform: String, url: String }, // e.g., { platform: "Facebook", url: "https://facebook.com/user" }
  ],

  // Authentication and Security
  passwordHash: {
    type: String,
    required: true,
    minlength: 6,
    match: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/,
    select: false,
  },
  authProvider: {
    type: String,
    enum: ["Email", "Google", "Facebook"],
    default: "Email",
  },
  isVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  accountStatus: {
    type: String,
    enum: ["Active", "Deactivated", "Banned"],
    default: "Active",
  },
  lastActive: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String, // Encrypted TOTP secret for 2FA

  // Travel Preferences
  travelStyle: String,
  preferences: {
    transportation: String,
    budget: String,
    accommodation: String,
    activityType: String,
  },

  // Posts and Reels
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  savedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reel" }],
  postedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  postedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reel" }],

  // Reviews and Ratings
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rating" }],

  // Social connections
  followers: [{ type: String }],
  following: [{ type: String }],

  // Notifications and Settings
  pushNotificationsEnabled: { type: Boolean, default: true },
  emailNotificationsEnabled: { type: Boolean, default: true },
  darkMode: { type: Boolean, default: false },
  language: { type: String, default: "en" },

  // Subscription Reference (minimal data)
  subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: "Subscription" }, // Points to subscription-service
  subscriptionStatus: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Inactive",
  },

  // Booking and Trips
  bookingHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
  upcomingTrips: [{ type: mongoose.Schema.Types.ObjectId, ref: "Trip" }],

  // Device Information (for login tracking)
  devices: [
    {
      deviceId: String,
      deviceType: String, // e.g., "Mobile", "Web"
      lastUsed: Date,
    },
  ],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
