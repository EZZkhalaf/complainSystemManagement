import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { ref } from "process";


@Schema({timestamps : true})
export class ComplaintGroupsRule {
    @Prop({type : [{type : Types.ObjectId , ref : "Group"}] , default : []})
    groupsSequence : Types.ObjectId[]
}
export type ComplaintGroupsRuleDocument = ComplaintGroupsRule & Document;
export const ComplaintGroupsRuleSchema = SchemaFactory.createForClass(ComplaintGroupsRule);