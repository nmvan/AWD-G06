// src/mail/entities/email-summary.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmailSummaryDocument = EmailSummary & Document;

@Schema({ timestamps: true })
export class EmailSummary {
    @Prop({ required: true, unique: true, index: true })
    messageId: string;

    @Prop({ required: true })
    summary: string;

    @Prop()
    originalContentShort: string;
}

export const EmailSummarySchema = SchemaFactory.createForClass(EmailSummary);