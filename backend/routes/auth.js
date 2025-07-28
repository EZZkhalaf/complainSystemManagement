const express = require('express');
const {register , login, verifyEmail} = require("../controllers/authControllers.js");
const router = express.Router();




router.post('/register',register)
router.get('/verify-email', verifyEmail);

router.post('/login',login);


module.exports = router;