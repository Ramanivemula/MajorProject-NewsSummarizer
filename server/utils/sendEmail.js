// utils/sendEmail.js
const nodemailer = require('nodemailer');

// Clean password by removing all whitespace
const cleanPassword = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '';

// Create transporter based on environment variables
let transporter;

if (process.env.EMAIL_HOST) {
  // Use SMTP (Mailtrap, SendGrid, etc.)
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 587),
    secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || process.env.EMAIL_FROM,
      pass: cleanPassword
    },
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  });
  console.log('📧 Using SMTP:', process.env.EMAIL_HOST);
} else {
  // Use Gmail service
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: cleanPassword
    },
    debug: process.env.NODE_ENV !== 'production',
    logger: process.env.NODE_ENV !== 'production'
  });
  console.log('📧 Using Gmail service');
}

// Verify transporter on startup
transporter.verify(function(error, success) {
  if (error) {
    console.error('❌ Email transporter error:', error.message);
    console.error('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
    console.error('🔑 EMAIL_PASS length:', cleanPassword.length, 'chars');
    console.error('\n🔧 To fix Gmail authentication:');
    console.error('   1. Enable 2-Step Verification: https://myaccount.google.com/security');
    console.error('   2. Generate App Password: https://myaccount.google.com/apppasswords');
    console.error('   3. Update EMAIL_PASS in .env with the 16-char password (no spaces)');
  } else {
    console.log('✅ Email server is ready to send messages');
    console.log('📧 Using email:', process.env.EMAIL_FROM);
  }
});

async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({ 
      from: `NewsSummarizer <${process.env.EMAIL_FROM}>`, 
      to, 
      subject, 
      html 
    });
      console.log('✅ Email sent successfully');
      console.log('   To:', to);
      console.log('   Message ID:', info.messageId);
      // Log nodemailer info for debugging (accepted/rejected/response)
      try {
        console.log('   Nodemailer info:', {
          accepted: info.accepted, rejected: info.rejected, response: info.response, envelope: info.envelope
        });
      } catch (e) {
        console.log('   Nodemailer info: (unable to stringify)');
      }
    return info;
  } catch (error) {
      console.error('❌ Failed to send email to:', to);
      console.error('   Error message:', error.message);
      // Log full error for debugging (stack / response)
      console.error(error);
    
    // In development, log OTP and continue instead of failing
    if (process.env.NODE_ENV !== 'production') {
      console.log('\n🔐 [DEV MODE] Email failed, but continuing...');
      const otpMatch = html.match(/\d{6}/);
      if (otpMatch) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Email would be sent to:', to);
        console.log('🔑 OTP CODE:', otpMatch[0]);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      }
      // Return a fake success so the login flow continues
      return { messageId: 'dev-mode-' + Date.now() };
    }
    
    throw error;
  }
}

module.exports = sendEmail;