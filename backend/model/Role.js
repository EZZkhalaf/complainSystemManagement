const mongoose = require("mongoose");


const RoleSchema = new mongoose.Schema({
    user : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'user', 'moderator'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    permissions: {
        viewUsers: { type: Boolean, default: false },
        editUsers: { type: Boolean, default: false },
        deleteComplaints: { type: Boolean, default: false },
        viewGroups: { type: Boolean, default: false },
        assignRoles: { type: Boolean, default: false },
        removeUsersFromGroups: { type: Boolean, default: false },
        changeComplaintStatus : {type:Boolean , default : false}
    }

})


const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;
