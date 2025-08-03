const express = require('express');
const { changeUserRole, fetchUsers, getAdminSummary, editUserInfo, getUserById, verifyEmailUpdate, adminEditUserInfo, fetchUsersRoleEdition, deleteUser } = require('../controllers/authControllers');
const  userMiddleware  = require('../middlware/userMiddlware');
const { addUserToGroup } = require('../controllers/groupsControllers');
const upload = require('../middlware/upload');
const checkPermission = require('../middlware/checkPermission');
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
router.post("/changeRole" , userMiddleware,checkPermission("change_user_role"),changeUserRole);


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
router.get("/" , userMiddleware,checkPermission("view_employees"),fetchUsers);

/**
 * @swagger
 * /api/user/getUsersRoleEdition:
 *   get:
 *     summary: Get all users with roles for editing roles
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of users with roles
 *       500:
 *         description: Server error
 */
router.get("/getUsersRoleEdition" , userMiddleware,fetchUsersRoleEdition);



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
router.post("/add" , userMiddleware,checkPermission("add_employee_to_group") ,addUserToGroup);




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
router.get("/getSummary/:id", userMiddleware, checkPermission("view_dashboard_summary"),getAdminSummary);


/**
 * @swagger
 * /api/user/editInfo/{id}:
 *   put:
 *     summary: Edit own user information (with email verification if changed)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: User ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *               newEmail:
 *                 type: string
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               profilePicture:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: User info updated or verification sent
 *       400:
 *         description: Email already in use
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/editInfo/:id' ,userMiddleware, upload.single("profilePicture"),editUserInfo)


/**
 * @swagger
 * /api/user/editInfo/admin/{id}:
 *   put:
 *     summary: Admin edits another user's information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of admin performing the operation
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - newName
 *               - newEmail
 *             properties:
 *               userId:
 *                 type: string
 *               newName:
 *                 type: string
 *               newEmail:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       401:
 *         description: Only admin can edit user info
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/editInfo/admin/:id' ,userMiddleware  , checkPermission("edit_employee"),adminEditUserInfo)


/**
 * @swagger
 * /api/user/getUser/{id}:
 *   get:
 *     summary: Get user by ID including groups and complaints
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User details retrieved
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

/**
 * @swagger
 * /api/user/verify-email:
 *   get:
 *     summary: Verify email change using token
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       302:
 *         description: Redirects to frontend confirmation page
 *       400:
 *         description: Invalid or expired token
 */
router.get('/getUser/:id' ,userMiddleware, getUserById)

/**
   * @swagger
   * /api/user/getUsersRoleEdition:
   *   get:
   *     summary: Get all users with roles for editing roles
   *     tags: [Users]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: List of users with roles
   *       500:
   *         description: Server error
   */
router.get('/verify-email' , verifyEmailUpdate)

router.delete("/:userId" , deleteUser);
module.exports = router;