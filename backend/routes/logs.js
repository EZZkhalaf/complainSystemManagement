const express = require("express");
const userMiddleware = require("../middlware/userMiddlware");
const { getLogs } = require("../controllers/logsController");


const router = express.Router();


router.post('/', userMiddleware , getLogs)

module.exports = router;