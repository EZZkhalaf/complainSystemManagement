const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema({
    userId : {
        type: mongoose.Schema.Types.ObjectId,   
        ref: 'User',
        required: true
    },
    description : {
        type: String ,
        default: 'no descrition provided',
        
    },
    complaintAdmin :{
        type : mongoose.Schema.Types.ObjectId ,
        ref: 'User',
        default: null
    },
    status : {
        type: String,
        enum: ['pending', 'in-progress', 'resolved', 'rejected'],
        default: 'pending'
    },type: {
        type: String,
        enum: ['general', 'technical', 'billing', 'other'],
        default: 'general'
    } ,
    createdAt: {
        type: Date,
        default: Date.now
    },
})

const Complaint = mongoose.model('Complaint', complaintSchema);
module.exports = Complaint;

