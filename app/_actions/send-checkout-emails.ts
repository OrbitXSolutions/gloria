"use server";

import { createEmailTransporter, generateCustomerOrderConfirmationHTML, generateAdminOrderNotificationHTML } from "@/lib/email";
import { ADMIN_EMAILS } from "@/lib/constants/contact-info";
import { OrderWithItems } from "@/lib/types/database.types";

interface SendCheckoutEmailsParams {
    order: OrderWithItems;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
}

export async function sendCheckoutNotificationEmails({
    order,
    customerName,
    customerEmail,
    customerPhone,
}: SendCheckoutEmailsParams) {
    try {
        // Validate environment variables
        if (
            !process.env.SMTP_HOST ||
            !process.env.SMTP_USER ||
            !process.env.SMTP_PASSWORD
        ) {
            console.error("Email configuration is missing");
            return { success: false, error: "Email configuration is missing" };
        }

        // Create email transporter
        const transporter = createEmailTransporter();

        // Verify connection
        await transporter.verify();

        // Send customer confirmation email
        const customerMailOptions = {
            from: process.env.SMTP_USER,
            to: customerEmail,
            subject: `Order Confirmation - ${order.code}`,
            html: generateCustomerOrderConfirmationHTML({
                order,
                customerName,
                customerEmail,
            }),
        };

        // Send admin notification emails to all admins
        const adminMailOptions = ADMIN_EMAILS.map(adminEmail => ({
            from: process.env.SMTP_USER,
            to: adminEmail,
            subject: `New Order Received - ${order.code}`,
            html: generateAdminOrderNotificationHTML({
                order,
                customerName,
                customerEmail,
                customerPhone,
            }),
        }));

        // Send customer email and all admin emails
        const emailPromises = [
            transporter.sendMail(customerMailOptions),
            ...adminMailOptions.map(mailOption => transporter.sendMail(mailOption))
        ];

        const emailResults = await Promise.allSettled(emailPromises);

        // Check email sending results
        const customerResult = emailResults[0];
        const adminResults = emailResults.slice(1);

        const customerSuccess = customerResult.status === 'fulfilled';
        const adminSuccessCount = adminResults.filter(result => result.status === 'fulfilled').length;
        const allAdminsSuccess = adminSuccessCount === ADMIN_EMAILS.length;

        if (customerSuccess && allAdminsSuccess) {
            return {
                success: true,
                message: "Checkout notification emails sent successfully to customer and all admins",
            };
        } else {
            console.error("Email sending results:", {
                customerResult,
                adminResults,
                adminSuccessCount,
                totalAdmins: ADMIN_EMAILS.length
            });
            return {
                success: false,
                error: "Some emails failed to send",
                details: {
                    customerEmail: customerSuccess ? 'sent' : 'failed',
                    adminEmails: `${adminSuccessCount}/${ADMIN_EMAILS.length} sent`,
                },
            };
        }
    } catch (error) {
        console.error("Error sending checkout notification emails:", error);

        // Return a user-friendly error message
        return {
            success: false,
            error: "Failed to send notification emails. Please try again later.",
        };
    }
} 