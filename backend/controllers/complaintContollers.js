const express = require('express');
const User = require('../model/User');
const Complaint = require('../model/Complaint');
const Role = require('../model/Role');
const nodemailer = require('nodemailer');
const { logAction } = require('../middlware/logHelper');
const Group = require('../model/Group');
const { default: mongoose } = require('mongoose');


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

        const group1 = await Group.findOne({name : "HR"});
        if(!group1) return res.status(404).json({success : false , message : "no default group to take the complaint"})

        const newComplaint = new Complaint({
            
            description,
            userId: id,
            type: type ,
            groupsQueue : [group1._id]
        });
        if (!newComplaint) {
            return res.status(500).json({ message: 'Complaint creation failed' });
        }

        await newComplaint.save();
        await logAction(user , "Add-Complaint" , "User" , newComplaint._id , `added new Complaint with type ${newComplaint.type} `)
        res.status(201).json({ success: true, message: 'Complaint added successfully', complaint: newComplaint });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}





const changeComplaintStatus = async (req, res) => {
  try {
    const { complaintId, status, userId , groupId } = req.body;

    if (!complaintId || !status || !userId) {
      return res.status(400).json({ success: false, message: 'Complaint ID, status, and user ID are required' });
    }

    // Check admin privileges
    const user = await Role.findOne({ user: userId });
    // if (!isAdmin || isAdmin.role !== 'admin') {
    //   return res.status(403).json({ success: false, message: 'Only admins can change complaint status' });
    // }

    const group =await Group.findById(groupId);
    if(!group) return res.status(404).json({success:false , message : "no group found :("})


    // Get complaint with user data
    const complaint = await Complaint.findById(complaintId).populate('userId');
    const oldStatus = complaint.status;
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Update status
    complaint.status = status;
    complaint.assignedGroup = group._id
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
    
    await logAction(user , "Change-Status" , "Complaint" , complaint._id , `Chenged the Complaint ${complaint._id} from ${oldStatus} To ${complaint.status}`)
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
        
        // if(isAdmin.role !== 'admin'){
        //     return res.status(400).json({success : false , error : "the user should be an admin to perform this action "})
        // }else if(isAdmin.role === 'admin'){
            const complaints = await Complaint.find().populate("userId" , "-password");
            return res.status(200).json({success : true , complaints})
    // }

        
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


// const listGroupComplaints = async(req,res) =>{
//   try {
    
//   } catch (error) {
    
//   }
// }


const deleteComplaint = async (req, res) => {
  try {
    const { complaintId } = req.body;
    const { userId } = req.params;

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ success: false, message: "Complaint not found" });
    }

    const user = await Role.findOne({user : userId}).populate("user", "-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const isOwner = complaint.userId === user.user._id
    // const isAdmin = user.role === "admin";

    // if (!isOwner && !isAdmin) {
    //   return res.status(401).json({
    //     success: false,
    //     message: "User not authorized to delete this complaint",
    //   });
    // }

    await Complaint.findByIdAndDelete(complaintId);

    await logAction(user , "Delete-Complaint" , "Complaint" , complaint._id , `The User Deleted ${isOwner ? "His " : "The "} Complaint With Id ${complaint._id}`)

    return res.status(200).json({ success: true, message: "Complaint deleted successfully" });

    
  } catch (error) {
    console.error("Error deleting complaint:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


const handleComplaintInGroup = async(req,res) =>{
  try {
    const { userId , groupId , status} = req.body;
    const{id} = req.params
    let complaintId = id;
    const complaint = await Complaint.findById(complaintId).populate("userId")

    const oldStatus = complaint.status;

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    const user = await User.findById(userId)

    // const isMember = await Group.find({_id : groupId , users : userId})
    // if(!isMember) return res.status(400).json({success : false , message : "user is not a member of the group "})


    if(status === "in-progress"){


        complaint.status = status ;
        complaint.groupsQueue.push(groupId);
        await complaint.save();


        await logAction(user, "Change-Status", "Complaint", complaint._id, `Changed Complaint ${complaint._id} status from ${oldStatus} to ${status} and added group ${groupId} to queue`);
        return res.status(200).json({ success: true, message: 'Complaint status updated and group assigned', complaint });

    }else {

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
        
        await logAction(user , "Change-Status" , "Complaint" , complaint._id , `Changed the Complaint ${complaint._id} from ${oldStatus} To ${complaint.status}`)
        res.status(200).json({ success: true, message: 'Complaint status updated and email sent', complaint });
    }
  }catch (error) {
    console.error("Error deleting complaint:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

const listGroupComplaints = async(req,res)=>{
  try {
    const { userId , type , status , page =1 , limit= 10} = req.body;
    const {id} = req.params;
    let groupId = id
    if (!mongoose.Types.ObjectId.isValid(groupId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid groupId or userId" });
    }


    const group = await Group.findById(groupId);
    const inTheGroup = group.users.some(user => user.equals(userId))
    if(!inTheGroup) return res.status(403).json({success : false , message :"user is not allowed to view other groups complaints"})
      
      const skip = (page -1 )*limit
      const filter ={
        $expr:{
          $eq:[
            {$arrayElemAt : ["$groupsQueue" , -1]}//last id 
            , new mongoose.Types.ObjectId(groupId)
          ]
        }
      }

      if(type) filter.type = type;
      if(status) filter.status = status;

    const complaints = await Complaint.find(filter)
        .sort({createdAt : -1})
        .skip(skip)
        .limit(Number(limit));

    const total = await Complaint.countDocuments(filter);


    return res.status(200).json({success:true , complaints,total , page : Number(page) ,totalPages: Math.ceil(total / limit)})
  }catch (error) {
    console.error("Error fetching complaints:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { 
  addComplaint , changeComplaintStatus , listComplaints , getComplaintInfo , 
  listUserComplaints , deleteComplaint , listGroupComplaints , handleComplaintInGroup
};