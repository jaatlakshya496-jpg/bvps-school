declare module "nodemailer" {
  export interface Transporter {
    sendMail(mailOptions: Transporter.SendMailOptions): Promise<Transporter.SentMessageInfo>;
    verify(): Promise<void>;
  }
  export interface SendMailOptions {
    from?: string;
    to?: string;
    replyTo?: string;
    subject?: string;
    text?: string;
    html?: string;
  }
  export interface SentMessageInfo {
    messageId?: string;
  }
}