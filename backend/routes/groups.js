const express = require('express');
const { userMiddleware } = require('../middlware/userMiddlware');
const { createGroup , addUserToGroup, removeUserFromGroup } = require('../controllers/groupsControllers');
const { model } = require('mongoose');

const router = express.Router();    
//will add the middlware after the frontend is done
router.post('/' , createGroup);
router.post('/addUser' , addUserToGroup)
router.post('/removeUser' , removeUserFromGroup)


module.exports = router;