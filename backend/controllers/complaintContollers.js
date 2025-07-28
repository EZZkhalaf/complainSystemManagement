const express = require('express');
const User = require('../model/User');
const Complaint = require('../model/Complaint');
const Role = require('../model/Role');
const nodemailer = require('nodemailer')


const addComplaint = async (req, res) => {
    try {
        const { description ,type} = req.body;
        const {id} = req.params;
        if (!description || !id) {
            return res.status(400).json({ message: 'Description and userId are required'});
        }
        const user = await User.findById({ _id : id });
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newComplaint = new Complaint({
            
            description,
            userId: id,
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

// const changeComplaintStatus = async (req, res) => {
//     try {
//         const { complaintId, status ,userId} = req.body;
//         if (!complaintId || !status || !userId) {
//             return res.status(400).json({success : false , message: 'Complaint ID and status and user are required' });
//         }
//         const isAdmin = await Role.findOne({ user: userId });
//         if (!isAdmin || isAdmin.role !== 'admin') {
//             return res.status(403).json({success : false , message: 'Only admins can change complaint status' });
//         }
//         const complaint = await Complaint.findById(complaintId);
//         if (!complaint) {
//             return res.status(404).json({success : false , message: 'Complaint not found' });
//         }
//         complaint.status = status;
//         await complaint.save();
//         res.status(200).json({ success: true, message: 'Complaint status updated successfully', complaint });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({success : false , message: 'Server error' });
        
//     }
// }



const changeComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, userId } = req.body;

    if (!complaintId || !status || !userId) {
      return res.status(400).json({ success: false, message: 'Complaint ID, status, and user ID are required' });
    }

    // Check admin privileges
    const isAdmin = await Role.findOne({ user: userId });
    if (!isAdmin || isAdmin.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can change complaint status' });
    }

    // Get complaint with user data
    const complaint = await Complaint.findById(complaintId).populate('userId');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Update status
    complaint.status = status;
    await complaint.save();

    // Prepare and send email
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: complaint.userId.email,
      subject: 'Complaint Status Updated',
      html: `<p>Hello ${complaint.userId.name},</p>
             <p>Your complaint status has been updated to <strong>${status}</strong>.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: 'Complaint status updated and email sent', complaint });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};


const listComplaints = async(req,res)=>{
    try {
        const {id} = req.params;
        const isAdmin = await Role.findOne({user : id});
        
        if(isAdmin.role !== 'admin'){
            return res.status(400).json({success : false , error : "the user should be an admin to perform this action "})
        }else if(isAdmin.role === 'admin'){
            const complaints = await Complaint.find().populate("userId" , "-password");
            return res.status(200).json({success : true , complaints})
        }

        
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
        
    }
}


const getComplaintInfo = async(req,res)=>{
    try {
        const {id} = req.params ;
        const complaint = await Complaint.findById(id).populate("userId" , "-password");
        if(!complaint){
            return res.status(404).json({success : false , message : "complaint not found "})
        }
        return res.status(200).json({success : true , complaint});
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
        
    }
}

const listUserComplaints = async(req,res) =>{
    try {
        const {id} = req.params ;
        const userExists = await User.findOne({_id : id})
        if(!userExists) return res.status(404).json({success : false , error : "user not found"})

        const complaints = await Complaint.find({userId : id})
        return res.status(200).json({success : true , complaints})
    }catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
        
    }
}


module.exports = { addComplaint , changeComplaintStatus , listComplaints , getComplaintInfo , listUserComplaints};