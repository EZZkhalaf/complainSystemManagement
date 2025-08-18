
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { LogsService } from '../logs/logs.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { GroupEntity } from '../groups/entities/group.entity';
import { RolesEntity } from '../roles/entities/roles.entity';
import { OTPEntity } from './entities/OTP.entity';
import { TempSessionEntity } from './entities/tempSession.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import * as nodemailer from 'nodemailer';
import * as sendEmail  from '../utils/email.util';
import { mock } from 'node:test';

jest.mock("bcrypt", () => ({
  compare : jest.fn(),
  hash : jest.fn()
}));
jest.mock("jsonwebtoken", () => ({
  sign : jest.fn() ,
  verify : jest.fn()
}));
jest.mock("nodemailer");

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { 
    findOne: jest.Mock ,
    create : jest.Mock,
    save : jest.Mock
  };
  let rolesRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock,
    createQueryBuilder:jest.Mock
  }

  let otpRepo : {
    findOne : jest.Mock,
    create : jest.Mock ,
    save : jest.Mock,
    createQueryBuilder:jest.Mock,
    delete : jest.Mock
  }

  let groupsRepo :{
    createQueryBuilder : jest.Mock
  }
  let  logsService : {
    logAction : jest.Mock
  }

  let tempSessionRepo : {
    create : jest.Mock ,
    findOne : jest.Mock ,
    save : jest.Mock ,
    delete : jest.Mock
  }

  beforeEach(async () => {
    userRepo = { 
      findOne: jest.fn() ,
      create : jest.fn() ,
      save : jest.fn(),
    };
    rolesRepo = {
      findOne : jest.fn(),
      create: jest.fn(),
      save : jest.fn(),
      createQueryBuilder : jest.fn()
    }

    otpRepo = {
      findOne : jest.fn(),
      create: jest.fn(),
      save : jest.fn(),
      createQueryBuilder : jest.fn(),
      delete : jest.fn()
    }

    logsService = {logAction : jest.fn()}

    groupsRepo = {
      createQueryBuilder : jest.fn()
    }

    tempSessionRepo = {
      create : jest.fn() ,
      findOne : jest.fn() ,
      save : jest.fn() ,
      delete : jest.fn()
    }

    jest.spyOn(sendEmail , "sendEmail").mockResolvedValue(undefined)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: LogsService, useValue: logsService },
        { provide: getRepositoryToken(UserEntity), useValue: userRepo },
        { provide: getRepositoryToken(GroupEntity), useValue: groupsRepo },
        { provide: getRepositoryToken(RolesEntity), useValue: rolesRepo },
        { provide: getRepositoryToken(OTPEntity), useValue: otpRepo },
        { provide: getRepositoryToken(TempSessionEntity), useValue: tempSessionRepo },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  //register service
  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it("should throw error when the email exists", async () => {
    userRepo.findOne.mockResolvedValue({ id: 1, user_email: "test@gmail.com" });

    await expect(
      service.register({ name: "ezz", email: 'test2@gmail.com', password: '123456' })
    ).rejects.toThrow(BadRequestException);
  });
  it("should hash the password, assign a token, and send email", async () => {
    userRepo.findOne.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue("hashed_password");
    (jwt.sign as jest.Mock).mockReturnValue("assigned_token");

    const sendMailMock = jest.fn().mockResolvedValue(true);
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const result = await service.register({
      name: "ezz",
      email: "test@gmail.com",
      password: "123456"
    });

    expect(bcrypt.hash).toHaveBeenCalledWith("123456", 10);
    expect(jwt.sign).toHaveBeenCalled();
    expect(sendMailMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'test@gmail.com',
        subject: 'Verify your email'
      })
    );

    expect(result).toEqual({ message: 'Verification email sent.' });
  });


  //verify  email token after register
  it("should throw new error if the token is invalid " , async()=>{
    (jwt.verify as jest.Mock).mockImplementation(()=> {
      throw new Error("invalid token")
    })

    await expect(service.verifyEmail("bad_token")).rejects.toThrow(BadRequestException)
  })
  it("should throw error when the user email exists" , async() => {
    (jwt.verify as jest.Mock).mockReturnValue({
      name : "ezz",
      email : "test@gmail.com" ,
      password : "hashedPass" ,
      role : "user"
    })

    userRepo.findOne.mockResolvedValue({user_id : 1 , user_email : "test@gmail.com"})
    await expect(service.verifyEmail("valid_token")).rejects.toThrow("Invalid or expired token")
  })
  it("should create a new user , assign the role , add it to the log action and return success" , async()=>{
    const fakeDecodedData = {
      name : "ezz",
      email : "test@gmail.com" ,
      password : "hashedPassword",
      role : "user"
    };

    (jwt.verify as jest.Mock).mockReturnValue(fakeDecodedData)
    
    userRepo.findOne.mockResolvedValue(null);
    userRepo.create.mockReturnValue({user_id : 1 , ...fakeDecodedData})
    userRepo.save.mockResolvedValue({user_id : 1 , ...fakeDecodedData})

    rolesRepo.findOne.mockResolvedValue(null);
    rolesRepo.create.mockReturnValue({role_id : 1 , role_name : "user" , users : []})
    rolesRepo.save.mockResolvedValue(true)

    const result =  await service.verifyEmail("valid_token")

    expect(userRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({user_name : "ezz" , user_email : "test@gmail.com"})
    )
    expect(userRepo.save).toHaveBeenCalled();
    expect(rolesRepo.create).toHaveBeenCalled();
    expect(rolesRepo.save).toHaveBeenCalled();
    expect(logsService.logAction).toHaveBeenCalledWith(
      expect.any(Object),
      "Register" ,
      "User" ,
      expect.any(Number),
      "Created A New Account"
    )

    expect(result).toEqual({ message: "Account verified and created successfully" })
  })


  //login service 
  it("should return an error when the user email doesnt exists " , async()=>{
    userRepo.findOne.mockResolvedValue(null);

    await expect(
      service.login({email : "test@gmail.com" , password : "123456"})
    ).rejects.toThrow(NotFoundException)
  })
  it("should throw error when password incorrect" , async() => {
    userRepo.findOne.mockResolvedValue({user_id : 1 , user_password : 'hashed'});
    (bcrypt.compare as jest.Mock).mockResolvedValue(false)

    await expect(
      service.login({email : "test@gmail.com" , password : "notHashed"})
    ).rejects.toThrow("password incorrect")
    
  })
  it("should throw error when role not found ", async()=>{

    userRepo.findOne.mockResolvedValue({user_id: 1 , user_password : "123456"})
    // (bcrypt.compare as jest.Mock).mockResolvedValue(true)
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true);
    jest.spyOn(jwt, 'sign').mockReturnValue('fake-token');
    jest.spyOn(bcrypt, 'compare').mockImplementation((p, h) => p === h);

    const mockDbQ = {
      leftJoinAndSelect : jest.fn().mockReturnThis(),
      leftJoin : jest.fn().mockReturnThis(),
      where : jest.fn().mockReturnThis() ,
      select : jest.fn().mockReturnThis() ,
      getOne:jest.fn().mockResolvedValue(null)
    }
    rolesRepo.createQueryBuilder.mockReturnValue(mockDbQ);

    await expect(
      service.login({email : "test@gmail.com" , password : "123456"})
    ).rejects.toThrow("Role not found for user")
  })
  it("should return login success" , async() => {
    const user = {
      user_id : 1 ,
      user_name : "ezz" ,
      useR_email : "ezz@gmail.com",
      user_password : "123456" , 
      profilePicture : ""
    }

    userRepo.findOne.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true)

    const mockRoleQB = {
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        leftJoin: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({
          role_id: 1,
          role_name: 'user',
          permissions: [{ permission_name: 'READ' }]
        }) 
    };
    rolesRepo.createQueryBuilder.mockReturnValue(mockRoleQB)


    const mockGroupQB = {
      leftJoin : jest.fn().mockReturnThis() ,
      where : jest.fn().mockReturnThis(),
      getMany : jest.fn().mockResolvedValue([{group_id : 1 , group_name : 'test name'}]) 
    }

    groupsRepo.createQueryBuilder.mockReturnValue(mockGroupQB)
    const result= await service.login({email : "ezz@gmail.com" , password : "123456"})
  
    expect(result.success).toBe(true);
    expect(result.token).toBe("fake-token");
    expect(result.user.role).toBe("user")
    expect(logsService.logAction).toHaveBeenCalledWith(user , 'Login' , 'User' , 1 , 'Logged In')
  })


  //send otp 
  it("should generate otp and save it and then send it to the email and return success" , async() => {
    const dto = {email : "test@gmail.com"}
    const mockOtpEntity = {id : 1 , ...dto , code:'123456' , expiresAt : new Date()}

    otpRepo.create.mockReturnValue(mockOtpEntity)
    otpRepo.save.mockResolvedValue(mockOtpEntity);

    const result = await service.sendOtp(dto)

    expect(otpRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email : dto.email ,
        code : expect.any(String),
        expiresAt : expect.any(Date)
      })
    )

    expect(otpRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({
        email : dto.email ,
        code : expect.any(String),
        expiresAt : expect.any(Date)
      })
    )

    expect(sendEmail.sendEmail).toHaveBeenCalledWith(
      dto.email ,
      'your OTP ' ,
      expect.stringContaining('Your OTP is: ')
    )
    expect(result).toEqual({
      success : true , 
      message : 'The OTP is sent to the email'
    })
  })


  //verify OTP
  it("should throw an error if the otp is not valid " , async()=>{
    otpRepo.findOne.mockResolvedValue(null)

    await expect(service.verifyOtp("test@gmail.com" , '99999')).rejects.toThrow(
      new BadRequestException("invalid or expired OTP")
    )
  })
  it("should verify otp , create session , delete OTP , and return success" , async() =>{
    const email = "test@gmail.com"
    const otp =  "123456"
    const mockOtpEntity = {id : 1 , email , code : otp , expiresAt : new Date()}

    otpRepo.findOne.mockResolvedValue(mockOtpEntity)
    tempSessionRepo.create.mockReturnValue({email , token :"fixed-token"})
    tempSessionRepo.save.mockResolvedValue(undefined)
    otpRepo.delete.mockResolvedValue(undefined)

    const result = await service.verifyOtp(email,otp)

    expect(otpRepo.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where : expect.objectContaining({email , code : otp}),
        order : {createdAt : "DESC"}
      })
    )

    expect(tempSessionRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email , 
        token : expect.any(String),
        expiresAt : expect.any(Date)
      })
    )

    expect(tempSessionRepo.save).toHaveBeenCalled();
    expect(otpRepo.delete).toHaveBeenCalledWith({email})

    expect(result).toEqual({
      success : true ,
      message: 'OTP verified',
      email,
      token: expect.any(String),
      statusCode: 200,
    })
  })


  //change password 
  it("should throw new error when the the session is not found " , async() =>{
    const dto ={
      email : "test@gmail.com" ,
      newPassword : "123456",
      token : "expired-token"
    }
    tempSessionRepo.findOne.mockResolvedValue({
      email : dto.email ,
      token : dto.token ,
      expiresAt : new Date(Date.now() - 1000)
    })
    
    

    await expect(service.changeOTPPassword(dto)).rejects.toThrow(
      new BadRequestException("Session expired or invalid")
    )
    expect(tempSessionRepo.findOne).toHaveBeenCalledWith({
      where : {email : dto.email , token : dto.token}
    })
  })
  it("should throw new error when no user found " , async() =>{
     const dto ={
        email : "test@gmail.com" ,
        newPassword : "123456",
        token : "expired-token"
      }

      tempSessionRepo.findOne.mockResolvedValue({
      email : dto.email ,
      token : dto.token ,
      expiresAt : new Date(Date.now() + 1000 * 60)
    })
      userRepo.findOne.mockResolvedValue(null)

      await expect(service.changeOTPPassword(dto)).rejects.toThrow(
        new BadRequestException("User not found")
      )

      expect(userRepo.findOne).toHaveBeenCalledWith({
        where : {user_email : dto.email}
      })
  })
  it("it finds the user and change his password , save it , delete the email session , send a natification email , and return success " , async() => {
    const dto ={
      email : "test@gmail.com",
      newPassword : "newPass",
      token : "validToken"
    }

    tempSessionRepo.findOne.mockResolvedValue({
      email : dto.email ,
      token : dto.token ,
      expiresAt : new Date(Date.now() +1000 *60)
    })

    const mockUser = { user_id : 1 , user_email : dto.email , user_password : "oldPass"}
    userRepo.findOne.mockResolvedValue(mockUser)

    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashedPassword');

    userRepo.save.mockResolvedValue({...mockUser , user_password : 'newPass'})
    tempSessionRepo.delete.mockResolvedValue(undefined)

    const result = await service.changeOTPPassword(dto);

    expect(tempSessionRepo.findOne).toHaveBeenCalledWith({
      where  :{email : dto.email , token : dto.token}
    })

    expect(userRepo.findOne).toHaveBeenCalledWith({
      where : {user_email : dto.email}
    })
    expect(bcrypt.hash).toHaveBeenCalledWith(dto.newPassword , 10)
    expect(userRepo.save).toHaveBeenCalledWith({
      ...mockUser ,
      user_password : 'hashedPassword'
    })

    expect(tempSessionRepo.delete).toHaveBeenCalledWith({email : dto.email})
    expect(logsService.logAction).toHaveBeenCalledWith(
      mockUser , 
      'Change-Password' ,
      'User' ,
      mockUser.user_id,
      'Changed the Password using forget password method '
    )

    expect(result).toEqual({
      success : true , 
      message: 'Password changed successfully'
    })
  })

  //fetch logged in user 
  it("should throw an error when the user is not found" , async() => {
    const userId = "1234"
    userRepo.findOne.mockResolvedValue(null)
    await expect(service.fetchLoggedInUser(userId)).rejects.toThrow(
      new NotFoundException('User not found')
    )
  })
});
