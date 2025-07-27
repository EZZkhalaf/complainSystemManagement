const express=require('express')
const Group = require('../model/Group.js');
const { find } = require('../model/User.js');
const User = require('../model/User.js');
const Role = require('../model/Role.js');
const createGroup = async (req, res) => {
    try {
        const { name, description } = req.body;
        const {userId} = req.params;
        if (!name || !description) {
            return res.status(400).json({ message: 'Name and description are required' });
        }

        const nameExist = await Group.findOne({name : name });

        if(nameExist) return res.status(400).json({success:false , error : "group name already exist"})


        // const user = await User.findById({_id : userId});
        const userRole = await Role.findOne({ user: userId });
        if(userRole.role !== 'admin') {
            return res.status(403).json({success : false , message: 'Only admins can create groups' });
        }

        const newGroup = new Group({
            name: name,
            description: description,
            createdBy: userId 
        });

        await newGroup.save();
        res.status(201).json({success : true,  message: 'Group created successfully', group: newGroup });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}


const addUserToGroup = async (req, res) => {
    try {   
        const { groupId, userId } = req.body;
        const group = await Group.findById({_id: groupId });
        if (!group) {
            return res.status(404).json({success : false ,  message: 'Group not found' });
        }
        const user = await User.findById({_id: userId });
        if (!user) {
            return res.status(404).json({success : false ,  message: 'User not found' });
        }
        if(group.users.includes(userId)) {
            return res.status(400).json({success : false ,  message: 'User already in group' });
        }
        group.users.push(userId);
        await group.save();
        res.status(200).json({ success : true , message: 'User added to group successfully', group: group });
    

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }

}

const removeUserFromGroup = async (req, res) => {
    try {   
        const { groupId, userId } = req.body;
        const group = await Group.findById({_id: groupId });
        if (!group) {
            return res.status(404).json({success : false ,  message: 'Group not found' });
        }
        const user = await User.findById({_id: userId });
        if (!user) {
            return res.status(404).json({success : false ,  message: 'User not found' });
        }
        if(!group.users.includes(userId)) {
            return res.status(400).json({success : false ,  message: 'User not in group' });
        }
        group.users = group.users.filter(id => id.toString() !== userId.toString());
        await group.save();
        res.status(200).json({ success : true , message: 'User removed from group successfully', group: group });

    }catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error' });
    }
}

const groupInfoAndUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById({_id: groupId }).populate('users', '-password');
        if (!group) {
            return res.status(404).json({ success: false, message: 'Group not found' });
        }   
        res.status(200).json({ success: true, group });
    } catch (error) {
        console.log(error);
        res.status(500).json({success : false , message: 'Server error' });
        
    }
}

const getUserGroups = async (req, res) => {
  try {
    const { id } = req.params; 

    if (!id) {
      return res.status(400).json({ success: false, message: "user id is required" });
    }

    const groups = await Group.find({ users: id }).populate('users', '-password');

    if (groups.length === 0) {
      return res.status(404).json({ success: false, message: "User is not in any group" });
    }

    res.status(200).json({ success: true, groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
 

const listGroups = async(req,res)=>{
    try {
        const {id} = req.params;
        const isAdmin = await Role.findOne({ user: id });
        if (!isAdmin || isAdmin.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can change complaint status' });
        }
        const groups = await Group.find().populate("users" , "-password")
        return res.status(200).json({success:true , groups})
    } catch (error) {
        console.error("Error fetching groups:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = {createGroup , addUserToGroup , removeUserFromGroup , groupInfoAndUsers , getUserGroups , listGroups}