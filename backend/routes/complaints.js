const express = require('express');
const { addComplaint, changeComplaintStatus, listComplaints } = require('../controllers/complaintContollers');
const { userMiddleware } = require('../middlware/userMiddlware');
const router = express.Router();


router.post('/:id', userMiddleware,addComplaint);
router.put('/', userMiddleware,changeComplaintStatus);
router.get('/:id' , userMiddleware,listComplaints)


module.exports = router;