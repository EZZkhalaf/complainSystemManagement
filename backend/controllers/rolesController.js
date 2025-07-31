const Role = require("../model/Role");
const Permission = require('../model/Permission')


const addNewRole = async(req,res)=>{
    try {
        const {newRole} = req.body ;
        
        const existingRole = await Role.findOne({role : newRole});
        if(existingRole) return res.status.json({success : true , message : "role already exists"})

        const createdRole = new Role({
            role : newRole
        })

        if(!createdRole) return res.status.json({success : false , message: "error creating the role"})

        createdRole.save();

        return res.status(200).json({success : true , message : "role created successfully" , createdRole});
        
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

const getRoles = async(req,res)=>{
    try {
        const roles = await Role.find().populate("permissions");
        return res.status(200).json({success : true , roles})
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


module.exports = {addNewRole , getRoles}
