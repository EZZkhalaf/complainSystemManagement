const express = require('express');
const User = require('../model/User');
const Complaint = require('../model/Complaint');
const Role = require('../model/Role');



const addComplaint = async (req, res) => {
    try {
        const { description, userId ,type} = req.body;
        if (!description || !userId) {
            return res.status(400).json({ message: 'Description and userId are required'});
        }
        const user = await User.findById({ _id : userId });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newComplaint = new Complaint({
            
            description,
            userId: userId,
            type: type 
        });
        if (!newComplaint) {
            return res.status(500).json({ message: 'Complaint creation failed' });
        }

        await newComplaint.save();
        res.status(201).json({ success: true, message: 'Complaint added successfully', complaint: newComplaint });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const changeComplaintStatus = async (req, res) => {
    try {
        const { complaintId, status ,userId} = req.body;
        if (!complaintId || !status || !userId) {
            return res.status(400).json({ message: 'Complaint ID and status and user are required' });
        }
        const isAdmin = await Role.findOne({ user: userId });
        if (!isAdmin || isAdmin.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can change complaint status' });
        }
        const complaint = await Complaint.findById(complaintId);
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        complaint.status = status;
        await complaint.save();
        res.status(200).json({ success: true, message: 'Complaint status updated successfully', complaint });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
        
    }
}


module.exports = { addComplaint , changeComplaintStatus };