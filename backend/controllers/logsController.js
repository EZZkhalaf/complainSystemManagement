

const Logs = require('../model/Logs');

const getLogs = async (req, res) => {
  try {
    const { page, logsPerPage } = req.body; // default values if not passed

    const skip = (page - 1) * logsPerPage;

    // Get logs with pagination
    const logs = await Logs.find()
        .populate('user')
      .sort({ timestamp: -1 }) // latest first
      .skip(skip)
      .limit(logsPerPage);

    
    const totalLogs = await LogAction.countDocuments();

    res.status(200).json({
      success: true,
      data: logs,
      totalPages: Math.ceil(totalLogs / logsPerPage),
      currentPage: page,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {getLogs}