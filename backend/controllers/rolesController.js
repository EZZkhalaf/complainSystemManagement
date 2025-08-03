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

const getRoleById = async(req,res)=>{
    try {
        const {id} = req.params ;
        const role = await Role.findById(id).populate("permissions" )
        if(!role) return res.status(404).json({success : false , message :"the role not found :("})

        return res.status(200).json({success: true , role})
    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


const deleteRole = async (req, res) => {
  try {
    const { roleId } = req.params;


    const roleToDelete = await Role.findById(roleId);
    if (!roleToDelete) {
      return res.status(404).json({ success: false, message: "Role not found" });
    }

    const usersToReassign = roleToDelete.user;

    let userRole = await Role.findOne({ role: "user" });

    if (!userRole) {
      userRole = new Role({ role: "user", user: [] });
    }

    userRole.user = Array.from(new Set([...userRole.user, ...usersToReassign]));
    await userRole.save();

    await Role.findByIdAndDelete(roleId);
    const roles = await Role.find().populate("permissions");

    return res.status(200).json({ success: true, message: "Role deleted and users reassigned." ,roles });
  } catch (error) {
    console.error("Error deleting Role:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



const addPermissions = async(req,res) =>{
    try {
        const permissions = req.body ;

        if(!Array.isArray(permissions)){
            return res.status(400).json({success:false , message :"the req must be an array "})
        }

        const invalidPermissions = permissions.some( p=> typeof p!== 'object' || !p.name || !p.description)
        if(invalidPermissions) return res.status(400).json({
                                                        success: false,
                                                        message: "Each permission must be an object with 'name' and 'description'",
                                                    });
        const uniqueByName = [
            ...new Map(permissions.map(p => [p.name, p])).values()
        ];          
        const existing = await Permission.find({
            name : {$in : uniqueByName.map(p => p.name)}
        }).select('name')
        const existingNames = new Set(existing.map(p => p.name));
        const newPermissions = uniqueByName.filter(p => !existingNames.has(p.name))

        if(newPermissions.length=== 0)
            return res.status(200).json({
                success: true,
                message: "No new permissions to add (all already exist)",
            });


        const inserted = await Permission.insertMany(newPermissions);


        res.status(201).json({
            success: true,
            message: "New permissions added successfully",
            data: inserted,
            });



    } catch (error) {
        console.error("Error deleting group:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


const deletePermission = async(req,res)=>{
    try {
        const {id} = req.params;
        const permission = await Permission.findByIdAndDelete(id) ;
        await Role.updateMany(
          { permissions: id },
          { $pull: { permissions: id } }
        ); 
        return res.status(200).json({success : true , message :"permission deleted successfully" })
    } catch (error) {
        console.error("Error deleting permission:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}


const fetchPermissions =async(req,res)=>{
    try {
        const permissions = await  Permission.find();
        return res.status(200).json({success : true , permissions})
    } catch (error) {
        console.error("Error fetching permissions:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
    
}

const addPermissionsToRole = async(req,res) =>{
    try {
        const {permissionsIds , roleId} = req.body;

        if (!Array.isArray(permissionsIds) || !roleId) {
            return res.status(400).json({
                success: false,
                message: "Missing or invalid 'permissionsIds' array or 'roleId'",
            });
            }

        const role = await Role.findById(roleId).populate('permissions');
        if(!role) return res.status(404).json({success : false , message :"role not found :("})
        
        const validPermissions = await Permission.find({
            _id: { $in: permissionsIds },
        });

        if (validPermissions.length !== permissionsIds.length) 
            return res.status(400).json({
                success: false,
                message: "One or more permission IDs are invalid",
            });

        const updatedRole = await Role.findByIdAndUpdate(roleId ,
            {permissions : permissionsIds},
            {new : true}
        ).populate("permissions");
        
        res.status(200).json({
            success: true,
            message: "Permissions Added Successfully",
            data: updatedRole,
        });
    } catch (error) {
        console.error("Error adding permissions to Role:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
}

module.exports = {deletePermission ,addNewRole , getRoles , addPermissions , fetchPermissions , addPermissionsToRole , getRoleById , deleteRole}
