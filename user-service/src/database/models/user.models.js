import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phoneNumber: String,
  profilePicture: String,
  bio: String,
  location: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    },
  
    // Social Media Links
    socialMediaLinks: {
        facebook: String,
        twitter: String,
        instagram: String
    },

  // Authentication and Security
  passwordHash: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  authProvider: String,
  isVerified: { type: Boolean, default: false },
  loginAttempts: { type: Number, default: 0 },
  
  // Travel Preferences
  travelStyle: String,
  preferences: {
    transportation: String,
    budget: String,
    accommodation: String,
    activityType: String,
  },

  // Saved posts/reels (Links to posts and reels saved by the user)
  savedPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  savedReels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Reel" }],

  // Posted posts/reels (Links to posts and reels created by the user)
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

    // Payment and Billing
    paymentMethod: String,
    billingAddress: {
      street: String,
      city: String,
        state: String,
        country: String,
        postalCode: String
    },
    billingHistory: [
      {
        transactionId: String,
        amount: Number,
            date: Date,
        paymentMethod: String,
      },
    ],

  // Subscription info
    subscriptionType: { type: String, enum: ["Free", "Premium"] },
    subscriptionEndDate: Date,
    subscriptionStartDate: Date,
    subscriptionRenewalDate: Date,
    subscriptionStatus: { type: String, enum: ["Active", "Inactive"] },
    subscriptionPlan: { type: String, enum: ["Monthly", "Yearly"] },
    subscriptionPaymentMethod: String,
    subscriptionPaymentStatus: { type: String, enum: ["Paid", "Unpaid"] },
    subscriptionPaymentDate: Date,
    subscriptionPaymentAmount: Number,
    subscriptionPaymentCurrency: String,
    subscriptionPaymentTransactionId: String,
    subscriptionPaymentTransactionStatus: {
      type: String,
      enum: ["Completed", "Failed", "Pending"],
    },

  // References to bookings and trips
  bookingHistory: [
    {
          bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
          tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
          tripName: String,
          tripDuration: Number,
          tripPrice: Number,
          tripCurrency: String,
          tripStartDate: Date,
          tripEndDate: Date,
        tripStatus: {
            type: String,
            enum: ["Confirmed", "Pending", "Canceled"],
          },
          bookingDate: { type: Date, required: true },
          bookingStatus: {
            type: String,
            enum: ["Confirmed", "Pending", "Canceled"],
          },
          bookingAmount: Number,
          bookingCurrency: String,
          bookingPaymentMethod: String,
          bookingPaymentStatus: {
            type: String,
            enum: ["Paid", "Unpaid"],
          },
          bookingPaymentDate: Date,
          bookingPaymentAmount: Number,
          bookingPaymentCurrency: String,
          bookingPaymentTransactionId: String,
          bookingPaymentTransactionStatus: {
            type: String,
            enum: ["Completed", "Failed", "Pending"],
          },
          bookingPaymentTransactionDate: Date,
          bookingPaymentTransactionAmount: Number,
          bookingPaymentTransactionCurrency: String,
          bookingPaymentTransactionId: String,
          bookingPaymentTransactionStatus: {
            type: String
          },
          },
  ],

  // Other fields for the user's trips, etc.
  upcomingTrips: [
    {
      tripId: String,
      destination: String,
      startDate: Date,
          endDate: Date,
          duration: Number,
          price: Number,
          currency: String,
        },
  ],
});

const User = mongoose.model("User", userSchema);

export default User;
