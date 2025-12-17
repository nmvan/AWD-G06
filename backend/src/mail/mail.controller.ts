import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SendEmailDto } from './dto/send-email.dto';
import { ModifyEmailDto } from './dto/modify-email.dto';
import { Response } from 'express';

@Controller('mail')
@UseGuards(JwtAuthGuard) // Bảo vệ toàn bộ endpoint, bắt buộc phải login
export class MailController {
  constructor(private readonly mailService: MailService) {}

  // Tìm kiếm Email (Fuzzy Search)
  @Get('search')
  searchEmails(@Req() req, @Query('q') query: string) {
    return this.mailService.searchEmailsFuzzy(req.user._id, query);
  }

  // Lấy danh sách hộp thư (mailboxes/labels)
  @Get('mailboxes')
  getMailboxes(@Req() req) {
    // req.user._id đến từ JwtStrategy
    return this.mailService.getMailboxes(req.user._id);
  }

  // Lấy danh sách Email trong hộp thư (mailbox/label)
  @Get('mailboxes/:labelId/emails')
  getEmails(
    @Req() req,
    @Param('labelId') labelId: string,
    @Query('limit') limit: string,
    @Query('pageToken') pageToken: string,
    @Query('search') search: string,
  ) {
    const limitNum = limit ? parseInt(limit) : 20;

    return this.mailService.getEmails(
      req.user._id,
      labelId,
      limitNum,
      pageToken,
      search,
    );
  }

  // Lấy chi tiết 1 Email
  @Get('emails/:id')
  getEmailDetail(@Req() req, @Param('id') messageId: string) {
    return this.mailService.getEmailDetail(req.user._id, messageId);
  }

  // Tải file đính kèm
  @Get('attachments/:messageId/:attachmentId')
  async getAttachment(
    @Req() req,
    @Param('messageId') messageId: string,
    @Param('attachmentId') attachmentId: string,
    @Res() res: Response, // Dùng @Res để tự control response trả về file
  ) {
    const file = await this.mailService.getAttachment(
      req.user._id,
      messageId,
      attachmentId,
    );

    // Set header để trình duyệt hiểu đây là file tải về
    res.set({
      'Content-Type': 'application/octet-stream',
      'Content-Disposition': `attachment; filename="attachment_${attachmentId}.dat"`,
      'Content-Length': file.size,
    });

    res.send(file.buffer);
  }

  // Gửi Email
  @Post('send')
  sendEmail(@Req() req, @Body() dto: SendEmailDto) {
    return this.mailService.sendEmail(
      req.user._id,
      dto.to,
      dto.subject,
      dto.body,
    );
  }

  // Thao tác Modify (Xóa, Đánh dấu đọc...)
  @Post('emails/:id/modify')
  modifyEmail(
    @Req() req,
    @Param('id') messageId: string,
    @Body() dto: ModifyEmailDto,
  ) {
    return this.mailService.modifyEmail(
      req.user._id,
      messageId,
      dto.addLabels || [],
      dto.removeLabels || [],
    );
  }

  // Reply Email
  @Post('emails/:id/reply')
  replyEmail(
    @Req() req,
    @Param('id') originalMessageId: string,
    @Body('body') body: string,
  ) {
    return this.mailService.replyEmail(req.user._id, originalMessageId, body);
  }

  // forward Email
  @Post('emails/:id/forward')
  forwardEmail(
    @Req() req,
    @Param('id') originalMessageId: string,
    @Body() dto: SendEmailDto,
  ) {
    return this.mailService.forwardEmail(
      req.user._id,
      originalMessageId,
      dto.to,
      dto.body,
    );
  }

  @Get('emails/:id/summary')
  async getEmailSummary(@Req() req, @Param('id') messageId: string) {
    const summary = await this.mailService.summarizeEmail(
      req.user._id,
      messageId,
    );
    return {
      id: messageId,
      summary: summary,
    };
  }
}
