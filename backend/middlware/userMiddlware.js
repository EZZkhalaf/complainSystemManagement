

// const jwt = require('jsonwebtoken');
// const User = require('../model/User');

// const userMiddleware = async (req, res, next) => {
//   try {
//     const token = req.headers.authorization?.split(' ')[1];
//     if (!token) {
//       return res.status(401).json({ message: 'Unauthorized' });
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     if (!decoded) {
//       return res.status(401).json({ message: 'Invalid token' });
//     }

//     const user = await User.findById(decoded._id)
//     .select('-password')
//     .populate({
//       path : "role" ,

//     });
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     req.user = user;

//     next();
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json({ message: 'Server error' });
//   }
// };

// module.exports = userMiddleware;



const jwt = require('jsonwebtoken');
const User = require('../model/User');
const Role = require('../model/Role');

const userMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the user's role by matching user ID inside the role's user array
    const role = await Role.findOne({ user: user._id })
      .select('-user') // exclude user array from role to reduce size
      .populate('permissions');

    req.user = {
      ...user.toObject(),
      permissions: role?.permissions || [],
      role: role?.role || 'user',
    };

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = userMiddleware;
