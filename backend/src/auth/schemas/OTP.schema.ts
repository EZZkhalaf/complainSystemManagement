import { Document } from "mongoose";
import {Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({timestamps : true})
export class OTP extends Document{

    @Prop({required : true})
    email : string 

    @Prop({required : true})
    code : string

    @Prop({required : true})
    expiresAt : Date

    @Prop({default : false})
    verified : boolean
}

export const OTPSchema = SchemaFactory.createForClass(OTP);


OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
