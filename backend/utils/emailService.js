const nodemailer = require('nodemailer');

const createTransporter = () => {
  // Check if email credentials are provided
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
      process.env.EMAIL_USER.trim() !== '' && process.env.EMAIL_PASS.trim() !== '') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  
  return null;
};

const sendActivationEmail = async (email, fullName, activationToken) => {
  const activationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}?token=${activationToken}`;
  
  const transporter = createTransporter();
  
  if (!transporter) {
    // No email configured - show activation link in console
    console.log('\n🔗 EMAIL NOT CONFIGURED - ACTIVATION LINK:');
    console.log(`📧 To: ${email}`);
    console.log(`👤 Name: ${fullName}`);
    console.log(`🔗 Link: ${activationUrl}`);
    console.log('\n📝 To enable email sending:');
    console.log('   1. Add EMAIL_USER and EMAIL_PASS in .env file');
    console.log('   2. Use Gmail App Password (not regular password)');
    console.log('   3. Restart server\n');
    return true;
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Activate Your Account - Accounting Management',
    html: `
      <h2>Welcome ${fullName}!</h2>
      <p>Click the link below to set your password:</p>
      <a href="${activationUrl}" style="background: #1e293b; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">Set Password</a>
      <p>Or copy this link: ${activationUrl}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email failed, using console fallback:', error.message);
    console.log('\n=== EMAIL ACTIVATION LINK ===');
    console.log(`To: ${email}`);
    console.log(`Activation URL: ${activationUrl}`);
    console.log('============================\n');
    return true;
  }
};

module.exports = { sendActivationEmail };