const express = require('express');
const userMiddleware = require('../middlware/userMiddlware');
const { addNewRole, getRoles, addPermissions, fetchPermissions, addPermissionsToRole, getRoleById, deleteRole } = require('../controllers/rolesController');
const checkPermission = require('../middlware/checkPermission');
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Role
 *   description: Role and Permission management
 */


/**
 * @swagger
 * /api/role:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newRole
 *             properties:
 *               newRole:
 *                 type: string
 *     responses:
 *       200:
 *         description: Role created successfully
 *       400:
 *         description: Role already exists
 *       500:
 *         description: Server error
 */
router.post("/" , userMiddleware,checkPermission("manage_permissions") , addNewRole);

/**
 * @swagger
 * /api/role:
 *   get:
 *     summary: Get all roles with permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles with permissions
 *       500:
 *         description: Server error
 */
router.get("/" , userMiddleware , getRoles);

/**
 * @swagger
 * /api/role/addPermissions:
 *   post:
 *     summary: Add new permissions to the system
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                 description:
 *                   type: string
 *     responses:
 *       201:
 *         description: New permissions added
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post("/addPermissions"  ,userMiddleware,checkPermission("manage_permissions"), addPermissions);

/**
 * @swagger
 * /api/role/getPermissions:
 *   get:
 *     summary: Fetch all permissions
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all permissions
 *       500:
 *         description: Server error
 */
router.get("/getPermissions"  , userMiddleware,checkPermission("manage_permissions"), fetchPermissions);

/**
 * @swagger
 * /api/role/addPermissionsToRole:
 *   post:
 *     summary: Add permissions to a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionsIds
 *               - roleId
 *             properties:
 *               permissionsIds:
 *                 type: array
 *                 items:
 *                   type: string
 *               roleId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Permissions added to role
 *       400:
 *         description: Invalid permission ID or input
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.post("/addPermissionsToRole"  , userMiddleware,checkPermission("manage_permissions"), addPermissionsToRole);

/**
 * @swagger
 * /api/role/{id}:
 *   get:
 *     summary: Get a role by ID
 *     tags: [Roles]
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
 *         description: Role retrieved successfully
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.get("/:id"  , userMiddleware, getRoleById);


/**
 * @swagger
 * /api/role/{roleId}:
 *   delete:
 *     summary: Delete a role and reassign its users
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Role deleted and users reassigned
 *       404:
 *         description: Role not found
 *       500:
 *         description: Server error
 */
router.delete("/:roleId"  , userMiddleware, checkPermission("manage_permissions"),deleteRole);



module.exports = router