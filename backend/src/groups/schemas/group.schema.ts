import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";



export type GroupDocument = Group & Document;

@Schema({timestamps : true})
export class Group{

    @Prop({unique : true ,  required: true })
    name : string;

    @Prop({type : [{type : Types.ObjectId , ref:"User"}] , default : []})
    users : Types.ObjectId[]
}

export const GroupSchema = SchemaFactory.createForClass(Group);