const nodemailer = require('nodemailer');

// Test email configuration
const testEmail = async () => {
    try {
        // Create email transporter (you'll need to set these environment variables)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
            tls: {
                ciphers: 'SSLv3',
                rejectUnauthorized: false,
            },
        });

        // Test email HTML content
        const testEmailHTML = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 650px; margin: 0 auto; background-color: #f5f7fa; padding: 20px;">
        <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          
          <!-- Header with Brand -->
          <div style="text-align: center; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 2px solid #e1e8ed;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; color: #667eea; margin-bottom: 10px;">
              <h1 style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">✨ Eleva Boutique</h1>
            </div>
            <h2 style="color: #2c3e50; margin: 10px 0 0 0; font-size: 24px; font-weight: 600;">Order Confirmation - TEST EMAIL</h2>
            <p style="color: #7f8c8d; margin: 8px 0 0 0; font-size: 16px;">Thank you for your order, Test Customer!</p>
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
                <p style="margin: 5px 0 0 0; color: #2c3e50; font-size: 16px; font-weight: 600; font-family: 'Courier New', monospace; background-color: #ecf0f1; padding: 8px 12px; border-radius: 6px; display: inline-block;">TEST-ORDER-2025</p>
              </div>
              <div>
                <p style="margin: 0; color: #7f8c8d; font-size: 14px; font-weight: 500;">Order Date</p>
                <p style="margin: 5px 0 0 0; color: #2c3e50; font-size: 16px; font-weight: 600;">August 31, 2025</p>
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
              <div style="padding: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div style="flex: 1;">
                    <h4 style="margin: 0 0 8px 0; color: #2c3e50; font-size: 18px; font-weight: 600; line-height: 1.3;">
                      Premium Luxury Perfume - Rose Garden
                    </h4>
                    <div style="display: flex; align-items: center; gap: 15px; margin-top: 8px;">
                      <span style="background-color: #ecf0f1; color: #5d6d7e; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 500;">
                        SKU: PERF-001
                      </span>
                      <span style="background-color: #e8f5e8; color: #27ae60; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                        Qty: 2
                      </span>
                    </div>
                  </div>
                  <div style="text-align: right; margin-left: 20px;">
                    <p style="margin: 0; font-size: 20px; font-weight: 700; color: #e74c3c;">
                      AED 150.00
                    </p>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #7f8c8d;">
                      AED 75.00 each
                    </p>
                  </div>
                </div>
              </div>
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
                <span style="color: #2c3e50; font-size: 16px; font-weight: 600;">AED 150.00</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #dee2e6;">
                <span style="color: #5d6d7e; font-size: 16px; font-weight: 500;">Shipping</span>
                <span style="color: #2c3e50; font-size: 16px; font-weight: 600;">AED 30.00</span>
              </div>
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 0; background-color: #fff; margin: 16px -16px -16px -16px; padding-left: 16px; padding-right: 16px; border-radius: 8px;">
                <span style="color: #2c3e50; font-size: 20px; font-weight: 700;">Total Amount</span>
                <span style="color: #e74c3c; font-size: 24px; font-weight: 800;">AED 180.00</span>
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
                <strong>🚚 Delivery Updates:</strong> Track your order with code: <code style="background-color: #c3e9d0; padding: 4px 8px; border-radius: 4px; font-weight: 600;">TEST-ORDER-2025</code>
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
              This is a test email sent to rowyda15@gmail.com
            </p>
          </div>
        </div>
      </div>
    `;

        // Email options
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: 'rowyda15@gmail.com',
            subject: '✨ Eleva Boutique - Enhanced Order Confirmation Email Test',
            html: testEmailHTML,
        };

        // Send email
        console.log('Sending test email to rowyda15@gmail.com...');
        const result = await transporter.sendMail(mailOptions);

        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', result.messageId);
        console.log('Email sent to: rowyda15@gmail.com');

    } catch (error) {
        console.error('❌ Error sending test email:', error);
        console.log('\n📝 Make sure you have set the following environment variables:');
        console.log('- SMTP_HOST (e.g., smtp.gmail.com)');
        console.log('- SMTP_USER (your email)');
        console.log('- SMTP_PASSWORD (your app password)');
        console.log('- SMTP_PORT (e.g., 587)');
    }
};

// Run the test
testEmail();
