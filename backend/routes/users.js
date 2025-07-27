const express = require('express');
const { changeUserRole } = require('../controllers/authControllers');
const router = express.Router();


router.post("/changeRole",changeUserRole);

module.exports = router;