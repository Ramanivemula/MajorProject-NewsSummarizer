const nodemailer = require('nodemailer');

function createTransporter() {
  // Use Gmail service (requires App Password)
  if ((process.env.EMAIL_SERVICE || '').toLowerCase() === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Generic SMTP (Mailtrap, SendGrid SMTP, etc.)
  if (process.env.EMAIL_HOST) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT || 587),
      secure: String(process.env.EMAIL_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.EMAIL_USER || process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: JSON transport (doesn't send real emails; logs output)
  return nodemailer.createTransport({ jsonTransport: true });
}

const transporter = createTransporter();

async function verifyTransport() {
  try {
    await transporter.verify();
    console.log('📧 Mailer ready:', process.env.EMAIL_SERVICE || process.env.EMAIL_HOST || 'jsonTransport');
  } catch (err) {
    console.warn('⚠️ Mailer verification failed:', err.message);
  }
}

module.exports = { transporter, verifyTransport };
