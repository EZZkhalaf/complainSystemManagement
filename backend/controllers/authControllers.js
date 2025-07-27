const User = require('../model/User.js');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken")

const register = async(req,res) => {
    try {
       const {name , email, password ,role} = req.body;
       const userExists = await User.findOne({email: email});
       if(userExists){
              return res.status(400).json({ message: 'User already exists' });
       }

       const saltRounds = 10;
       const hashedPassword = await bcrypt.hash(password, saltRounds);
         const newUser = new User({
              name: name,
              email: email,
              password: hashedPassword,
                role: role || 'user' 
              
         });


            await newUser.save();
            if(!newUser){
                return res.status(500).json({ message: 'User registration failed' });
            }
            res.status(201).json({ message: 'User registered successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error' });  
    }
}

const login = async(req,res) => {
    try {
        const{ email, password } = req.body;
        const user = await User.findOne({ email: email });
        if(!user){
            return res.status(404).json({ success : false ,error: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid)return res.status(400).json({success: false, error: 'wrong password' });
        
        

        const token = jwt.sign({_id : user._id , role:user.role}  , process.env.JWT_SECRET, {
            expiresIn: '2h'
        }); 

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        })
        
    } catch (error) {
        
    }
}

module.exports = {
    register ,
    login
};