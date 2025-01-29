// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    // Basic Message Info
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    content: {
      type: String,
      required: true,
    },

    // Message Type and Media
    messageType: {
      type: String,
      enum: [
        "text",
        "media",
        "voice",
        "file",
        "location",
        "gif",
        "sticker",
        "poll",
      ],
      default: "text",
    },
    media: [
      {
        url: String,
        type: String,
        publicId: String, // for Cloudinary
        thumbnail: String,
        fileName: String,
        fileSize: Number,
        duration: Number, // for voice/video
        mimeType: String,
        dimensions: {
          width: Number,
          height: Number,
        },
      },
    ],

    // Message Status and Delivery
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    readBy: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: Date,
      },
    ],
    deliveredTo: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        deliveredAt: Date,
      },
    ],

    // Interactions
    reactions: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        emoji: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    isStarred: { type: Boolean, default: false },

    // Threading and Replies
    threadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    replies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
      },
    ],

    // Group Chat Features
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Group",
    },
    isPinned: { type: Boolean, default: false },
    pinnedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      pinnedAt: Date,
    },
    isAnnouncement: { type: Boolean, default: false },

    // Mentions and Tags
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mentionsEveryone: { type: Boolean, default: false },
    hashtags: [String],

    // Message Features
    isDisappearing: { type: Boolean, default: false },
    disappearAfter: Date,
    isEdited: { type: Boolean, default: false },
    editHistory: [
      {
        content: String,
        editedAt: { type: Date, default: Date.now },
      },
    ],
    scheduledFor: Date,

    // Search Optimization
    searchableContent: {
      type: String,
      index: true,
    },
    metadata: {
      language: String,
      keywords: [String],
    },

    // Link Preview
    linkPreview: {
      title: String,
      description: String,
      url: String,
      image: String,
    },

    // System Messages
    isSystemMessage: { type: Boolean, default: false },
    systemMessageType: {
      type: String,
      enum: [
        "member_joined",
        "member_left",
        "member_removed",
        "group_created",
        "group_settings_updated",
        "poll_created",
        "poll_ended",
      ],
    },

    // Channel specific
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
    },
    isChannelMessage: { type: Boolean, default: false },

    // Forward Info
    forwardedFrom: {
      messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      timestamp: Date,
    },
    privacyLevel: {
      type: String,
      enum: ["everyone", "contacts", "nobody"],
      default: "everyone"
    },
    isEncrypted: { 
      type: Boolean, 
      default: true 
    },
    encryptionMetadata: {
      algorithm: String,
      keyId: String,
      iv: String
    },
    visibleTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    hideFrom: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    archiveStatus: {
      isArchived: { 
        type: Boolean, 
        default: false 
      },
      archivedAt: Date,
      archivedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
      }
    },
    userSettings: {
      theme: {
        color: String,
        background: String
      },
      nicknames: {
        [userId: string]: String // Store nicknames for participants
      },
      autoReplyInfo: {
        isAutoReply: Boolean,
        triggerType: String
      }
    },
    aiMetadata: {
      isSuggestedReply: Boolean,
      confidence: Number,
      translatedFrom: String,
      translatedText: String
    }
  },
  {
    timestamps: true,
  }
);

// Indexes
messageSchema.index({
  content: "text",
  searchableContent: "text",
  "linkPreview.title": "text",
  "linkPreview.description": "text",
});

messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ groupId: 1, createdAt: -1 });
messageSchema.index({ channelId: 1, createdAt: -1 });
// Add new privacy-related indexes
messageSchema.index({ privacyLevel: 1 });
messageSchema.index({ isEncrypted: 1 });
messageSchema.index({ archiveStatus.isArchived: 1 });
messageSchema.index({ visibleTo: 1 });
messageSchema.index({ hideFrom: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
