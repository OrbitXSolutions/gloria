import { createTransport } from "nodemailer";

export const createEmailTransporter = () => {
  return createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      ciphers: "SSLv3",
      rejectUnauthorized: false,
    },
  });
};

export const generateContactEmailHTML = (data: {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px;">
        New Contact Form Submission
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Contact Information</h3>
        <p><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Subject:</strong> ${data.subject}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px;">
        <h3 style="color: #495057; margin-top: 0;">Message</h3>
        <p style="line-height: 1.6; color: #333;">${data.message.replace(
          /\n/g,
          "<br>"
        )}</p>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #e7f3ff; border-left: 4px solid #007bff;">
        <p style="margin: 0; color: #004085;">
          <strong>Note:</strong> You can reply directly to this email to respond to the customer.
        </p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
      <p style="color: #6c757d; font-size: 12px; text-align: center;">
        This email was sent from the Eleva Boutique contact form.
      </p>
    </div>
  `;
};
