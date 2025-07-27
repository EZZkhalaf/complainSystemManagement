const express = require('express');
const { changeUserRole } = require('../controllers/authControllers');
const { userMiddleware } = require('../middlware/userMiddlware');
const router = express.Router();


router.post("/changeRole" , userMiddleware,changeUserRole);

module.exports = router;