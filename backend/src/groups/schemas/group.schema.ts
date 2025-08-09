import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";




@Schema({timestamps : true})
export class Group{

    @Prop({unique : true ,  required: true })
    name : string;

    @Prop({type : [{type : Types.ObjectId , ref:"User"}] , default : []})
    users : Types.ObjectId[]
}
export type GroupDocument = Group & Document;
export const GroupSchema = SchemaFactory.createForClass(Group);