const User = require('../model/User.js');
const Role = require('../model/Role.js');
const Group = require("../model/Group.js")
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Complaint = require('../model/Complaint.js');
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

    const newRole = new Role({ user: newUser._id, 
      role: role || 'user', 
      permissions : defaultPermissions[role ||"user"]
    });
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
          return res.status(404).json({ success : false ,message: 'User not found' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        
        if(!isPasswordValid)return res.status(400).json({success: false, message: 'wrong password' });
        
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


        const role = await Role.findOne({ user: userId });
        if (!role) {
            const addUserRole = new Role({
                user: userId,
                role: newRole,
                permissions : defaultPermissions[newRole]
            });
            await addUserRole.save();
            return res.status(201).json({ success : true ,message: 'User role added successfully', role: addUserRole });
        }

        role.role = newRole;
        role.permissions = defaultPermissions[newRole]
        await role.save();

        res.status(200).json({ message: 'User role updated successfully', role  });
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
        return res.status(200).json({success : true , users})
    } catch (error) {
        console.error('Error changing user role:', error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}



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

      const newUser = await Role.findOne({user : id}).populate("user" , "-password")
      return res.status(200).json({success:true ,
         newUser : {
                _id: newUser.user._id,
                name: newUser.user.name,
                email: newUser.user.email,
                role: newUser.role ,
                profilePicture : newUser.user.profilePicture
            } })
    } catch (error) {
        console.error( error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}


// const adminEditUserInfo = async(req,res) =>{
//   try {
//     const {id} = req.params ;
//     const {userId , newName , newEmail , newPassword ,  newPermissions} = req.body ;





//     const isAdmin = await Role.findOne({user : id})
//     if(isAdmin.role !== 'admin'){
//       return res.status(401).json({success : false , message : "only the admin or the user can edit info"})
//     }

//     const user = await User.findById(userId);
//     if(!user) return res.status(404).json({success : false , message : "user not found"});

//     if(!newPassword){
//       await User.findByIdAndUpdate({_id : userId} , {
//         name : newName ,
//         email : newEmail ,

//       })
//     }else{
//       const newHashedPassword = await bcrypt.hash(newPassword , 10);
//       await User.findByIdAndUpdate({_id : userId} , {
//         name : newName ,
//         email : newEmail ,
//         password : newHashedPassword
//       })
//     }

//     const updatedUser = await User.findById(userId).select('-password')
//     return res.status(200).json({success : true , message:"user updated successfuly" , updatedUser})
//   } catch (error) {
//         console.error( error);
//         res.status(500).json({ success : false , message: 'Server error' });
//     }
// }


const adminEditUserInfo = async (req, res) => {
  try {
    const { id } = req.params; // the admin performing the action
    const { userId, newName, newEmail, newPassword, newPermissions } = req.body;

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
    if (newPermissions) {
      const roleDoc = await Role.findOne({ user: userId });
      if (roleDoc) {
        // Update only valid permissions
        const validPermissions = [
          "viewUsers",
          "editUsers",
          "deleteComplaints",
          "viewGroups",
          "assignRoles",
          "removeUsersFromGroups"
        ];

        validPermissions.forEach((perm) => {
          if (perm in newPermissions) {
            roleDoc.permissions[perm] = newPermissions[perm];
          }
        });

        await roleDoc.save();
      }
    }

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



const getUserById = async(req,res)=>{
  try {
    const {id} = req.params ;
    if(!id) return res.status(400).json({success : false , message : "id need to be provided"})

      const user = await Role.findOne({user:id}).populate("user" , '-password')
      if(!user) return res.status(404).json({success : false , message : "user not found :("})
        const groups = await Group.find({users : id})
      const complaints = await Complaint.find({userId : id})
        return res.status(200).json({success : true , user , groups , complaints})
  } catch (error) {
        console.error( error);
        res.status(500).json({ success : false , message: 'Server error' });
    }
}

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
    adminEditUserInfo
};