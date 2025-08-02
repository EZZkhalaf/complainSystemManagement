
const mongo = require('mongoose')


const userSchema = new mongo.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },  
    profilePicture : {
        type : String , 
        default : "" 
    } , 
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }

})


const User = mongo.model('User', userSchema);
module.exports = User;