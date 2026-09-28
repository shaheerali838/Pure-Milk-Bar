import nodemailer from 'nodemailer';

/**
 * Creates and configures the nodemailer transporter.
 * Supports SMTP (Host/Port/User/Pass), Gmail, or fallback to Ethereal/Console mock in dev.
 */
let transporter = null;

const createTransporter = async () => {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = (process.env.SMTP_USER || process.env.EMAIL_USER || '').trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_PASS || '').trim().replace(/\s+/g, '');
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  // Custom SMTP
  if (host && user && pass) {
    if (!transporter || transporter._type !== 'custom_smtp') {
      console.info(`[Email Service] Configured Custom SMTP (${host}:${port}) for ${user}`);
      transporter = nodemailer.createTransport({
        host,
        port,
        secure,
        auth: { user, pass },
        tls: { rejectUnauthorized: false },
      });
      transporter._type = 'custom_smtp';
    }
    return transporter;
  }

  // Gmail direct service (Explicitly or auto-detected when user is @gmail.com)
  const isGmail = process.env.EMAIL_SERVICE === 'gmail' || (user && user.toLowerCase().endsWith('@gmail.com'));
  if (isGmail && user && pass) {
    if (!transporter || transporter._type !== 'gmail') {
      console.info(`[Email Service] Configured Direct Gmail SMTP delivery via ${user}`);
      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user, pass },
      });
      transporter._type = 'gmail';
    }
    return transporter;
  }

  // If already initialized test mailbox, reuse
  if (transporter) return transporter;

  // Fallback: Ethereal virtual test sandbox
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    transporter._type = 'ethereal';
    console.info(`[Email Service] No real SMTP credentials detected in .env; using Ethereal sandbox (${testAccount.user}).`);
    return transporter;
  } catch (err) {
    console.warn('[Email Service] Could not connect to external SMTP/Ethereal; email will log to console safely:', err.message);
    transporter = {
      sendMail: async (mailOptions) => {
        console.log('\n================== [OUTGOING EMAIL MOCK] ==================');
        console.log(`To: ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log(`From: ${mailOptions.from}`);
        console.log('------------------ [HTML PREVIEW] ------------------');
        console.log(mailOptions.text || '(HTML Body Rendered)');
        console.log('============================================================\n');
        return { messageId: `mock-${Date.now()}` };
      },
    };
    return transporter;
  }
};

/**
 * Format role for friendly display
 */
const formatRoleName = (role) => {
  switch (role) {
    case 'MANAGER':
      return 'Operations & Branch Manager';
    case 'CASHIER':
      return 'POS & Counter Cashier';
    case 'FARM_SUPERVISOR':
      return 'Farm & Production Supervisor';
    case 'RIDER':
      return 'Delivery Logistics Rider';
    case 'ADMIN':
      return 'Owner & System Administrator';
    default:
      return role || 'Staff Member';
  }
};

/**
 * Sends Staff Onboarding & Login Credentials Email
 */
export const sendStaffCredentialsEmail = async ({
  email,
  name,
  username,
  password,
  role,
  shift = 'Morning',
  portalUrl,
}) => {
  if (!email || !email.includes('@')) {
    console.warn(`[Email Service] Skipped sending credentials: No valid email provided for staff ${name}`);
    return { success: false, reason: 'Invalid or missing email' };
  }

  const appName = 'Pure Milk Bar';
  const loginUrl = portalUrl || process.env.APP_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173/login';
  const roleName = formatRoleName(role);
  const fromAddress = process.env.EMAIL_FROM || `"${appName} ERP" <no-reply@puremilkbar.com>`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to ${appName} - Your Login Credentials</title>
  <style>
    body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
    .wrapper { max-width: 600px; margin: 24px auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
    .header { background: linear-gradient(135deg, #004d2c 0%, #00a86b 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 8px 0 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1px; }
    .body { padding: 32px 28px; }
    .greeting { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 12px; }
    .intro { font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
    .role-badge { display: inline-block; background-color: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; margin-bottom: 20px; }
    .credentials-card { background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .credentials-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 14px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
    .cred-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; font-size: 14px; border-bottom: 1px dashed #e2e8f0; }
    .cred-row:last-child { border-bottom: none; }
    .cred-label { font-weight: 600; color: #64748b; }
    .cred-value { font-weight: 700; color: #0f172a; font-family: 'Courier New', monospace; background: #ffffff; padding: 3px 8px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .password-highlight { color: #00a86b; background: #ffffff; font-size: 15px; border: 1px solid #86efac; }
    .btn-container { text-align: center; margin: 30px 0 20px; }
    .btn { display: inline-block; background-color: #00a86b; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 2px 8px rgba(0, 168, 107, 0.3); }
    .security-notice { background-color: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 12px 16px; margin: 24px 0; font-size: 12px; color: #92400e; line-height: 1.5; }
    .footer { background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🥛 ${appName}</h1>
      <p>Dairy Farm ERP &amp; Retail Network</p>
    </div>
    
    <div class="body">
      <div class="greeting">Assalamu Alaikum, ${name}!</div>
      <div class="role-badge">Designation: ${roleName}</div>
      
      <p class="intro">
        You have been enrolled as a <strong>${roleName}</strong> in the Pure Milk Bar Management System. 
        Your enterprise account has been created by the Farm Administration. You can now log into your dedicated staff dashboard using the credentials provided below.
      </p>

      <div class="credentials-card">
        <div class="credentials-title">🔐 Your Login Credentials</div>
        
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Login Portal:</td>
            <td style="padding: 6px 0; text-align: right;"><a href="${loginUrl}" style="color: #00a86b; font-weight: 700; font-size: 13px; text-decoration: none;">${loginUrl}</a></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Email / Username:</td>
            <td style="padding: 6px 0; text-align: right;"><span class="cred-value">${email || username}</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Temporary Password:</td>
            <td style="padding: 6px 0; text-align: right;"><span class="cred-value password-highlight">${password}</span></td>
          </tr>
          <tr>
            <td style="padding: 6px 0; font-size: 13px; color: #64748b; font-weight: 600;">Assigned Shift:</td>
            <td style="padding: 6px 0; text-align: right;"><span style="font-weight: 700; font-size: 13px; color: #0f172a;">${shift} Shift</span></td>
          </tr>
        </table>
      </div>

      <div class="btn-container">
        <a href="${loginUrl}" class="btn">🚀 Access Staff Portal</a>
      </div>

      <div class="security-notice">
        <strong>⚠️ Security Advisory:</strong> Please keep your login credentials confidential. For security purposes, please change your temporary password immediately upon logging in for the first time.
      </div>

      <p style="font-size: 13px; color: #64748b; margin: 0;">
        If you have any questions or experience login difficulties, please reach out to your administrator or farm manager directly.
      </p>
    </div>

    <div class="footer">
      &copy; ${new Date().getFullYear()} ${appName} Enterprise Management. All rights reserved.
      <br>
      This is an automated administrative notification. Please do not reply directly to this email.
    </div>
  </div>
</body>
</html>
`;

  const plainText = `
Assalamu Alaikum ${name},

You have been registered as ${roleName} at Pure Milk Bar.

Your Login Credentials:
----------------------------------------
Portal URL: ${loginUrl}
Email/Username: ${email || username}
Password: ${password}
Shift: ${shift}
----------------------------------------

Please log in and update your password after your first sign in.

Pure Milk Bar Team
`;

  try {
    const activeTransporter = await createTransporter();
    const mailOptions = {
      from: fromAddress,
      to: email,
      subject: `🥛 Pure Milk Bar - Your ${roleName} Account Credentials`,
      text: plainText,
      html: htmlContent,
    };

    const info = await activeTransporter.sendMail(mailOptions);
    console.info(`[Email Service] Credentials email dispatched successfully to ${email}. Message ID: ${info.messageId}`);
    
    // If ethereal test account, log preview URL
    if (nodemailer.getTestMessageUrl && info) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.info(`[Email Service] Preview credentials email at: ${previewUrl}`);
      }
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null,
    };
  } catch (error) {
    console.error(`[Email Service] Failed to send credentials email to ${email}:`, error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default {
  sendStaffCredentialsEmail,
};
