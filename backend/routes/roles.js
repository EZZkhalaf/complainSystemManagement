const express = require('express');
const userMiddleware = require('../middlware/userMiddlware');
const { addNewRole, getRoles } = require('../controllers/rolesController');
const router = express.Router();


router.post("/" , userMiddleware , addNewRole);
router.get("/" , userMiddleware , getRoles);

module.exports = router