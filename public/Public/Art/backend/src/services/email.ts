import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  initialize() {
    // Configure email transporter
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    logger.info('Email service initialized');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      return false;
    }

    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_FROM || 'noreply@bitart.market',
        to: Array.isArray(options.to) ? options.to.join(', ') : options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.htmlToText(options.html),
      });

      logger.info(`Email sent: ${info.messageId}`);
      return true;
    } catch (error) {
      logger.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, username: string): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: 'Welcome to BitArt Market! 🎨',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Welcome to BitArt Market!</h1>
          <p>Hello ${username},</p>
          <p>Thank you for joining BitArt Market, the premier NFT marketplace on Base blockchain.</p>
          <p>You can now:</p>
          <ul>
            <li>Create and mint your own NFTs</li>
            <li>Buy and sell digital art</li>
            <li>Participate in auctions</li>
            <li>Follow your favorite creators</li>
          </ul>
          <p>Happy creating!</p>
          <p style="margin-top: 30px; color: #666;">
            Best regards,<br>
            The BitArt Market Team
          </p>
        </div>
      `,
    });
  }

  /**
   * Send NFT sale notification
   */
  async sendSaleNotification(
    email: string,
    nftName: string,
    price: string,
    buyerName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Your NFT "${nftName}" has been sold! 🎉`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Congratulations!</h1>
          <p>Your NFT <strong>"${nftName}"</strong> has been sold for <strong>${price}</strong>.</p>
          <p>Buyer: ${buyerName}</p>
          <p>The funds will be transferred to your wallet shortly.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/profile/sales" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Sale Details
            </a>
          </p>
        </div>
      `,
    });
  }

  /**
   * Send purchase confirmation
   */
  async sendPurchaseConfirmation(
    email: string,
    nftName: string,
    price: string,
    sellerName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `Purchase Confirmed: ${nftName} 🎨`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Purchase Successful!</h1>
          <p>You have successfully purchased <strong>"${nftName}"</strong> for <strong>${price}</strong>.</p>
          <p>Seller: ${sellerName}</p>
          <p>The NFT has been transferred to your wallet.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/profile/collection" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Collection
            </a>
          </p>
        </div>
      `,
    });
  }

  /**
   * Send bid notification
   */
  async sendBidNotification(
    email: string,
    nftName: string,
    bidAmount: string,
    bidderName: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `New Bid on "${nftName}" 💰`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #F59E0B;">New Bid Received!</h1>
          <p>Someone placed a bid on your NFT <strong>"${nftName}"</strong>.</p>
          <p>Bid Amount: <strong>${bidAmount}</strong></p>
          <p>Bidder: ${bidderName}</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/auction/${nftName}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Auction
            </a>
          </p>
        </div>
      `,
    });
  }

  /**
   * Send auction won notification
   */
  async sendAuctionWonNotification(
    email: string,
    nftName: string,
    winningBid: string
  ): Promise<boolean> {
    return this.sendEmail({
      to: email,
      subject: `You Won the Auction for "${nftName}"! 🏆`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #10B981;">Congratulations!</h1>
          <p>You won the auction for <strong>"${nftName}"</strong>!</p>
          <p>Your winning bid: <strong>${winningBid}</strong></p>
          <p>The NFT will be transferred to your wallet shortly.</p>
          <p style="margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL}/profile/collection" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Your Collection
            </a>
          </p>
        </div>
      `,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    email: string,
    resetToken: string
  ): Promise<boolean> {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    return this.sendEmail({
      to: email,
      subject: 'Reset Your Password 🔐',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #4F46E5;">Password Reset Request</h1>
          <p>You requested to reset your password. Click the button below to proceed:</p>
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request this, please ignore this email.
          </p>
        </div>
      `,
    });
  }

  /**
   * Simple HTML to text converter
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }
}

export const emailService = new EmailService();
