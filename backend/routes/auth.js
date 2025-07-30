const express = require('express');
const {register , login, verifyEmail} = require("../controllers/authControllers.js");
const { userMiddleware } = require('../middlware/userMiddlware.js');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authorization Handeling endpoints
 */


/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role :
 *                  type: string
 *     responses:
 *       200:
 *         description: User registered successfully
 */
router.post('/register',register)


/**
 * @swagger
 * /api/auth/verify-email:
 *   get:
 *     summary: Verify a user's email via token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Email verified successfully
 */
router.get('/verify-email', verifyEmail);


/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user 
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login',login);




module.exports = router;