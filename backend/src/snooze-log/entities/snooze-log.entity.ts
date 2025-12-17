// src/snooze-log/entities/snooze-log.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SnoozeLogDocument = SnoozeLog & Document;

@Schema({ timestamps: true })
export class SnoozeLog {
    @Prop({ required: true })
    userId: string;

    @Prop({ required: true })
    messageId: string;

    @Prop({ required: true })
    wakeUpTime: Date;

    @Prop({ default: 'ACTIVE' })
    status: string; // 'ACTIVE' | 'PROCESSED' | 'CANCELLED'
}

export const SnoozeLogSchema = SchemaFactory.createForClass(SnoozeLog);