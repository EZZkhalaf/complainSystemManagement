const Role = require('../model/Role');

const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?._id;
        console.log("testing")
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "No user ID found in request. Ensure userMiddleware is used.",
        });
      }

      const roleDoc = await Role.findOne({ user: userId });

      if (!roleDoc || !roleDoc.permissions?.[permissionName]) {
        return res.status(403).json({
          success: false,
          message: "Permission denied",
        });
      }

      next();
    } catch (err) {
      console.error("Permission check error:", err);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  };
};

module.exports = checkPermission;
