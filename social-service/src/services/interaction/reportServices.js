import Report from "../../models/Report.js";
import User from "../../models/User.js";
import Post from "../../models/Post.js";
import Reel from "../../models/Reel.js";

export const reportUserService = async (
  userId,
  reportedBy,
  reason,
  description
) => {
  const session = await Report.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const report = await Report.create(
      [
        {
          reportedType: "USER",
          reportedId: userId,
          reportedBy,
          reason,
          description,
          status: "PENDING",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return report[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const reportPostService = async (
  postId,
  reportedBy,
  reason,
  description
) => {
  const session = await Report.startSession();
  session.startTransaction();

  try {
    const post = await Post.findById(postId);
    if (!post) {
      throw new Error("Post not found");
    }

    const report = await Report.create(
      [
        {
          reportedType: "POST",
          reportedId: postId,
          reportedBy,
          reason,
          description,
          status: "PENDING",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return report[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const reportReelService = async (
  reelId,
  reportedBy,
  reason,
  description
) => {
  const session = await Report.startSession();
  session.startTransaction();

  try {
    const reel = await Reel.findById(reelId);
    if (!reel) {
      throw new Error("Reel not found");
    }

    const report = await Report.create(
      [
        {
          reportedType: "REEL",
          reportedId: reelId,
          reportedBy,
          reason,
          description,
          status: "PENDING",
        },
      ],
      { session }
    );

    await session.commitTransaction();
    return report[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const getReportsService = async (type, status) => {
  try {
    const query = {};

    // Fix: Change contentType to reportedType in query
    if (type) {
      query.reportedType = type.toUpperCase(); // Reports use uppercase type (USER, POST, REEL)
    }

    if (status) {
      query.status = status.toUpperCase(); // Status should also be uppercase per schema
    }

    const reports = await Report.find(query)
      .populate("reportedBy", "username email lastActive")
      .lean();

    return reports;
  } catch (error) {
    throw error;
  }
};

