import { Document } from "mongoose";
import {Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({timestamps : true})
export class TempSession extends Document{


    @Prop({
        required : true ,
        unique : true 
    })
    email : string

    @Prop({
        required : true ,
        unique : true
    })
    token : string

    @Prop({default : true})
    valid : boolean

    
}
export type TempSessionDocument = TempSession & Document;

export const TempSessionSchema = SchemaFactory.createForClass(TempSession)