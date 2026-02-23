import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

const sendEmail = async (options: EmailOptions) => {
  // 1. Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT), // Port for secure SMTP is usually 465 or 587
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports like 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3', // This can sometimes help with older SMTP servers
      rejectUnauthorized: false, // Use with caution, for local development/self-signed certs
    }
  });

  // 2. Define the email options
  const mailOptions = {
    from: `"${process.env.EMAIL_FROM_NAME || 'Palette Art Club'}" <${process.env.EMAIL_FROM_EMAIL || 'noreply@palette.com'}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };

  // 3. Send the email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Only available if using ethereal
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export default sendEmail;
