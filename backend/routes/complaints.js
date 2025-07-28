const express = require('express');
const { addComplaint, changeComplaintStatus, listComplaints, getComplaintInfo, listUserComplaints } = require('../controllers/complaintContollers');
const { userMiddleware } = require('../middlware/userMiddlware');
const router = express.Router();


router.post('/:id', userMiddleware,addComplaint);
router.put('/', userMiddleware,changeComplaintStatus);
router.get('/:id' , userMiddleware,listComplaints)
router.get('/info/:id' , userMiddleware,getComplaintInfo)
router.get('/user/:id' , userMiddleware,listUserComplaints)



module.exports = router;