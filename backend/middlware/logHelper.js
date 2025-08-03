const Logs = require("../model/Logs");

const logAction = async (user, actionType, resource, resourceId, message) => {
  try {
    await Logs.create({
      user: user._id,
      action: actionType,
      resource,
      resourceId,
      message,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("Logging failed:", err.message);
  }
};

module.exports = { logAction };
