import { PartialType } from '@nestjs/mapped-types';
import { CreateSnoozeLogDto } from './create-snooze-log.dto';

export class UpdateSnoozeLogDto extends PartialType(CreateSnoozeLogDto) {}
