import {
  reportUserService,
  reportPostService,
  reportReelService,
  getReportsService,
} from "../../services/interaction/reportServices.js";

export const reportUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const reportedBy = req.user.id;
    const { reason, description } = req.body;

    const result = await reportUserService(
      userId,
      reportedBy,
      reason,
      description
    );

    res.status(200).json({
      success: true,
      message: "User reported successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting user",
      error: error.message,
    });
  }
  
};

export const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const reportedBy = req.user.id;
    const { reason, description } = req.body;

    const result = await reportPostService(
      postId,
      reportedBy,
      reason,
      description
    );

    res.status(200).json({
      success: true,
      message: "Post reported successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting post",
      error: error.message,
    });
  }
};

export const reportReel = async (req, res) => {
  try {
    const { reelId } = req.params;
    const reportedBy = req.user.id;
    const { reason, description } = req.body;

    const result = await reportReelService(
      reelId,
      reportedBy,
      reason,
      description
    );

    res.status(200).json({
      success: true,
      message: "Reel reported successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error reporting reel",
      error: error.message,
    });
  }
};

export const getReports = async (req, res) => {
  try {
    const { type, status } = req.query;
    const reports = await getReportsService(type, status);

    res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching reports",
      error: error.message,
    });
  }
};
