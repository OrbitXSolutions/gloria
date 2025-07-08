"use server";

import { createSafeActionClient } from "next-safe-action";
import { z } from "zod";
import { createEmailTransporter, generateContactEmailHTML } from "@/lib/email";
import { actionClientWithRateLimit } from "@/lib/middleware/rate-limit";

// Create the safe action client

// Define the input schema with Zod
const contactFormSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be less than 50 characters")
    .trim(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be less than 50 characters")
    .trim(),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .max(100, "Email must be less than 100 characters")
    .trim()
    .toLowerCase(),
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject must be less than 200 characters")
    .trim(),
  message: z
    .string()
    .min(10, "Message must be at least 10 characters long")
    .max(2000, "Message must be less than 2000 characters")
    .trim(),
});

// Server action for sending contact email
export const sendContactEmail = actionClientWithRateLimit
  .schema(contactFormSchema)
  .action(async ({ parsedInput }) => {
    try {
      // Validate environment variables
      if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASSWORD
      ) {
        throw new Error("Email configuration is missing");
      }

      const { firstName, lastName, email, subject, message } = parsedInput;

      // Create email transporter
      const transporter = createEmailTransporter();

      // Verify connection
      await transporter.verify();

      // Prepare email content
      const mailOptions = {
        from: process.env.SMTP_USER,
        to: process.env.SMTP_USER, // Send to your support email
        replyTo: email, // Allow replying directly to the customer
        subject: `Contact Form: ${subject}`,
        html: generateContactEmailHTML({
          firstName,
          lastName,
          email,
          subject,
          message,
        }),
      };

      // Send email
      await transporter.sendMail(mailOptions);

      return {
        success: true,
        message: "Thank you for your message! We'll get back to you soon.",
      };
    } catch (error) {
      console.error("Error sending contact email:", error);

      // Return a user-friendly error message
      throw new Error(
        error instanceof Error && error.message.includes("configuration")
          ? "Email service is currently unavailable. Please try again later."
          : "Failed to send email. Please try again later."
      );
    }
  });

// Export the input type for TypeScript
export type ContactFormInput = z.infer<typeof contactFormSchema>;
