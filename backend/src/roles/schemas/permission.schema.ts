import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";


@Schema({timestamps : true})
export class Permission extends Document{

    @Prop({required : true , unique : true})
    name : string ;


    @Prop()
    description : string 


}

export type PermissionDocument = Permission & Document;
export const PremissionSchema = SchemaFactory.createForClass(Permission)