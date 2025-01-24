import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  dob: Date,
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  address: String,
  email: { type: String, unique: true, required: true },
  phoneNumber: String,
  profilePicture: String,
  bio: String,
  location: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  // Social Media Links
  socialMediaLinks: [
    { platform: String, url: String }, // e.g., { platform: "Facebook", url: "https://facebook.com/user" }
  ],

  // Authentication and Security
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false, // This ensures the password is not included in queries
  },
  socialAuth: {
    google: {
      id: { type: String, sparse: true },
      email: String,
      picture: String,
      accessToken: String,
      refreshToken: String,
      tokenExpiryDate: Date,
    },
    facebook: {
      id: { type: String, sparse: true },
      email: String,
      picture: String,
      accessToken: String,
      refreshToken: String,
      tokenExpiryDate: Date,
    },
  },

  // Update the authProvider field to include more details
  authProvider: {
    type: [
      {
        provider: {
          type: String,
          enum: ["email", "google", "facebook"],
          required: true,
        },
        isConnected: {
          type: Boolean,
          default: true,
        },
        lastLogin: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    default: [{ provider: "email" }],
  },
  socialVerification: {
  google: { type: Boolean, default: false },
  facebook: { type: Boolean, default: false }
},
  avatar: {
    type: String,
  },
  isVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  accountStatus: {
    type: String,
    enum: ["Active", "Deactivated", "Banned"],
    default: "Active",
  },
  deactivationReason: String,
  deactivatedAt: Date,
  lastActive: { type: Date, default: Date.now, select: true },
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

  // Add this section under Authentication and Security or create a new Privacy Settings section
  privacySettings: {
    isProfilePublic: { type: Boolean, default: true },
    showEmail: { type: Boolean, default: false },
    showPhoneNumber: { type: Boolean, default: false },
  },

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

  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lastFailedLogin: {
    type: Date,
  },
  lockUntil: {
    type: Date,
  },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

export default User;
