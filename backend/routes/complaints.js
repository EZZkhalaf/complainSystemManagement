const express = require('express');
const { addComplaint, changeComplaintStatus } = require('../controllers/complaintContollers');
const router = express.Router();


router.post('/',addComplaint);
router.put('/',changeComplaintStatus);

module.exports = router;