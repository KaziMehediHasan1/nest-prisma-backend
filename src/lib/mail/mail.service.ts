import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Transporter, createTransport } from 'nodemailer';
import Mail from 'nodemailer/lib/mailer';
import { EmailSendEvent, EVENT_TYPES } from 'src/interfaces/event';

@Injectable()
export class MailService {
  private transport: Transporter;
  private readonly user: string;

  constructor(private readonly configService: ConfigService) {
    this.user = this.configService.getOrThrow<string>('USER');

    this.transport = createTransport({
      service: 'gmail',
      auth: {
        user: this.user,
        pass: this.configService.get<string>('PASS'),
      },
    });
  }

  async sendMail(
    email: string,
    subject: string,
    text: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.user,
      to: email,
      subject,
      text,
    };

    this.transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        Logger.error('Error sending plain email', err);
      } else {
        Logger.log('Plain email sent', JSON.stringify(data));
      }
    });
  }

  async sendHtmlMail(
    email: string,
    subject: string,
    html: string,
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.user,
      to: email,
      subject,
      html,
    };

    this.transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        Logger.error('Error sending HTML email', err);
      } else {
        Logger.log('HTML email sent', JSON.stringify(data));
      }
    });
  }

  async sendMailWithAttachments(
    email: string,
    subject: string,
    text: string,
    attachments: Mail.Attachment[],
  ): Promise<void> {
    const mailOptions: Mail.Options = {
      from: this.user,
      to: email,
      subject,
      text,
      attachments,
    };

    this.transport.sendMail(mailOptions, (err, data) => {
      if (err) {
        Logger.error('Error sending email with attachments', err);
      } else {
        Logger.log('Email with attachments sent', JSON.stringify(data));
      }
    });
  }

  @OnEvent(EVENT_TYPES.EMAIL_SEND)
  async handleEmailSend(payload: EmailSendEvent) {
    const { to, subject, text, html, attachments } = payload;

    if (html) {
      await this.sendHtmlMail(to, subject, html);
    } else if (attachments?.length) {
      await this.sendMailWithAttachments(to, subject, text || '', attachments);
    } else {
      await this.sendMail(to, subject, text || '');
    }
  }
}
