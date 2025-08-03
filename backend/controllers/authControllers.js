const User = require('../model/User.js');
const Role = require('../model/Role.js');
const Group = require("../model/Group.js")
const OTP = require('../model/OTP.js')
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Complaint = require('../model/Complaint.js');
const { v4: uuidv4 } = require('uuid');
const crypto = require("crypto")
const { logAction } = require('./Logs.js');
const { findOne } = require('../model/Logs.js');
const TempSession = require('../model/TempSession.js');

const sendEmail = async(to , subject , text)=>{
  const transporter = nodemailer.createTransport({
    service : 'Gmail' ,
    auth : {
      user : process.env.EMAIL_USER,
      pass : process.env.EMAIL_PASS
    }
  })

  const mailOptions = {
    from : process.env.EMAIL_USER ,
    to ,
    subject ,
    text,
  }

  await transporter.sendMail(mailOptions)
}

const defaultPermissions = {
            admin: {
              viewUsers: true,
              editUsers: true,
              deleteComplaints: true,
              viewGroups: true,
              assignRoles: true,
              removeUsersFromGroups: true,
            },
            moderator: {
              viewUsers: true,
              editUsers: true,
              deleteComplaints: true,
              viewGroups: true,
              assignRoles: false,
              removeUsersFromGroups: true,
            },
            user: {
              viewUsers: false,
              editUsers: false,
              deleteComplaints: false,
              viewGroups: true,
              assignRoles: false,
              removeUsersFromGroups: false,
            }
          };


const defaultPermissions2 = {
  admin: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: true,
    viewComplaints: true,
    manageComplaints: true,
    assignRoles: true,
    viewGroups: true,
    editGroups: true,
    removeUsersFromGroups: true,
  },
  moderator: {
    viewUsers: true,
    editUsers: true,
    deleteUsers: false,  // moderators cannot delete users
    viewComplaints: true,
    manageComplaints: true,
    assignRoles: false, // moderators cannot assign roles
    viewGroups: true,
    editGroups: false,  // moderators cannot edit groups
    removeUsersFromGroups: true,
  },
  user: {
    viewUsers: false,
    editUsers: false,
    deleteUsers: false,
    viewComplaints: true,  // can view own complaints
    manageComplaints: false,
    assignRoles: false,
    viewGroups: true,
    editGroups: false,
    removeUsersFromGroups: false,
  },
};



const register = async (req, res) => {
  try {
    const { name, email, password,  } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let role = 'user'
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


// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;
//     if (!token) {
//       return res.status(400).json({ success: false, message: 'No token provided' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const { name, email, password, role } = decoded;

//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ success: false, message: 'User already verified' });
//     }

//     const newUser = new User({ name, email, password });
//     await newUser.save();

//     const newRole = new Role({ user: newUser._id, 
//       role: role || 'user', 
//     });
//     await newRole.save();

//     return res.status(201).json({ success: true, message: 'Account verified and created successfully' });
//   } catch (error) {
//     console.error('Verification error:', error);
//     return res.status(400).json({ success: false, message: 'Invalid or expired token' });
//   }
// };


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

    // Find existing role by role name
    const roleDoc = await Role.findOne({ role: role || 'user' });

    if (roleDoc) {
      // Push newUser._id into the user array if not already included
      if (!roleDoc.user.includes(newUser._id)) {
        roleDoc.user.push(newUser._id);
        await roleDoc.save();
      }
    } else {
      // If role does not exist, create new role document with the user
      const newRole = new Role({
        user: [newUser._id],
        role: role || 'admin',
      });
      await newRole.save();
    }

    await logAction(newUser , "Register" , "User" , newUser._id , "Created A New Account")

    return res.status(201).json({ success: true, message: 'Account verified and created successfully' });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};

const deleteUser = async(req,res) =>{
  try {
    const {userId} = req.params ;
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    await Complaint.deleteMany({ userId: userId });
    await Role.updateMany(
          { user: userId },
          { $pull: { users: userId } }
        );  
    return res.status(200).json({ success: true, message: 'User and associated data deleted successfully.' });
  } catch (error) {
      console.error('Verification error:', error);
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
}




const login = async(req,res) => {
    try {
        const{ email, password } = req.body;
        
        const user = await User.findOne({ email: email });
        if(!user){
          return res.status(404).json({ success : false ,message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid)return res.status(400).json({success: false, message: 'wrong password' });
        
        let tempRole
        tempRole = await Role.findOne({user:user._id}).select("-user").populate("permissions" , "-description")
        
        
        const token = jwt.sign({_id : user._id , role:tempRole.role}  , process.env.JWT_SECRET, {
            expiresIn: '10d'
        }); 
        

        await logAction(user , "Login" , "User" , user._id , "Logged In")

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: tempRole.role ,
                profilePicture : user.profilePicture ,
                permissions : tempRole.permissions
            }
        })
        
    } catch (error) {
        console.log('login error:', error);
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

        await Role.updateMany(
          {user:userId} ,
          {$pull : {user:userId}}
        )

        

        let role = await Role.findOne({ role: newRole });
        if (!role) {
            
            return res.status(404).json({ success : true ,message: 'role not found'});
        }

        if(!role.user.includes(userId)){
            role.user.push(userId)
            await role.save();  
        }
        return res.status(200).json({
          success: true,
          message: 'User role updated successfully',
          role
        });
    }
    catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ message: 'Server error' });
    }
}


const fetchUsers = async(req,res) =>{
    try {
        const users = await Role.find().populate("user" , '-password');
        const notAdmins = await Role.find({user : users._id})
                let roleId = users._id
        const roles = await Role.find();
        return res.status(200).json({success : true , users , roleId , roles})
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}



// const fetchUsersRoleEdition = async (req, res) => {
//   try {
//     // 1. Users with roles (populated)
//     const roles = await Role.find().populate('user', '-password');
//     const usersWithRoles = roles.flatMap(role => role.user);

//     // 2. Get IDs of users who already have a role
//     const usersWithRoleIds = usersWithRoles.map(user => user._id.toString());

//     // 3. Users without roles
//     const usersWithoutRoles = await User.find({
//       _id: { $nin: usersWithRoleIds }
//     }).select('-password');

//     return res.status(200).json({
//       success: true,
//       usersWithRoles,
//       usersWithoutRoles
//     });

//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };
const fetchUsersRoleEdition = async (req, res) => {
  try {
    const roles = await Role.find().populate('user', '-password');

    // Map users with roles
    let usersWithRoles = [];
    roles.forEach(role => {
      role.user.forEach(user => {
        usersWithRoles.push({
          user,
          role: role.role
        });
      });
    });
    const roles2 = await Role.find().select("-permissions");

    return res.status(200).json({
      success: true,
      users: usersWithRoles , 
      roles2
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




const getAdminSummary = async(req,res)=>{
    try {
        // console.log("working")
        const {id} = req.params ; 
        const userRole = await Role.findOne({user : id})
        if(userRole.role !== 'admin') return res.status(401).json({success : false , error:"only the admin can get the systme summary"});
        
        const users1 = await User.find();
        const groups1 = await Group.find();
        const comaplaints1 = await Complaint.find();

        const users = users1.length || 0
        const complaints = comaplaints1.length || 0;
        const groups = groups1.length || 0
        return res.status(200).json({success : true , users , groups , complaints})
    }  catch (error) {
        console.error( error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}


const editUserInfo = async(req,res) =>{
  try {
    
      const {newName , newEmail , oldPassword , newPassword } = req.body ;
      const {id} = req.params;
      let imagePath = null;
      if (req.file) {
        imagePath = `/uploads/${req.file.filename}`;
      }


      const user = await User.findById(id);
      if(!user) return res.status(404).json({success : false , message : "user not found "})

      const passwordCorrect = await bcrypt.compare(oldPassword , user.password )
      if(!passwordCorrect) return res.status(401).json({success : false  , message : "old password is not correct"})

      const newHashPassword = await bcrypt.hash(newPassword , 10);
      

      //sending verification link to the email 
      //the verification email route will be complete later 
      if(newEmail && newEmail !== user.email ){
            const userEmailExists = await User.findOne({email : newEmail})
            
            if(userEmailExists) return res.status(400).json({success : false , message : 'email already taken.'})
              
              const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false, // true if using port 465
                auth: {
                  user: process.env.EMAIL_USER,
                  pass: process.env.EMAIL_PASS,
                },
              });
              
              let token ;
              if(req.file){
                
                token = jwt.sign({_id : id , newName , newEmail , newHashPassword ,imagePath}  , process.env.JWT_SECRET, {
                  expiresIn: '1h'
                });
              }else{
                token = jwt.sign({_id : id , newName , newEmail , newHashPassword }  , process.env.JWT_SECRET, {
                  expiresIn: '1h'
                });
              }
              
              const verificationLink = `http://localhost:5000/api/user/verify-email?token=${token}`;

              const mailOptions = {
                from : process.env.EMAIL_USER ,
                to : newEmail ,
                subject: 'Verify your email',
                html: `
                  <h2>Welcome, ${newName}!</h2>
                  <p>Please verify your email by clicking the link below:</p>
                  <a href="${verificationLink}">${verificationLink}</a>
                  <p>This link will expire in 1 hour.</p>
                `,
              }
              
              await transporter.sendMail(mailOptions);


            return res.status(200).json({success : true , message : 'a verification link is sent to the new email '})
      }


      await User.findByIdAndUpdate({_id : id} , {
        name : newName ,
        email :newEmail ,
        password : newHashPassword , 
        profilePicture : imagePath
      })

      // console.log(imagePath)

      // const newUser = await Role.findOne({user : id}).populate("user" , "-password")
      const newUser = await User.findOne({_id : id});
      const role = await Role.findOne({user : id})

      return res.status(200).json({success:true ,
         newUser : {
                _id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: role.role ,
                profilePicture : newUser.profilePicture
            } })
    } catch (error) {
        console.error( error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}





const adminEditUserInfo = async (req, res) => {
  try {
    const { id } = req.params; // the admin performing the action
    const { userId, newName, newEmail, newPassword } = req.body;

    const isAdmin = await Role.findOne({ user: id });
    if (!isAdmin || isAdmin.role !== 'admin') {
      return res.status(401).json({ success: false, message: "Only the admin can edit user info" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Update user basic info
    const updatedFields = {
      name: newName,
      email: newEmail
    };

    if (newPassword) {
      const newHashedPassword = await bcrypt.hash(newPassword, 10);
      updatedFields.password = newHashedPassword;
    }

    await User.findByIdAndUpdate(userId, updatedFields);

    // Update permissions if provided
    // if (newPermissions) {
    //   const roleDoc = await Role.findOne({ user: userId });
    //   if (roleDoc) {
    //     // Update only valid permissions
    //     // const validPermissions = [
    //     //   "viewUsers",
    //     //   "editUsers",
    //     //   "deleteUsers",
    //     //   "viewComplaints",
    //     //   "manageComplaints",
    //     //   "assignRoles",
    //     //   "viewGroups",
    //     //   "editGroups",
    //     //   "removeUsersFromGroups"
    //     // ];


    //     validPermissions.forEach((perm) => {
    //       if (perm in newPermissions) {
    //         roleDoc.permissions[perm] = newPermissions[perm];
    //       }
    //     });

    //     await roleDoc.save();
    //   }
    // }

    const updatedUser = await User.findById(userId).select('-password');
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      updatedUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



const verifyEmailUpdate = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    console.log("Verifying token...");

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { _id, newName, newEmail, newHashPassword, imagePath } = decoded;

    await User.findByIdAndUpdate(_id, {
      name: newName,
      email: newEmail,
      password: newHashPassword,
      ...(imagePath && { profilePicture: imagePath })  // only set image if it's provided
    });

    const redirectUrl = `http://localhost:5173/email-verified?token=${token}`;
    return res.redirect(redirectUrl);

  } catch (error) {
    console.error('Verification error:', error.message);
    return res.status(400).json({ success: false, message: 'Invalid or expired token' });
  }
};



const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "ID must be provided" });
    }

    // Find the user through Role and populate user details
    const role = await Role.findOne({ user: id }).populate("user", "-password");
    if (!role || !role.user) {
      return res.status(404).json({ success: false, message: "User not found :(" });
    }

    // Fetch user's groups and complaints
    const groups = await Group.find({ users: id });
    const complaints = await Complaint.find({ userId: id });

    return res.status(200).json({
      success: true,
      user: role.user,     // only the populated user object
      role: role.role,     // role string (if needed)
      groups,
      complaints,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};


const sendOtp = async(req,res) =>{
  const {email} = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  //5 minutes
  const expiresAt = new Date(Date.now() + 5 *60 *1000);
  await OTP.create({
    email , 
    code :otp ,
    expiresAt
  });

  await sendEmail(email , `Your OTP is : ${otp}`)
  return res.status(200).json({success:true , message:"the OTP is sent to the email "})
}


const verifyOTP = async(req,res)=>{
  const {email , otp} = req.body ;
  const isCorrect = await OTP.findOne({email , code :otp , expiresAt : { $gt :new Date()}}).sort({createdAt : -1});
  if(!isCorrect) return res.status(400).json({success:false , message : "invalid or expired OTP"})
  
  const resetToken = uuidv4();
  await TempSession.create({ email, token: resetToken, expiresAt: new Date(Date.now() + 10 * 60 * 1000) }); // 10 min

  await OTP.deleteMany({ email });

  res.status(200).json({ success: true, message: "OTP verified" , email , token : resetToken});
}



const changeOTPPassword = async (req, res) => {
  try {
    const { email, newPassword , token } = req.body;

    const session = await TempSession.findOne({email , token});
    if(!session || session.expiresAt < new Date()){
      return res.status(400).json({ success: false, message: "Session expired or invalid" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    await TempSession.deleteMany({ email });

    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
    register ,
    login ,
    changeUserRole ,
    fetchUsers , 
    verifyEmail , 
    getAdminSummary , 
    editUserInfo , 
    getUserById ,
    verifyEmailUpdate ,
    adminEditUserInfo , 
    fetchUsersRoleEdition ,
    deleteUser ,
    sendOtp ,
    verifyOTP ,
    changeOTPPassword
};