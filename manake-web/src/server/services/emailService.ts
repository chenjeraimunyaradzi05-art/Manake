/**
 * Email Service
 * Handles sending transactional emails using Nodemailer
 * Supports SMTP (development) and can be extended for SendGrid/SES
 */
import nodemailer, { Transporter } from "nodemailer";
import { env, isDevelopment } from "../config/env";
import { logger } from "../utils/logger";

// Email template types
export type EmailTemplate =
  | "welcome"
  | "password-reset"
  | "email-verification"
  | "contact-notification"
  | "mentorship-request"
  | "connection-request";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface TemplateData {
  name?: string;
  resetLink?: string;
  verificationLink?: string;
  contactEmail?: string;
  contactName?: string;
  contactMessage?: string;
  mentorName?: string;
  menteeName?: string;
  connectionName?: string;
  [key: string]: string | undefined;
}

class EmailService {
  private transporter: Transporter | null = null;
  private fromEmail: string;
  private fromName: string = "Manake Rehabilitation Center";

  constructor() {
    this.fromEmail = env.FROM_EMAIL || "noreply@manake.org";
    this.initializeTransporter();
  }

  private initializeTransporter(): void {
    // Check if SMTP is configured
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 587,
        secure: env.SMTP_PORT === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
      logger.info("Email service initialized with SMTP");
    } else if (isDevelopment) {
      // In development, create a test account with Ethereal
      this.createTestAccount();
    } else {
      logger.warn(
        "Email service not configured - emails will be logged only",
      );
    }
  }

  private async createTestAccount(): Promise<void> {
    try {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      logger.info("Email service initialized with Ethereal test account", {
        user: testAccount.user,
      });
    } catch (error) {
      logger.warn("Failed to create Ethereal test account", { error });
    }
  }

  /**
   * Send an email
   */
  async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const { to, subject, html, text } = options;

    // If no transporter, log the email instead
    if (!this.transporter) {
      logger.info("Email (not sent - no transporter configured)", {
        to,
        subject,
        preview: html.substring(0, 200),
      });
      return { success: true, messageId: "logged-only" };
    }

    try {
      const info = await this.transporter.sendMail({
        from: `"${this.fromName}" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html),
      });

      logger.info("Email sent successfully", {
        messageId: info.messageId,
        to,
        subject,
      });

      // Get preview URL for Ethereal emails (development)
      const previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
      if (previewUrl) {
        logger.info("Preview URL:", { url: previewUrl });
      }

      return {
        success: true,
        messageId: info.messageId,
        previewUrl,
      };
    } catch (error) {
      logger.error("Failed to send email", { error, to, subject });
      return { success: false };
    }
  }

  /**
   * Send a templated email
   */
  async sendTemplate(
    template: EmailTemplate,
    to: string,
    data: TemplateData,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const { subject, html } = this.getTemplate(template, data);
    return this.send({ to, subject, html });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(
    to: string,
    resetToken: string,
    userName?: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    return this.sendTemplate("password-reset", to, {
      name: userName || "there",
      resetLink,
    });
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(
    to: string,
    verificationToken: string,
    userName?: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    const verificationLink = `${env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    return this.sendTemplate("email-verification", to, {
      name: userName || "there",
      verificationLink,
    });
  }

  /**
   * Send welcome email after registration
   */
  async sendWelcome(
    to: string,
    userName: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    return this.sendTemplate("welcome", to, { name: userName });
  }

  /**
   * Send contact form notification to admin
   */
  async sendContactNotification(
    contactEmail: string,
    contactName: string,
    contactMessage: string,
    subject?: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    // Send to admin email (could be configured separately)
    const adminEmail = env.FROM_EMAIL || "admin@manake.org";
    return this.sendTemplate("contact-notification", adminEmail, {
      contactEmail,
      contactName,
      contactMessage,
      contactSubject: subject || "General Inquiry",
    });
  }

  /**
   * Send mentorship request notification
   */
  async sendMentorshipRequest(
    mentorEmail: string,
    mentorName: string,
    menteeName: string,
    message?: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    return this.sendTemplate("mentorship-request", mentorEmail, {
      mentorName,
      menteeName,
      message: message || "I would like to connect with you as a mentor.",
    });
  }

  /**
   * Send connection request notification
   */
  async sendConnectionRequest(
    to: string,
    recipientName: string,
    senderName: string,
  ): Promise<{ success: boolean; messageId?: string; previewUrl?: string }> {
    return this.sendTemplate("connection-request", to, {
      name: recipientName,
      connectionName: senderName,
    });
  }

  /**
   * Get email template
   */
  private getTemplate(
    template: EmailTemplate,
    data: TemplateData,
  ): { subject: string; html: string } {
    const templates: Record<EmailTemplate, { subject: string; html: string }> = {
      welcome: {
        subject: "Welcome to Manake Rehabilitation Center",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Manake</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Welcome to Manake</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.name},</p>
              <p>Welcome to the Manake community! We're honored to have you join us on this journey of healing and recovery.</p>
              <p>Here's what you can do next:</p>
              <ul>
                <li>Complete your profile to connect with others</li>
                <li>Explore success stories from our community</li>
                <li>Find a mentor or become one</li>
                <li>Join support groups</li>
              </ul>
              <p>Remember, every step forward is a victory. We're here to support you.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.FRONTEND_URL}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Get Started</a>
              </div>
              <p>With hope and support,<br>The Manake Team</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>Manake Rehabilitation Center, Harare, Zimbabwe</p>
              <p>Empowering youth through recovery and hope</p>
            </div>
          </body>
          </html>
        `,
      },
      "password-reset": {
        subject: "Reset Your Manake Password",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Password Reset</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.name},</p>
              <p>We received a request to reset your password. Click the button below to create a new password:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.resetLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
              </div>
              <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
              <p>Stay strong,<br>The Manake Team</p>
            </div>
            <div style="text-align: center; padding: 20px; color: #6b7280; font-size: 12px;">
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${data.resetLink}</p>
            </div>
          </body>
          </html>
        `,
      },
      "email-verification": {
        subject: "Verify Your Email - Manake",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Verify Your Email</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.name},</p>
              <p>Please verify your email address to complete your registration:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${data.verificationLink}" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">Verify Email</a>
              </div>
              <p>Welcome to the journey,<br>The Manake Team</p>
            </div>
          </body>
          </html>
        `,
      },
      "contact-notification": {
        subject: `New Contact Form Submission: ${data.contactSubject || "General Inquiry"}`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Contact Form Submission</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #1f2937; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 18px;">New Contact Form Submission</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>From:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.contactName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${data.contactEmail}">${data.contactEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Subject:</strong></td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${data.contactSubject || "General Inquiry"}</td>
                </tr>
              </table>
              <div style="margin-top: 20px; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #059669;">
                <p style="margin: 0;"><strong>Message:</strong></p>
                <p style="margin: 10px 0 0 0; white-space: pre-wrap;">${data.contactMessage}</p>
              </div>
              <div style="text-align: center; margin-top: 20px;">
                <a href="mailto:${data.contactEmail}?subject=Re: ${data.contactSubject || "Your inquiry to Manake"}" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reply to ${data.contactName}</a>
              </div>
            </div>
          </body>
          </html>
        `,
      },
      "mentorship-request": {
        subject: "New Mentorship Request - Manake",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Mentorship Request</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Mentorship Request</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.mentorName},</p>
              <p><strong>${data.menteeName}</strong> would like to connect with you as their mentor.</p>
              <div style="margin: 20px 0; padding: 15px; background: white; border-radius: 5px; border-left: 4px solid #059669;">
                <p style="margin: 0; font-style: italic;">"${data.message}"</p>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.FRONTEND_URL}/mentorship/requests" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
              </div>
              <p>Your guidance makes a difference,<br>The Manake Team</p>
            </div>
          </body>
          </html>
        `,
      },
      "connection-request": {
        subject: "New Connection Request - Manake",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Connection Request</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #059669 0%, #0d9488 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">New Connection</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
              <p>Hi ${data.name},</p>
              <p><strong>${data.connectionName}</strong> wants to connect with you on Manake.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${env.FRONTEND_URL}/network/requests" style="background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">View Request</a>
              </div>
              <p>Building community together,<br>The Manake Team</p>
            </div>
          </body>
          </html>
        `,
      },
    };

    return templates[template];
  }

  /**
   * Convert HTML to plain text (simple implementation)
   */
  private htmlToText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  /**
   * Verify transporter connection
   */
  async verifyConnection(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
