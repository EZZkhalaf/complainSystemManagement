const express = require('express');
const { changeUserRole, fetchUsers, getAdminSummary } = require('../controllers/authControllers');
const { userMiddleware } = require('../middlware/userMiddlware');
const { addUserToGroup } = require('../controllers/groupsControllers');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */


/**
 * @swagger
 * /api/user/changeRole:
 *   post:
 *     summary: Change a user's role (admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newRole
 *             properties:
 *               userId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *               newRole:
 *                 type: string
 *                 example: admin
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/changeRole" , userMiddleware,changeUserRole);


/**
 * @swagger
 * /api/user:
 *   get:
 *     summary: Fetch all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/" , userMiddleware,fetchUsers);



/**
 * @swagger
 * /api/user/add:
 *   post:
 *     summary: Add a user to a group
 *     tags: [Users]
 *     requestBody:
 *       description: Group ID and User ID to add user to the group
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - userId
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109ca
 *               userId:
 *                 type: string
 *                 example: 60d0fe4f5311236168a109cb
 *     responses:
 *       200:
 *         description: User added to group successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: User added to group successfully
 *                 group:
 *                   type: object
 *                   description: Updated group object with users array
 *       400:
 *         description: User already in group
 *       404:
 *         description: Group or User not found
 *       500:
 *         description: Server error
 */
router.post("/add" , addUserToGroup);




/**
 * @swagger
 * /getSummary/{id}:
 *   get:
 *     summary: Get system summary for admin
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the admin user
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Summary retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 users:
 *                   type: integer
 *                   example: 10
 *                 groups:
 *                   type: integer
 *                   example: 5
 *                 complaints:
 *                   type: integer
 *                   example: 20
 *       401:
 *         description: Unauthorized (only admin can access)
 *       500:
 *         description: Server error
 */
router.get("/getSummary/:id", userMiddleware, getAdminSummary);

module.exports = router;