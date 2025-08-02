const express = require('express');
const userMiddleware = require('../middlware/userMiddlware');
const { addNewRole, getRoles, addPermissions, fetchPermissions, addPermissionsToRole, getRoleById, deleteRole } = require('../controllers/rolesController');
const checkPermission = require('../middlware/checkPermission');
const router = express.Router();


router.post("/" , userMiddleware,checkPermission("manage_permissions") , addNewRole);
router.get("/" , userMiddleware , getRoles);
router.post("/addPermissions"  ,userMiddleware,checkPermission("manage_permissions"), addPermissions);
router.get("/getPermissions"  , userMiddleware,checkPermission("manage_permissions"), fetchPermissions);
router.post("/addPermissionsToRole"  , userMiddleware,checkPermission("manage_permissions"), addPermissionsToRole);
router.get("/:id"  , userMiddleware, getRoleById);
router.delete("/:roleId"  , userMiddleware, checkPermission("manage_permissions"),deleteRole);



module.exports = router