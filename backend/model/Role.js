


const mongoose = require("mongoose");


const RoleSchema = new mongoose.Schema({
    user : [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    }],
    role: {
        type: String,
        default: 'user',
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    permissions: [
        {
            type : mongoose.Schema.Types.ObjectId ,
            ref:"Permission"
        }
    ]

})


const Role = mongoose.model('Role', RoleSchema);
module.exports = Role;
