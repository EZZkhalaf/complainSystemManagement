import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

@Schema({timestamps : {createdAt : true}})
export class Complaint extends Document{

    @Prop({type : Types.ObjectId , ref : "User" , required : true})
    userId : Types.ObjectId;

    @Prop({type : String , default : 'no description provided'})
    description : string ;

    @Prop({type : [{type: Types.ObjectId , ref : "Group"}] , default : [] })
    groupsQueue : Types.ObjectId[]

    @Prop({
        type : String , 
        enum : ['pending' , 'in-progress' , "resolved" , "rejected"] ,
        default : "pending"
    })
    status : string;

    @Prop({
        type : String ,
        enum : ['general , technical' , 'billing' , 'other'] , 
        default : 'general'
    })
    type : string;

    @Prop({ type: Date, default: Date.now })
    createdAt: Date;
}

export const ComplaintSchema = SchemaFactory.createForClass(Complaint);