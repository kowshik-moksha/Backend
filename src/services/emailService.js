import transporter from '../config/emailConfig.js';

export const sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your Signup OTP',
    text: `Your OTP for signup is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

// 🔹 Send Forgot Password OTP Email
export const sendPasswordResetOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Password Reset OTP',
    text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

export const sendCartReminderEmail = async (email, product) => {
  if (!email) {
    console.error(
      '❌ No recipient email provided. Skipping cart reminder email.'
    );
    return;
  }

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: `Reminder: Complete your purchase - ${product.name}`,
    html: `
      <h2>Hey there 👋</h2>
      <p>You left <b>${product.name}</b> in your cart!</p>
      <p>Price: ₹${product.price}</p>
      <p>Don't miss out — complete your purchase now!</p>
      <a href="https://yourshop.com/cart" 
         style="background:#007bff;color:white;padding:10px 15px;text-decoration:none;border-radius:5px;">Go to Cart</a>
      <br/><br/>
      <p>– The YourShop Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
