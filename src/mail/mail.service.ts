import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';
import { UserResponse } from 'src/user/type/userResponse';


@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) { }

  async mailConfirm(mail: string) {
    try {
      console.log('send e,eail to', mail)
      await this.mailerService.sendMail({
        to: mail,
        subject: 'Welcome to Lotos! Confirm your Email',
        template: './activate'
      });
    } catch {}
  }

  async codeSend(user: Partial<UserResponse>, title: string, text: string) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: title,
      template: './sendCode',
      context: {
        code: user.secretCode,
        text: text,
      },
    });
  }

  async resetPassword(user: Partial<User>, token: string) {
    const link = process.env.FRONTEND_URL + '/reset-password?token=' + token;
    await this.mailerService.sendMail({
      to: user.email,
      subject: 'Reset password',
      template: './reset',
      context: {
        linkRestore: link,
      },
    });
  }
}
