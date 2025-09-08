/**
 * Email Service Integration
 * =========================
 * Integrates email templates with actual email sending for auth flows
 */

import nodemailer from 'nodemailer';
import { BRAND_CONFIG } from '@/lib/config/brand';
import {
  createEmailVerificationTemplate,
  createPasswordResetTemplate,
  createOtpVerificationTemplate,
  createWelcomeEmailTemplate,
  createAccountConfirmationTemplate,
  EmailTemplateData
} from '@/lib/utils/email-templates';

// Email transporter configuration
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

async function sendEmail({ to, subject, html, from }: SendEmailOptions) {
  const transporter = createTransporter();
  
  const mailOptions = {
    from: from || `"${BRAND_CONFIG.APP_NAME}" <${BRAND_CONFIG.SALES_EMAIL}>`,
    to,
    subject: `${BRAND_CONFIG.APP_NAME} - ${subject}`,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function sendVerificationEmail(data: EmailTemplateData) {
  const html = createEmailVerificationTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: 'Verify Your Email Address',
    html,
  });
}

export async function sendPasswordResetEmail(data: EmailTemplateData) {
  const html = createPasswordResetTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: 'Reset Your Password',
    html,
  });
}

export async function sendOtpEmail(data: EmailTemplateData) {
  const html = createOtpVerificationTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: 'Your Verification Code',
    html,
  });
}

export async function sendWelcomeEmail(data: EmailTemplateData) {
  const html = createWelcomeEmailTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: 'Welcome to Gloria Natural!',
    html,
  });
}

export async function sendAccountConfirmationEmail(data: EmailTemplateData) {
  const html = createAccountConfirmationTemplate(data);
  return sendEmail({
    to: data.recipientEmail,
    subject: 'Account Confirmed!',
    html,
  });
}