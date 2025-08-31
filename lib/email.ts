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
        This email was sent from the Eleva Boutique contact form.
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
  const subtotal = orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  // Use the shipping field from the order if available, otherwise calculate it
  const shipping = (data.order as any).shipping || (data.order.total_price || 0) - subtotal;
  const total = data.order.total_price || 0;

  // Get currency from the first product (assuming all products have the same currency)
  const currency = orderItems[0]?.product?.currency_code ? {
    code: orderItems[0].product.currency_code
  } : { code: 'AED' };

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f5f7fa; padding: 20px;">
      <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        
        <!-- Header with Brand -->
        <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e1e8ed;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #667eea; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">✨ Eleva Boutique</h1>
          </div>
          <h2 style="color: #2c3e50; margin: 10px 0 0 0; font-size: 24px; font-weight: 600;">Order Confirmation</h2>
          <p style="color: #7f8c8d; margin: 8px 0 0 0; font-size: 16px;">Thank you for your order, ${data.customerName}!</p>
        </div>
        
        <!-- Order Details Card -->
        <div style="background: linear-gradient(135deg, #f8fbff 0%, #f1f7ff 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #3498db;">
          <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #3498db; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">📋</span>
            Order Details
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px; font-weight: 500;">Order Code</p>
              <p style="margin: 5px 0 0 0; color: #2c3e50; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; background-color: #ecf0f1; padding: 8px 12px; border-radius: 6px; display: inline-block;">${data.order.code}</p>
            </div>
            <div>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px; font-weight: 500;">Order Date</p>
              <p style="margin: 5px 0 0 0; color: #2c3e50; font-size: 16px; font-weight: 600;">${new Date(data.order.created_at || '').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div style="margin-top: 20px;">
            <p style="margin: 0; color: #7f8c8d; font-size: 14px; font-weight: 500;">Status</p>
            <p style="margin: 5px 0 0 0;">
              <span style="background-color: #27ae60; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block;">
                ✅ Confirmed
              </span>
            </p>
          </div>
        </div>
        
        <!-- Payment Method Highlight -->
        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 20px; border-radius: 10px; margin-bottom: 30px; border-left: 5px solid #f39c12; text-align: center;">
          <h3 style="color: #d68910; margin: 0 0 10px 0; font-size: 18px; font-weight: 600; display: flex; align-items: center; justify-content: center;">
            <span style="background-color: #f39c12; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">💰</span>
            Payment Method
          </h3>
          <p style="margin: 0; color: #b7950b; font-size: 16px; font-weight: 600;">
            🚚 Cash on Delivery (COD)
          </p>
          <p style="margin: 8px 0 0 0; color: #85650d; font-size: 14px;">
            Pay when your order is delivered to your doorstep
          </p>
        </div>
        
        <!-- Order Items -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #2c3e50; margin-bottom: 20px; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #9b59b6; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">🛍️</span>
            Your Items
          </h3>
          <div style="background-color: #fafbfc; border-radius: 10px; overflow: hidden; border: 1px solid #e1e8ed;">
            ${orderItems.map((item, index) => `
              <div style="padding: 20px; ${index < orderItems.length - 1 ? 'border-bottom: 1px solid #e1e8ed;' : ''}">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 18px; font-weight: 600; line-height: 1.3;">
                      ${item.product?.name_en || item.product?.name_ar || 'Premium Product'}
                    </h4>
                    <div style="display: flex; align-items: center; gap: 15px; margin-top: 8px;">
                      <span style="background-color: #ecf0f1; color: #5d6d7e; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
                        SKU: ${item.product?.sku || 'N/A'}
                      </span>
                      <span style="background-color: #e8f5e8; color: #27ae60; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                        Qty: ${item.quantity}
                      </span>
                    </div>
                  </div>
                  <div style="text-align: right; margin-left: 20px;">
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #e74c3c;">
                      ${formatPrice((item.price || 0) * (item.quantity || 1), currency)}
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #7f8c8d;">
                      ${formatPrice(item.price || 0, currency)} each
                    </p>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- Order Summary -->
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 10px; margin-bottom: 30px; border: 1px solid #dee2e6;">
          <h3 style="color: #2c3e50; margin-top: 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #17a2b8; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">💳</span>
            Order Summary
          </h3>
          <div style="space-y: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6;">
              <span style="color: #5d6d7e; font-size: 16px; font-weight: 500;">Subtotal</span>
              <span style="color: #2c3e50; font-size: 16px; font-weight: 600;">${formatPrice(subtotal, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6;">
              <span style="color: #5d6d7e; font-size: 16px; font-weight: 500;">Shipping</span>
              <span style="color: #2c3e50; font-size: 16px; font-weight: 600;">${formatPrice(shipping, currency)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; background-color: #fff; margin: 16px -16px -16px -16px; padding-left: 16px; padding-right: 16px; border-radius: 8px;">
              <span style="color: #2c3e50; font-size: 20px; font-weight: 700;">Total Amount</span>
              <span style="color: #e74c3c; font-size: 24px; font-weight: 800;">${formatPrice(total, currency)}</span>
            </div>
          </div>
        </div>
        
        <!-- What's Next Section -->
        <div style="background: linear-gradient(135deg, #e8f5e8 0%, #d5f4e6 100%); padding: 25px; border-radius: 10px; border-left: 5px solid #27ae60; margin-bottom: 30px;">
          <h3 style="color: #1e8449; margin-top: 0; font-size: 20px; font-weight: 600; display: flex; align-items: center;">
            <span style="background-color: #27ae60; color: white; width: 28px; height: 28px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 12px; font-size: 14px;">🚀</span>
            What's Next?
          </h3>
          <div style="color: #1e6b3a; line-height: 1.6;">
            <p style="margin: 0 0 12px 0; font-size: 16px;">
              <strong>📦 Order Processing:</strong> We're preparing your items with care
            </p>
            <p style="margin: 0 0 12px 0; font-size: 16px;">
              <strong>🚚 Delivery Updates:</strong> Track your order with code: <code style="background-color: #c3e9d0; padding: 4px 8px; border-radius: 4px; font-weight: 600;">${data.order.code}</code>
            </p>
            <p style="margin: 0; font-size: 16px;">
              <strong>💰 Payment:</strong> Have your cash ready for delivery
            </p>
          </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; padding-top: 30px; border-top: 1px solid #e1e8ed;">
          <div style="margin-bottom: 20px;">
            <h4 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 18px; font-weight: 600;">Need Help?</h4>
            <p style="color: #7f8c8d; margin: 0; font-size: 14px;">
              Contact us at: <a href="mailto:support@eleva-boutique.net" style="color: #3498db; text-decoration: none; font-weight: 600;">support@eleva-boutique.net</a>
            </p>
          </div>
          <p style="color: #95a5a6; font-size: 12px; margin: 0; line-height: 1.5;">
            Thank you for choosing Eleva Boutique! 🌟<br>
            This email was sent to ${data.customerEmail}
          </p>
        </div>
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
  const subtotal = orderItems.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  // Use the shipping field from the order if available, otherwise calculate it
  const shipping = (data.order as any).shipping || (data.order.total_price || 0) - subtotal;
  const total = data.order.total_price || 0;

  // Get currency from the first product (assuming all products have the same currency)
  const currency = orderItems[0]?.product?.currency_code ? {
    code: orderItems[0].product.currency_code
  } : { code: 'AED' };

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333; border-bottom: 2px solid #dc3545; padding-bottom: 10px;">
        🛒 New Order Received
      </h2>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Order Information</h3>
        <p><strong>Order Code:</strong> ${data.order.code}</p>
        <p><strong>Order Date:</strong> ${new Date(data.order.created_at || '').toLocaleDateString()}</p>
        <p><strong>Status:</strong> <span style="color: #28a745; font-weight: bold;">Confirmed</span></p>
        <p><strong>Payment Method:</strong> ${data.order.payment_method || 'Cash on Delivery'}</p>
      </div>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Customer Information</h3>
        <p><strong>Name:</strong> ${data.customerName}</p>
        <p><strong>Email:</strong> ${data.customerEmail}</p>
        <p><strong>Phone:</strong> ${data.customerPhone}</p>
        ${data.order.user_note ? `<p><strong>Customer Notes:</strong> ${data.order.user_note}</p>` : ''}
      </div>
      
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #dee2e6; border-radius: 5px; margin: 20px 0;">
        <h3 style="color: #495057; margin-top: 0;">Order Items</h3>
        ${orderItems.map(item => `
          <div style="border-bottom: 1px solid #eee; padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <h4 style="margin: 0; color: #333;">${item.product?.name_en || 'Product'}</h4>
                <p style="margin: 5px 0; color: #666;">SKU: ${item.product?.sku || 'N/A'} | Quantity: ${item.quantity}</p>
              </div>
              <div style="text-align: right;">
                <p style="margin: 0; font-weight: bold; color: #333;">${formatPrice(item.price, currency)}</p>
              </div>
            </div>
          </div>
        `).join('')}
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
        This notification was sent from the Eleva Boutique order system.
      </p>
    </div>
  `;
};
