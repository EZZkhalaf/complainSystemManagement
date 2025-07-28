const User = require('../model/User.js');
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Role = require('../model/Role.js');
const nodemailer = require("nodemailer");

// const register = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const userExists = await User.findOne({ email });
//     if (userExists) {
//       return res.status(400).json({sucess : false ,  message: 'User already exists' });
//     }

//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     const newUser = new User({
//       name,
//       email,
//       password: hashedPassword,
//     });
//     await newUser.save();

//     const newRole = new Role({
//       user: newUser._id, 
//       role: role || 'user',
//     });
//     await newRole.save();

//     return res.status(201).json({sucess : true ,  message: 'User registered successfully' });
//   } catch (error) {
//     console.warn('Registration error:', error);
//     return res.status(500).json({success : false ,  message: 'Internal server error' });
//   }
// };


const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const token = jwt.sign(
      { name, email, password: hashedPassword, role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Setup email transport
    const transporter = nodemailer.createTransport({
      service: 'gmail', // Or use another SMTP provider
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
      from: `"No Reply" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `
        <h2>Welcome, ${name}!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    });

    return res.status(200).json({ success: true, message: 'Verification email sent.' });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};


// controllers/authController.js
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { name, email, password, role } = decoded;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already verified' });
    }

    const newUser = new User({ name, email, password });
    await newUser.save();

    const newRole = new Role({ user: newUser._id, role: role || 'user' });
    await newRole.save();

    return res.status(201).json({ success: true, message: 'Account verified and created successfully' });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};



const login = async(req,res) => {
    try {
        const{ email, password } = req.body;
        const user = await User.findOne({ email: email });
        if(!user){
            return res.status(404).json({ success : false ,error: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid)return res.status(400).json({success: false, error: 'wrong password' });
        
        let tempRole
        tempRole = await Role.findOne({user:user._id})
        if(!tempRole){
            tempRole = new Role({
                user : user._id ,
                role :"user"
            })
        }
        
        const token = jwt.sign({_id : user._id , role:tempRole.role}  , process.env.JWT_SECRET, {
            expiresIn: '10d'
        }); 

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: tempRole.role
            }
        })
        
    } catch (error) {
        console.warn('login error:', error);
        return res.status(500).json({success : false ,  message: 'Internal server error' });
  }
}

const changeUserRole = async (req, res) => {
    try {
        const { userId, newRole } = req.body;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const role = await Role.findOne({ user: userId });
        if (!role) {
            const addUserRole = new Role({
                user: userId,
                role: newRole
            });
            await addUserRole.save();
            return res.status(201).json({ message: 'User role added successfully', role: addUserRole });
        }

        role.role = newRole;
        await role.save();

        res.status(200).json({ message: 'User role updated successfully', role });
    }
    catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


const fetchUsers = async(req,res) =>{
    try {
        const users = await User.find();
        const notAdmins = await Role.find({user : users._id})
        return res.status(200).json({success : true , users})
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}

module.exports = {
    register ,
    login ,
    changeUserRole ,
    fetchUsers , 
    verifyEmail
};