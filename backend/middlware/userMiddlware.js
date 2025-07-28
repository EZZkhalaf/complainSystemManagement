const User = require("../model/User");
const jwt = require("jsonwebtoken")

 const userMiddleware = async(req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if(!token){
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(!decoded){
            return res.status(401).json({ message: 'Invalid token' });
        }

        const user = await User.findById({_id : decoded._id}).select('-password');
        if(!user){
            return res.status(404).json({ message: 'User not found' });
        }
        // console.log("middlware is working ")

        next();

        
    } catch (error) {
        console.log(error )
        return res.status(500).json({ message: 'Server error' });
    }
}


module.exports = {userMiddleware};   