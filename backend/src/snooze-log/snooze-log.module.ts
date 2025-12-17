import { Module } from '@nestjs/common';
import { SnoozeLogService } from './snooze-log.service';
import { SnoozeLogController } from './snooze-log.controller';
import { MongooseModule } from '@nestjs/mongoose/dist/mongoose.module';
import { MailModule } from 'src/mail/mail.module';
import { SnoozeLog, SnoozeLogSchema } from './entities/snooze-log.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SnoozeLog.name, schema: SnoozeLogSchema }]),
    MailModule,
  ],
  controllers: [SnoozeLogController],
  providers: [SnoozeLogService],
})
export class SnoozeLogModule { }
