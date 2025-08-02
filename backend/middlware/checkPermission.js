const Role = require('../model/Role');

const checkPermission = (permissionName) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "No user  found in request. Ensure userMiddleware is used.",
        });
      }

      const hasPermission = user.permissions.some((perm) => perm.name === permissionName)
      if (!hasPermission) {
        return res.status(403).json({
          success: false,
          message: 'Permission denied',
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
