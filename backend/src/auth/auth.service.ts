import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { User, UserDocument } from 'src/user/schemas/user.schema';
import { RegisterDto } from './dtos/register.dto';
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'
import * as nodemailer from 'nodemailer'
import { LoginDto } from './dtos/login.dto';
import { Group, GroupDocument } from 'src/groups/schemas/group.schema';
import { OTP, OTPDocument } from './schemas/OTP.schema';
import { SendOtpDto } from './dtos/send-otp.dto';
import { sendEmail } from 'src/utils/email.util';
import { TempSession, TempSessionDocument } from './schemas/tempSession.schema';
import { v4 as uuidv4 } from 'uuid';
import { ChangeOtpPasswordDto } from './dtos/change-otp-password.dto';
import { LogsService } from 'src/logs/logs.service';
import { Response } from 'express';
import { Complaint, ComplaintDocument } from 'src/complaint/schemas/complaint.schema';


interface interfaceUser {
                    _id: string
                    name: string
                    email: string
                    password : string
                    role: string
                    group: string
                    profilePicture: string
                    permissions: Object[]
                }

@Injectable()
export class AuthService {
    constructor(
        private readonly logsService : LogsService,
        @InjectModel(User.name) private userModel = Model<UserDocument> ,
        @InjectModel(Role.name) private roleModel = Model<RoleDocument> ,
        @InjectModel(Group.name) private groupModel = Model<GroupDocument> ,
        @InjectModel(OTP.name) private otpModel = Model<OTPDocument> , 
        @InjectModel(TempSession.name) private tempSessionModel = Model<TempSessionDocument>,
        @InjectModel(Complaint.name) private complaintModel = Model<ComplaintDocument>
    ){}

    async register(registerDto : RegisterDto) : Promise<{message : string }>{
        const {name , email , password} = registerDto;

        const userExists = await this.userModel.findOne({email : email})
        if(userExists)
            throw new BadRequestException("user already exists")
        
        const hashedPassword = await bcrypt.hash(password , 10);
        const role = "user"

        const token = jwt.sign(
            {name , email , password : hashedPassword , role} ,
            process.env.JWT_SECRET || "jsonwebtokensecret",
            {expiresIn  :'1h'}
        )

        const verificationLink = `http://localhost:5000/api/auth/verify-email?token=${token}`;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

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

        return { message: 'Verification email sent.' };

    }


    async verifyEmail(token : string ):Promise<{message : string}>{
        try {
            const decoded = jwt.verify(token , process.env.JWT_SECRET || "jsonwebtokensecret") as {
                name : string ,
                email : string ,
                password : string ,
                role : string ,
            }

            const {name , email , password , role } = decoded;
            const userExists = await this.userModel.findOne({email : email})
            if(userExists)
                throw new BadRequestException("user already verified")

            const newUser = await this.userModel.create({
                name,
                email,
                password,
                profilePicture: '',
            });

            await newUser.save();

            let roleDoc = await this.roleModel.findOne({ role });

            if (roleDoc) {
            if (!roleDoc.user.includes(newUser._id)) {
                roleDoc.user.push(newUser._id);
                await roleDoc.save();
            }
            } else {
            const newRole = await this.roleModel.create({
                role,
                user: [newUser._id],
            });
            await newRole.save();
            }

            await this.logsService.logAction(newUser , "Register" , "User" , newUser._id , "Created A New Account")

            return { message: 'Account verified and created successfully' };
        } catch (error) {
            throw new BadRequestException('Invalid or expired token');
        }
    }
    

    async login (loginDto : LoginDto ) : Promise<any>{
        try {
            const {email , password} = loginDto;

            const user = await this.userModel.findOne({email:email}).lean() as interfaceUser | null;
            if(!user)
                throw new NotFoundException("user not found ")

            const passIsValid = await bcrypt.compare(password, user.password);
            if (!passIsValid) {
                throw new BadRequestException("password incorrect");
            }


            const tempRole = await this.roleModel
                .findOne({ user: user._id })
                .select("-user")
                .populate("permissions", "-description");

            if (!tempRole) {
                throw new NotFoundException("Role not found for user");
            }
            const group = await this.groupModel.find({users : user._id});

            const token = jwt.sign({_id : user._id , role : tempRole.role} , process.env.JWT_SECRET || "jsonwebtokensecret", {expiresIn : "10d"})
            
            

            await this.logsService.logAction(
                user ,
                "Login" 
                , "User" , 
                user._id , 
                "Logged In"
            )

            return {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: tempRole.role,
                    group: group,
                    profilePicture: user.profilePicture,
                    permissions: tempRole.permissions,
                },
            };
        }catch (error) {
            console.log(error)
            throw new BadRequestException('error cant login');
        }
    }

    async logout (res : Response){
        res.clearCookie('token',{
            httpOnly : true ,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'lax'
        })

        return { 
            success : true ,
            message : "logged out successfully "
        }
    }
    
    async sendOtp(sendOtpDto: SendOtpDto): Promise<{ success: boolean; message: string }> {
        const { email } = sendOtpDto;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        await this.otpModel.create({
            email,
            code: otp,
            expiresAt,
        });

        await sendEmail(email , "your OTP ", `Your OTP is: ${otp}`);

        return {
        success: true,
        message: 'The OTP is sent to the email',
        };
    }

    async verifyOtp(email : string , otp : string ){
        // const isCorrect = await this.otpModel.findOne({email , code : otp , expiresAt : {$gt : new Date()}}).sort({createdAt : -1})
        console.log(otp)
        const isCorrect = await this.otpModel.findOne(
            { email, code: otp, expiresAt: { $gt: new Date() } },
            null,
            { sort: { createdAt: -1 } }
        );
        if(!isCorrect){
            throw new BadRequestException("invalid or expired OTP")
        }

        const resetToken = uuidv4();
        const f = await this.tempSessionModel.create({
            email , 
            token : resetToken ,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
        })

        const f2 = await this.otpModel.deleteMany({email})
        return {
            success: true,
            message: 'OTP verified',
            email,
            token: resetToken,
            statusCode: 200
        };
    }

    async changeOTPPassword( changeOtpPasswordDto : ChangeOtpPasswordDto){
        const {email , newPassword , token } = changeOtpPasswordDto;

        const session  = await this.tempSessionModel.findOne({email,token})
        if(!session || session.expiresAt < new Date()){
            return { success: false, message: "Session expired or invalid" }
        }

        const user = await this.userModel.findOne({email})
        if (!user) {
            return { success: false, message: "User not found" }
        }

        const hashedPassword = await bcrypt.hash(newPassword , 10)

        user.password = hashedPassword;
        await user.save()

        await this.tempSessionModel.deleteMany({email});

        this.logsService.logAction(user , "Change-Password" , "User" , user._id , "Changed the Password using forget password method ")

        return { success: true, message: "Password changed successfully" }
    }

    async fetchLoggedInUser(userId: string) {
        const user = await this.userModel.findById(userId).select('-password');
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const role = await this.roleModel
            .findOne({ user: userId })
            .select('-user')
            .populate('permissions', '-description')

        const groups = await this.groupModel.find({ users: userId });

        const complaints = await this.complaintModel.find({ userId: userId });

        return {
            success: true,
            message: 'User data fetched successfully',
            user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            profilePicture: user.profilePicture,
            role: role?.role || null,
            permissions: role?.permissions || [],
            group: groups || [],
            complaints: complaints || [],
            },
        };
        }

}

