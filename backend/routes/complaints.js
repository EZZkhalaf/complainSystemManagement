const express = require('express');
const { addComplaint, changeComplaintStatus, listComplaints, getComplaintInfo, listUserComplaints, deleteComplaint } = require('../controllers/complaintContollers');
const  userMiddleware = require('../middlware/userMiddlware');
const checkPermission = require('../middlware/checkPermission');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Complaints
 *   description: Complaints management endpoints
 */

/**
 * @swagger
 * /api/complaints/{id}:
 *   post:
 *     summary: Add a complaint for a user
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Complaint created successfully
 *       400:
 *         description: Missing fields or invalid data
 */
router.post('/:id', userMiddleware,checkPermission("add_complaint"),addComplaint);



/**
 * @swagger
 * /api/complaints:
 *   put:
 *     summary: Change the status of a complaint (admin only)
 *     tags: [Complaints]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               complaintId:
 *                 type: string
 *               status:
 *                 type: string
 *               userId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Complaint status updated
 *       403:
 *         description: Only admins can change complaint status
 *       404:
 *         description: Complaint not found
 */
router.put('/', userMiddleware,checkPermission("edit_complaint"), changeComplaintStatus);


/**
 * @swagger
 * /api/complaints/{id}:
 *   get:
 *     summary: List complaints for a specific group or entity
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Group or entity ID
 *     responses:
 *       200:
 *         description: Complaints retrieved
 */
router.get('/:id' , userMiddleware,checkPermission("view_complaints"),listComplaints)



/**
 * @swagger
 * /api/complaints/info/{id}:
 *   get:
 *     summary: Get detailed info of a complaint
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Complaint ID
 *     responses:
 *       200:
 *         description: Complaint info retrieved
 *       404:
 *         description: Complaint not found
 */
router.get('/info/:id' , userMiddleware,getComplaintInfo)


/**
 * @swagger
 * /api/complaints/user/{id}:
 *   get:
 *     summary: List complaints made by a user
 *     tags: [Complaints]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User complaints retrieved
 */
router.get('/user/:id' , userMiddleware,listUserComplaints)


/**
 * @swagger
 * /delete/{userId}:
 *   delete:
 *     summary: Delete a complaint by ID (admin or owner only)
 *     tags:
 *       - Complaints
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the user making the request
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               complaintId:
 *                 type: string
 *                 description: ID of the complaint to delete
 *             required:
 *               - complaintId
 *     responses:
 *       200:
 *         description: Complaint deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized (not complaint owner or admin)
 *       404:
 *         description: Complaint or user not found
 *       500:
 *         description: Internal server error
 */

router.delete("/delete/:userId" , userMiddleware,checkPermission("delete_complaint"),deleteComplaint);


module.exports = router;