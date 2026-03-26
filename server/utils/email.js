import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.APP_PASS,
  },
});

export const sendOrderNotification = async (order, user) => {
  try {
    const adminEmail = process.env.EMAIL;
    const userEmail = user.email;

    const orderItems = order.products
      .map(
        (item) =>
          `<li>${item.product?.name || 'Product'} x ${item.quantity} - Rs.${(
            item.product?.price * item.quantity
          ).toFixed(2)}</li>`
      )
      .join('');

    const emailContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #d97706; text-align: center;">New Order Placed!</h2>
        <p>Hello,</p>
        <p>A new order has been placed on Handmade By Dua.</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>Customer:</strong> ${user.firstName} ${user.lastName} (${user.email})</p>
          <p><strong>Total Amount:</strong> Rs.${order.totalAmount.toFixed(2)}</p>
          <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        </div>
        <h3>Order Items:</h3>
        <ul>${orderItems}</ul>
        <p>Please log in to the admin panel to process this order.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Handmade By Dua - </p>
      </div>
    `;

    // Send to Admin
    await transporter.sendMail({
      from: `"Handmade By Dua" <${process.env.EMAIL}>`,
      to: adminEmail,
      subject: `New Order Received - ID: ${order._id}`,
      html: emailContent,
    });

    // Send to User
    await transporter.sendMail({
      from: `"Handmade By Dua" <${process.env.EMAIL}>`,
      to: userEmail,
      subject: `Order Confirmation - Handmade By Dua`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #d97706; text-align: center;">Thank You for Your Order!</h2>
          <p>Hi ${user.firstName},</p>
          <p>We've received your order and it's being processed. Here are the details:</p>
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Total Amount:</strong> Rs.${order.totalAmount.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <h3>Your Items:</h3>
          <ul>${orderItems}</ul>
          <p>We'll notify you once your order status is updated.</p>
          <p>Thank you for supporting our craft!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #6b7280; text-align: center;">Handmade By Dua - </p>
        </div>
      `,
    });

    console.log('✅ Email notifications sent successfully');
  } catch (error) {
    console.error('❌ Error sending email notifications:', error);
  }
};

export const sendStatusUpdateNotification = async (order, user) => {
  try {
    const userEmail = user.email;
    let statusMessage = '';
    let statusColor = '#2563eb';

    if (order.status === 'payment approved') {
      statusMessage = 'Your payment has been successfully approved! We are now preparing your order for shipping.';
      statusColor = '#16a34a';
    } else if (order.status === 'payment rejected') {
      statusMessage = 'Unfortunately, your payment receipt was rejected. Please contact us via WhatsApp or Instagram for clarification.';
      statusColor = '#dc2626';
    } else {
      statusMessage = `Your order status has been updated to: <strong>${order.status}</strong>`;
    }

    const emailContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: ${statusColor}; text-align: center;">Order Status Update</h2>
        <p>Hi ${user.firstName},</p>
        <p>${statusMessage}</p>
        <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Order ID:</strong> ${order._id}</p>
          <p><strong>New Status:</strong> <span style="text-transform: uppercase; font-weight: bold; color: ${statusColor};">${order.status}</span></p>
        </div>
        <p>If you have any questions, feel free to reach out to us.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #6b7280; text-align: center;">Handmade By Dua </p>
      </div>
    `;

    await transporter.sendMail({
      from: `"Handmade By Dua" <${process.env.EMAIL}>`,
      to: userEmail,
      subject: `Update on your Order #${order._id.toString().slice(-6).toUpperCase()}`,
      html: emailContent,
    });

    console.log(`✅ Status update notification sent to ${userEmail}`);
  } catch (error) {
    console.error('❌ Error sending status update notification:', error);
  }
};
