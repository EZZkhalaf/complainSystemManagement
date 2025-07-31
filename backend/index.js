const express  = require("express")
const cors = require('cors');
const dotenv = require('dotenv')
const app = express();
const mongoose = require("mongoose");
const path = require('path');



app.use(express.json());
dotenv.config();

const authRouter = require('./routes/auth.js');
const groupRouter = require('./routes/groups.js');
const complaintRouter = require('./routes/complaints.js');
const userRouter = require('./routes/users.js');
const roleRouter = require("./routes/roles.js")


app.use(cors({
    origin : '*' ,
    credentials:true
}));


app.use(express.static(path.join(__dirname, 'public')));


mongoose.connect(process.env.CONNECTION_STRING)
  .then(() => console.log(" MongoDB connected..."))
  .catch((err) => console.error(" MongoDB connection error:", err));

const port = process.env.PORT || 5000;


app.use("/api/auth" , authRouter)
app.use("/api/user", userRouter);
app.use("/api/group" , groupRouter)
app.use("/api/complaints", complaintRouter);
app.use("/api/role", roleRouter);


const swagger = require('./swagger')

swagger(app)
app.listen(port , () => {
    console.log('running on port 5000');
})