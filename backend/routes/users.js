const express = require('express');
const { changeUserRole, fetchUsers } = require('../controllers/authControllers');
const { userMiddleware } = require('../middlware/userMiddlware');
const { addUserToGroup } = require('../controllers/groupsControllers');
const router = express.Router();


router.post("/changeRole" , userMiddleware,changeUserRole);
router.get("/" , userMiddleware,fetchUsers);
router.post("/add" , addUserToGroup);
module.exports = router;