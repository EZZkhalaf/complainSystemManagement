const express = require('express');
const  userMiddleware  = require('../middlware/userMiddlware');
const { createGroup , addUserToGroup, removeUserFromGroup, groupInfoAndUsers, listGroups, getUserGroups } = require('../controllers/groupsControllers');
const { model } = require('mongoose');
const checkPermission = require('../middlware/checkPermission');

const router = express.Router();    

/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Group management endpoints
 */




/**
 * @swagger
 * /api/group/{userId}:
 *   post:
 *     summary: Create a new group by user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID who creates the group
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Group data (if any)
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Group created successfully
 *       400:
 *         description: Invalid request data
 */
router.post('/:userId' , userMiddleware, createGroup);


/**
 * @swagger
 * /api/group/removeUser:
 *   delete:
 *     summary: Remove a user from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: User and group info to remove user from group
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - groupId
 *             properties:
 *               userId:
 *                 type: string
 *               groupId:
 *                 type: string
 *     responses:
 *       200:
 *         description: User removed from group successfully
 *       400:
 *         description: Invalid request
 */

router.delete('/removeUser' , userMiddleware,checkPermission("removeUsersFromGroups"), removeUserFromGroup)


/**
 * @swagger
 * /api/group/{groupId}:
 *   get:
 *     summary: Get group info and its users
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: Group ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Group information and users retrieved
 *       404:
 *         description: Group not found
 */
router.get("/:groupId" , userMiddleware,groupInfoAndUsers )


/**
 * @swagger
 * /api/group/user/{id}:
 *   get:
 *     summary: Get groups of a user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User groups retrieved successfully
 */
router.get('/user/:id' , userMiddleware , getUserGroups);


/**
 * @swagger
 * /api/group/admin/{id}:
 *   get:
 *     summary: List groups for an admin user
 *     tags: [Groups]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Admin user ID
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups list retrieved successfully
 */
router.get('/admin/:id' , userMiddleware , checkPermission("viewGroups") , listGroups);


module.exports = router;