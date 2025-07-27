const express = require('express');
const { userMiddleware } = require('../middlware/userMiddlware');
const { createGroup , addUserToGroup, removeUserFromGroup, listUsersInGroup, getUserGroups, listGroups } = require('../controllers/groupsControllers');
const { model } = require('mongoose');

const router = express.Router();    
//will add the middlware after the frontend is done
router.post('/:userId' , userMiddleware, createGroup);
router.post('/addUser' , userMiddleware, addUserToGroup)
router.post('/removeUser' , userMiddleware, removeUserFromGroup)
router.get("/:groupId" , userMiddleware,listUsersInGroup )
router.get('/user/:id' , userMiddleware , getUserGroups);
router.get('/admin/:id' , userMiddleware , listGroups);


module.exports = router;