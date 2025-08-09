import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ref } from "process";


@Schema({timestamps : true})
export class Role extends Document{
    @Prop({type : [{type : Types.ObjectId , ref : "User"}] , default : []})
    user : Types.ObjectId[]

    @Prop({required : true , default : "user" , unique:true})
    role : string

    @Prop({type : [{type : Types.ObjectId , ref:"Permission"}] , default : []})
    permissions: Types.ObjectId[]
}

export type RoleDocument = Role & Document;
export const RoleSchema = SchemaFactory.createForClass(Role);