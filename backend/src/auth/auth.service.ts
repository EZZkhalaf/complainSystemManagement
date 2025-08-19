import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import { MoreThan, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { GroupEntity } from '../groups/entities/group.entity';
import { LogsService } from '../logs/logs.service';
import { RolesEntity } from '../roles/entities/roles.entity';
import { UserEntity } from '../user/entities/user.entity';
import { sendEmail } from '../utils/email.util';
import { ChangeOtpPasswordDto } from './dtos/change-otp-password.dto';
import { LoginDto } from './dtos/login.dto';
import { RegisterDto } from './dtos/register.dto';
import { SendOtpDto } from './dtos/send-otp.dto';
import { OTPEntity } from './entities/OTP.entity';
import { TempSessionEntity } from './entities/tempSession.entity';


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
        


        @InjectRepository(UserEntity) private userRepo : Repository<UserEntity>,
        @InjectRepository(GroupEntity) private groupRepo : Repository<GroupEntity> ,
        @InjectRepository(RolesEntity) private readonly rolesRepo : Repository<RolesEntity>,
        @InjectRepository(OTPEntity) private otpRepo : Repository<OTPEntity>,
        @InjectRepository(TempSessionEntity) private tempSessionRepo : Repository<TempSessionEntity>
    ){}


    
    async register(registerDto : RegisterDto) : Promise<{message : string }>{
        const {name , email , password} = registerDto;

        const userExists = await this.userRepo.findOne({ where : {user_email : email}})
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
            const userExists = await this.userRepo.findOne({where : {user_email : email}})
            if(userExists)
                throw new BadRequestException("user already verified")



            const newUser =  this.userRepo.create({
                user_name : name ,
                user_email : email ,
                user_password : password ,
                profilePicture : ""
            })
            await this.userRepo.save(newUser)

            let roleDoc = await this.rolesRepo.findOne({where :{role_name : role} , relations : ['users']})

            if (roleDoc) {
            if (!roleDoc.users.some(user => user.user_id === newUser.user_id)) {
                roleDoc.users.push(newUser);
                await this.rolesRepo.save(roleDoc);
            }
            } else {
                const newRole =  this.rolesRepo.create({
                    role_name : role,
                    users: [newUser],
                });
                await this.rolesRepo.save(newRole)
            }

            await this.logsService.logAction(newUser , "Register" , "User" , newUser.user_id , "Created A New Account")

            return { message: 'Account verified and created successfully' };
        } catch (error) {
            throw new BadRequestException('Invalid or expired token');
        }
    }
    

    //done
    async login (loginDto : LoginDto ) : Promise<any>{
        
            const {email , password} = loginDto;

            // const user = await this.userModel.findOne({email:email}).lean() as interfaceUser | null;
            const user = await this.userRepo.findOne({where : {user_email : email}})
            if(!user)
                throw new NotFoundException("user not found ")

            const passIsValid = await bcrypt.compare(password, user.user_password);
            if (!passIsValid) {
                throw new BadRequestException("password incorrect");
            }



            const tempRole = await this.rolesRepo.createQueryBuilder("role_info")
                .leftJoinAndSelect('role_info.permissions' , 'permission_info')
                .leftJoin("role_info.users" , "user_info")
                .where("user_info.user_id = :userId" , {userId : user.user_id})
                .select([
                    "role_info.role_id" ,
                    "role_info.role_name" ,

                    "permission_info.permission_name"
                ]).getOne()

            if (!tempRole) {
                throw new NotFoundException("Role not found for user");
            }
            const group = await this.groupRepo.createQueryBuilder("group_info")
                .leftJoin("group_info.users" , "user_info")
                .where("user_info.user_id = :userId" , {userId : user.user_id})
                .getMany()
            const token = jwt.sign({_id : user.user_id , role : tempRole.role_name} , process.env.JWT_SECRET || "jsonwebtokensecret", {expiresIn : "10d"})
            
            

            await this.logsService.logAction(
                user ,
                "Login" 
                , "User" , 
                user.user_id , 
                "Logged In"
            )

            return {
                success: true,
                message: 'Login successful',
                token,
                user: {
                    _id: user.user_id,
                    name: user.user_name,
                    email: user.user_email,
                    role: tempRole.role_name,
                    group: group,
                    profilePicture: user.profilePicture,
                    permissions: tempRole.permissions,
                },
            };
        
    }

    
    async logout (res : Response){
        res.clearCookie('access_token',{
            httpOnly : true ,
            secure : process.env.NODE_ENV === 'production',
            sameSite : 'lax'
        })

        return { 
            success : true ,
            message : "logged out successfully "
        }
    }
    



    //later
    async sendOtp(sendOtpDto: SendOtpDto): Promise<{ success: boolean; message: string }> {
        const { email } = sendOtpDto;

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // await this.otpModel.create({
        //     email,
        //     code: otp,
        //     expiresAt,
        // });

        const tempOtp = this.otpRepo.create({
            email ,
            code : otp ,
            expiresAt ,
        })
        await this.otpRepo.save(tempOtp)

        await sendEmail(email , "your OTP ", `Your OTP is: ${otp}`);

        return {
        success: true,
        message: 'The OTP is sent to the email',
        };
    }



    async verifyOtp(email : string , otp : string ){
        

        const isCorrect = await this.otpRepo.findOne({
            where :{
                email ,
                code : otp ,
                expiresAt : MoreThan(new  Date())
            } , 
            order :{
                createdAt : "DESC"
            }
        })
        if(!isCorrect){
            throw new BadRequestException("invalid or expired OTP")
        }

        const resetToken = uuidv4();

        const f =  this.tempSessionRepo.create({
            email ,
            token : resetToken ,
            expiresAt : new Date(Date.now() + 10 * 60 * 1000)
        })

        await this.tempSessionRepo.save(f)
        await this.otpRepo.delete({email})
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

        // const session  = await this.tempSessionModel.findOne({email,token})
        const session = await this.tempSessionRepo.findOne({
            where : {
                email:email , 
                token : token
            }
        })
        if(!session || session.expiresAt < new Date()){
            // return { success: false, message: "Session expired or invalid" }
            throw new BadRequestException("Session expired or invalid")
        }

        // const user = await this.userModel.findOne({email})
        const user = await this.userRepo.findOne({
            where : {
                user_email : email
            }
        })
        if (!user) {
            // return { success: false, message: "User not found" }
            throw new BadRequestException("User not found")
        }

        const hashedPassword = await bcrypt.hash(newPassword , 10)

        user.user_password = hashedPassword;
        await this.userRepo.save(user)

        await this.tempSessionRepo.delete({email})

        this.logsService.logAction(user , "Change-Password" , "User" , user.user_id , "Changed the Password using forget password method ")

        return { success: true, message: "Password changed successfully" }
    }

    async fetchLoggedInUser(userId: string) {
        // const user = await this.userModel.findById(userId).select('-password');
        const parsedId = parseInt(userId, 10);
        if (isNaN(parsedId)) {
            throw new BadRequestException('Invalid user ID');
        }

        const user = await this.userRepo.findOne({
            where : {user_id : parsedId}
            ,relations : ['user_role' , 'user_role.permissions' , 'groups' , 'complaints']
        })
            
        if (!user) {
            throw new NotFoundException('User not found');
        }

        

        
        return {
            success: true,
            message: 'User data fetched successfully',
            user: {
            _id: user.user_id,
            name: user.user_name,
            email: user.user_email,
            profilePicture: user.profilePicture,
            role: user?.user_role.role_name || null,
            permissions: user?.user_role?.permissions || [],
            group: user.groups || [],
            complaints: user.complaints || [],
            },
        };
    }

}

