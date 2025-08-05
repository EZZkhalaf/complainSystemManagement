const mongoose = require("mongoose")

const schema = mongoose.Schema();

const complaintGroupsRuleSchema = new mongoose.Schema({
    groupsSequence:[{
        type : mongoose.Schema.Types.ObjectId ,
        ref : "Group"
    }], 
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }

})

const ComplaintGroupsRule = mongoose.model("ComplaintGroupsRule" , complaintGroupsRuleSchema);
module.exports = ComplaintGroupsRule