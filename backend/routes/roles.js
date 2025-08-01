const express = require('express');
const userMiddleware = require('../middlware/userMiddlware');
const { addNewRole, getRoles, addPermissions, fetchPermissions, addPermissionsToRole, getRoleById } = require('../controllers/rolesController');
const router = express.Router();


router.post("/" , userMiddleware , addNewRole);
router.get("/" , userMiddleware , getRoles);
router.post("/addPermissions"  , addPermissions);
router.get("/getPermissions"  , userMiddleware, fetchPermissions);
router.post("/addPermissionsToRole"  , userMiddleware, addPermissionsToRole);
router.get("/:id"  , userMiddleware, getRoleById);


module.exports = router