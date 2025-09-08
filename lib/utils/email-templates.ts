/**
 * Email Rendering Utilities for Auth
 * ==================================
 * Centralized email template generation for authentication flows
 */

import { BRAND_CONFIG } from "@/lib/config/brand";

export interface EmailTemplateData {
  recipientName?: string;
  recipientEmail: string;
  actionUrl?: string;
  verificationCode?: string;
  expiryMinutes?: number;
}

/**
 * Base email template wrapper
 */
function createBaseTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email from ${BRAND_CONFIG.APP_NAME}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      padding: 40px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid #e1e8ed;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.5px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      color: #667eea;
      margin-bottom: 10px;
    }
    .header p {
      color: #7f8c8d;
      margin: 0;
      font-size: 16px;
    }
    .content {
      margin-bottom: 30px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 16px 32px;
      text-decoration: none;
      border-radius: 8px;
      font-weight: 600;
      font-size: 16px;
      text-align: center;
      margin: 20px 0;
    }
    .code {
      background-color: #f8f9fa;
      border: 2px dashed #667eea;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }
    .code-text {
      font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
      font-size: 32px;
      font-weight: bold;
      color: #667eea;
      letter-spacing: 6px;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #e1e8ed;
      color: #7f8c8d;
      font-size: 14px;
    }
    .footer h4 {
      color: #2c3e50;
      margin: 0 0 10px 0;
      font-size: 18px;
      font-weight: 600;
    }
    .footer a {
      color: #3498db;
      text-decoration: none;
      font-weight: 600;
    }
    .copyright {
      color: #95a5a6;
      font-size: 12px;
      margin: 20px 0 0 0;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✨ ${BRAND_CONFIG.APP_NAME}</h1>
      <p>${BRAND_CONFIG.MARKETING_TAGLINE}</p>
    </div>
    
    ${content}
    
    <div class="footer">
      <div style="margin-bottom: 20px;">
        <h4>Need Help?</h4>
        <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
          Contact us at: <a href="mailto:${BRAND_CONFIG.SUPPORT_EMAIL}">${BRAND_CONFIG.SUPPORT_EMAIL}</a>
        </p>
      </div>
      <p class="copyright">
        Thank you for choosing ${BRAND_CONFIG.APP_NAME}! 🌟<br>
        ${BRAND_CONFIG.COPYRIGHT_TEXT}
      </p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Email verification template
 */
export function createEmailVerificationTemplate(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Verify Your Email Address</h2>
      <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
      <p>Thank you for signing up with ${BRAND_CONFIG.APP_NAME}! To complete your account setup, please verify your email address by clicking the button below:</p>
      
      ${data.actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${data.actionUrl}" style="color: #3498db; word-break: break-all;">${data.actionUrl}</a>
        </p>
      ` : ''}
      
      <p style="font-size: 14px; color: #e74c3c; margin-top: 20px;">
        <strong>Important:</strong> This link will expire in ${data.expiryMinutes || 60} minutes for security reasons.
      </p>
    </div>`;

  return createBaseTemplate(content);
}

/**
 * Password reset template
 */
export function createPasswordResetTemplate(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Reset Your Password</h2>
      <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
      <p>We received a request to reset the password for your ${BRAND_CONFIG.APP_NAME} account. If you made this request, click the button below to set a new password:</p>
      
      ${data.actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl}" class="button">Reset Password</a>
        </div>
        
        <p style="font-size: 14px; color: #7f8c8d;">
          If the button doesn't work, you can copy and paste this link into your browser:<br>
          <a href="${data.actionUrl}" style="color: #3498db; word-break: break-all;">${data.actionUrl}</a>
        </p>
      ` : ''}
      
      <p style="font-size: 14px; color: #e74c3c; margin-top: 20px;">
        <strong>Important:</strong> This link will expire in ${data.expiryMinutes || 60} minutes for security reasons.
      </p>
      
      <p style="font-size: 14px; color: #7f8c8d;">
        If you didn't request a password reset, please ignore this email or contact our support team if you have concerns.
      </p>
    </div>`;

  return createBaseTemplate(content);
}

/**
 * OTP verification template
 */
export function createOtpVerificationTemplate(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Your Verification Code</h2>
      <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
      <p>Here's your verification code for ${BRAND_CONFIG.APP_NAME}:</p>
      
      ${data.verificationCode ? `
        <div class="code">
          <div class="code-text">${data.verificationCode}</div>
          <p style="margin: 10px 0 0 0; color: #7f8c8d; font-size: 14px;">
            Enter this code to complete your verification
          </p>
        </div>
      ` : ''}
      
      <p style="font-size: 14px; color: #e74c3c; margin-top: 20px;">
        <strong>Important:</strong> This code will expire in ${data.expiryMinutes || 10} minutes for security reasons.
      </p>
      
      <p style="font-size: 14px; color: #7f8c8d;">
        If you didn't request this code, please ignore this email or contact our support team.
      </p>
    </div>`;

  return createBaseTemplate(content);
}

/**
 * Welcome email template
 */
export function createWelcomeEmailTemplate(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Welcome to ${BRAND_CONFIG.APP_NAME}!</h2>
      <p>Hello ${data.recipientName || 'there'},</p>
      <p>Welcome to ${BRAND_CONFIG.APP_NAME}! We're thrilled to have you join our community of fragrance enthusiasts.</p>
      
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #2c3e50; margin: 0 0 15px 0;">What's next?</h3>
        <ul style="margin: 0; padding-left: 20px; color: #495057;">
          <li>Explore our premium fragrance collections</li>
          <li>Set up your fragrance preferences</li>
          <li>Get personalized recommendations</li>
          <li>Enjoy exclusive member benefits</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${BRAND_CONFIG.BASE_URL}/products" class="button">Start Shopping</a>
      </div>
    </div>`;

  return createBaseTemplate(content);
}

/**
 * Account confirmation template
 */
export function createAccountConfirmationTemplate(data: EmailTemplateData): string {
  const content = `
    <div class="content">
      <h2 style="color: #27ae60; margin-bottom: 20px;">✅ Account Confirmed!</h2>
      <p>Hello ${data.recipientName || 'there'},</p>
      <p>Great news! Your ${BRAND_CONFIG.APP_NAME} account has been successfully confirmed and is now active.</p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${BRAND_CONFIG.BASE_URL}/auth/login" class="button">Sign In to Your Account</a>
      </div>
      
      <p>You can now enjoy all the benefits of being a ${BRAND_CONFIG.APP_NAME} member!</p>
    </div>`;

  return createBaseTemplate(content);
}

/**
 * Generic notification template
 */
export function createNotificationTemplate(
  title: string, 
  message: string, 
  data: EmailTemplateData
): string {
  const content = `
    <div class="content">
      <h2 style="color: #2c3e50; margin-bottom: 20px;">${title}</h2>
      <p>Hello${data.recipientName ? ` ${data.recipientName}` : ''},</p>
      <p>${message}</p>
      
      ${data.actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
          <a href="${data.actionUrl}" class="button">Take Action</a>
        </div>
      ` : ''}
    </div>`;

  return createBaseTemplate(content);
}