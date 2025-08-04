const express = require("express");
const userMiddleware = require("../middlware/userMiddlware");
const { getLogs } = require("../controllers/logsController");
const checkPermission = require("../middlware/checkPermission");


const router = express.Router();


router.post('/', userMiddleware,checkPermission("view logs") , getLogs)

module.exports = router;