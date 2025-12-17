import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from '../user/user.schema'; // Import class User của bạn

export type LinkedAccountDocument = LinkedAccount & Document;

@Schema({ timestamps: true, collection: 'linked_accounts' })
export class LinkedAccount {
    @Prop({ type: Types.ObjectId, ref: User.name, required: true })
    user: User;

    @Prop({ required: true, enum: ['google', 'facebook'] })
    provider: string;

    @Prop({ required: true })
    providerId: string; // Google ID (sub)

    @Prop({ required: true })
    accessToken: string; // Nên mã hóa

    @Prop()
    refreshToken: string; // Nên mã hóa
}

// Tạo index để tìm kiếm cho nhanh
export const LinkedAccountSchema = SchemaFactory.createForClass(LinkedAccount);
LinkedAccountSchema.index({ provider: 1, providerId: 1 }, { unique: true });
LinkedAccountSchema.index({ user: 1 });