const express = require('express');
const { userMiddleware } = require('../middlware/userMiddlware');
const { createGroup , addUserToGroup, removeUserFromGroup, groupInfoAndUsers, listGroups, getUserGroups } = require('../controllers/groupsControllers');
const { model } = require('mongoose');

const router = express.Router();    
//will add the middlware after the frontend is done
router.post('/:userId' , userMiddleware, createGroup);
// router.post('/addUser' , userMiddleware, addUserToGroup)
router.delete('/removeUser' , userMiddleware, removeUserFromGroup)
router.get("/:groupId" , userMiddleware,groupInfoAndUsers )
router.get('/user/:id' , userMiddleware , getUserGroups);
router.get('/admin/:id' , userMiddleware , listGroups);


module.exports = router;