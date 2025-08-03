const Logs = require("../model/Logs");

const logAction = async(
    user ,
    action ,
    target = "" ,
    targetId = null ,
    details = ""
) =>{
    try {
        await Logs.create({
            user : user._id ,
            action , 
            target ,
            targetId ,
            details
        })
        console.log("working")
    } catch (err) {
    console.error('Failed to log audit action:', err.message);
  }
}

module.exports = {logAction}