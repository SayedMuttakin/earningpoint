const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationEmail = async (toEmail, code) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Zenivio" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: 'Your Zenivio Email Verification Code',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                <!-- Header -->
                <tr>
                  <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
                    <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;letter-spacing:-0.5px;">Zenivio</h1>
                    <p style="margin:6px 0 0;color:#e0e7ff;font-size:13px;">Earn & Grow</p>
                  </td>
                </tr>
                <!-- Body -->
                <tr>
                  <td style="padding:40px 40px 20px;">
                    <h2 style="margin:0 0 10px;color:#1e293b;font-size:22px;font-weight:700;">Verify Your Email</h2>
                    <p style="margin:0 0 28px;color:#64748b;font-size:15px;line-height:1.6;">
                      Use the following 6-digit code to verify your email address. This code expires in <strong>10 minutes</strong>.
                    </p>
                    <!-- OTP Box -->
                    <div style="background:#f8fafc;border:2px dashed #c7d2fe;border-radius:16px;padding:28px;text-align:center;margin-bottom:28px;">
                      <p style="margin:0 0 8px;color:#6366f1;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;">Verification Code</p>
                      <p style="margin:0;font-size:44px;font-weight:900;letter-spacing:12px;color:#1e293b;font-family:monospace;">${code}</p>
                    </div>
                    <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.6;">
                      If you didn't request this, you can safely ignore this email.
                    </p>
                  </td>
                </tr>
                <!-- Footer -->
                <tr>
                  <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #f1f5f9;">
                    <p style="margin:0;color:#94a3b8;font-size:12px;">&copy; 2026 Zenivio. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmail };
