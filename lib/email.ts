import { createTransport } from "nodemailer";
import { OrderWithItems } from "@/lib/types/database.types";
import { formatPrice } from "@/lib/common/cart";

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
        This email was sent from the Gloria Naturals contact form.
      </p>
    </div>
  `;
};

export const generateCustomerOrderConfirmationHTML = (data: {
  order: OrderWithItems;
  customerName: string;
  customerEmail: string;
}) => {
  const orderItems = data.order.order_items || [];
  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  // Use the shipping field from the order if available, otherwise calculate it
  const shipping =
    (data.order as any).shipping || (data.order.total_price || 0) - subtotal;
  const total = data.order.total_price || 0;

  // Get currency from the first product (assuming all products have the same currency)
  const currency = orderItems[0]?.product?.currency_code
    ? {
        code: orderItems[0].product.currency_code,
      }
    : { code: "AED" };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8f9fa; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin: 0; font-size: 28px;">Order Confirmation</h1>
          <p style="color: #666; margin: 10px 0 0 0;">Thank you for your order!</p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
          <h3 style="color: #333; margin-top: 0;">Order Details</h3>
          <p><strong>Order Code:</strong> ${data.order.code}</p>
          <p><strong>Order Date:</strong> ${new Date(
            data.order.created_at || ""
          ).toLocaleDateString()}</p>
          <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
        </div>
        
        <div style="margin-bottom: 25px;">
          <h3 style="color: #333;">Order Items</h3>
          ${orderItems
            .map(
              (item) => `
            <div style="border-bottom: 1px solid #eee; padding: 15px 0;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <h4 style="margin: 0; color: #333;">${
                    item.product?.name_en || "Product"
                  }</h4>
                  <p style="margin: 5px 0; color: #666;">Quantity: ${
                    item.quantity
                  }</p>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-weight: bold; color: #333;">${formatPrice(
                    item.price
                  )}</p>
                </div>
              </div>
            </div>
          `
            )
            .join("")}
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin-bottom: 25px;">
          <h3 style="color: #333; margin-top: 0;">Order Summary</h3>
                     <div style="display: flex; justify-content: space-between; margin: 10px 0;">
             <span>Subtotal:</span>
             <span>${formatPrice(subtotal, currency)}</span>
           </div>
           <div style="display: flex; justify-content: space-between; margin: 10px 0;">
             <span>Shipping:</span>
             <span>${formatPrice(shipping, currency)}</span>
           </div>
           <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
           <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 18px;">
             <span>Total:</span>
             <span>${formatPrice(total, currency)}</span>
           </div>
        </div>
        
        <div style="background-color: #e7f3ff; padding: 20px; border-radius: 5px; border-left: 4px solid #007bff;">
          <h3 style="color: #333; margin-top: 0;">What's Next?</h3>
          <p style="margin: 0; color: #004085;">
            We're processing your order and will send you updates on the shipping status. 
            You can track your order using the order code: <strong>${
              data.order.code
            }</strong>
          </p>
        </div>
        
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
        <p style="color: #6c757d; font-size: 12px; text-align: center;">
          Thank you for choosing Gloria Naturals!<br>
          If you have any questions, please contact us at support@gloria-naturals.net
        </p>
      </div>
    </div>
  `;
};

export const generateAdminOrderNotificationHTML = (data: {
  order: OrderWithItems;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
}) => {
  const orderItems = data.order.order_items || [];
  const subtotal = orderItems.reduce(
    (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
    0
  );
  // Use the shipping field from the order if available, otherwise calculate it
  const shipping =
    (data.order as any).shipping || (data.order.total_price || 0) - subtotal;
  const total = data.order.total_price || 0;

  // Get currency from the first product (assuming all products have the same currency)
  const currency = orderItems[0]?.product?.currency_code
    ? {
        code: orderItems[0].product.currency_code,
      }
    : { code: "AED" };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
        🛒 New Order Received
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Order Information</h3>
        <p><strong>Order Code:</strong> ${data.order.code}</p>
        <p><strong>Order Date:</strong> ${new Date(
          data.order.created_at || ""
        ).toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
        <p><strong>Payment Method:</strong> ${
          data.order.payment_method || "Cash on Delivery"
        }</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        ${
          data.order.user_note
            ? `<p><strong>Customer Notes:</strong> ${data.order.user_note}</p>`
            : ""
        }
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Order Items</h3>
        ${orderItems
          .map(
            (item) => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0; color: #333;">${
                  item.product?.name_en || "Product"
                }</h4>
                <p style="margin: 5px 0; color: #666;">SKU: ${
                  item.product?.sku || "N/A"
                } | Quantity: ${item.quantity}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; color: #333;">${formatPrice(
                  item.price,
                  currency
                )}</p>
              </div>
            </div>
          </div>
        `
          )
          .join("")}
      </div>
      
      <div style="background-color: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
        <h3 style="color: #495057; margin-top: 0;">Order Summary</h3>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span>Subtotal:</span>
          <span>${formatPrice(subtotal, currency)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 10px 0;">
          <span>Shipping:</span>
          <span>${formatPrice(shipping, currency)}</span>
        </div>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
        <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 18px;">
          <span>Total:</span>
          <span style="color: #dc3545;">${formatPrice(total, currency)}</span>
        </div>
      </div>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #d1ecf1; border-left: 4px solid #17a2b8;">
        <p style="margin: 0; color: #0c5460;">
          <strong>Action Required:</strong> Please process this order and update the status in your admin panel.
        </p>
      </div>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #dee2e6;">
      <p style="color: #6c757d; font-size: 12px; text-align: center;">
        This notification was sent from the Gloria Naturals order system.
      </p>
    </div>
  `;
};
