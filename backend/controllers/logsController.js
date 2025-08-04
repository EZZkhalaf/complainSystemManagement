

const { logAction } = require('../middlware/logHelper');
const Logs = require('../model/Logs');

const getLogs = async (req, res) => {
  try {
    const { page, logsPerPage  , action , user, resource } = req.body; 

    const filters = {}
    if (action) filters.action = action;
    if (resource) filters.resource = resource;

  
    let logs = await Logs.find(filters)
      .populate('user' , "name")
      .sort({ timestamp: -1 }) // latest first
      

      if(user){
        const regex = new RegExp(user,'i');
        logs = logs.filter((log) => regex.test(log.user?.name))
      }

    
    const totalLogs = logs.length;

    const skip = (page - 1) * logsPerPage;

    const paginatedLogs = logs.slice(skip,skip + Number(logsPerPage))

    res.status(200).json({
      success: true,
      data: paginatedLogs,
      totalPages: Math.ceil(totalLogs / logsPerPage),
      currentPage: Number(page),
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {getLogs}