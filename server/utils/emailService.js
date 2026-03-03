const nodemailer = require('nodemailer');


const createTransporter = () => {
    
    if (process.env.EMAIL_SERVICE && 
        process.env.EMAIL_USER && 
        process.env.EMAIL_PASS &&
        process.env.EMAIL_USER !== 'your-email@gmail.com' &&
        process.env.EMAIL_PASS !== 'your-app-password-here') {
        
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        
        return null; 
    }
};


const sendOTPEmail = async (to, otp, userName = 'User') => {
    try {
        let transporter = createTransporter();
        
        // If no real email service configured, use Ethereal test account
        if (!transporter) {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER || 'noreply@streetshelter.com',
            to: to,
            subject: 'Password Reset OTP - StreetShelter',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .container {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            padding: 40px;
                            border-radius: 10px;
                            color: white;
                        }
                        .content {
                            background: white;
                            padding: 30px;
                            border-radius: 8px;
                            margin-top: 20px;
                            color: #333;
                        }
                        .otp-box {
                            background: #f3f4f6;
                            border: 2px dashed #667eea;
                            padding: 20px;
                            text-align: center;
                            border-radius: 8px;
                            margin: 20px 0;
                        }
                        .otp {
                            font-size: 32px;
                            font-weight: bold;
                            color: #667eea;
                            letter-spacing: 8px;
                        }
                        .warning {
                            background: #fef2f2;
                            border-left: 4px solid #ef4444;
                            padding: 12px;
                            margin: 20px 0;
                            border-radius: 4px;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 20px;
                            font-size: 12px;
                            color: rgba(255,255,255,0.8);
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 style="margin: 0; font-size: 28px;">🐾 StreetShelter</h1>
                        <p style="margin: 5px 0 0 0; opacity: 0.9;">Password Reset Request</p>
                        
                        <div class="content">
                            <h2 style="color: #667eea; margin-top: 0;">Hello ${userName}!</h2>
                            <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                            
                            <div class="otp-box">
                                <p style="margin: 0; font-size: 14px; color: #666;">Your One-Time Password</p>
                                <div class="otp">${otp}</div>
                                <p style="margin: 10px 0 0 0; font-size: 12px; color: #666;">Valid for 5 minutes</p>
                            </div>
                            
                            <div class="warning">
                                <strong>⚠️ Security Notice:</strong>
                                <ul style="margin: 8px 0 0 0; padding-left: 20px;">
                                    <li>This OTP is valid for <strong>5 minutes</strong></li>
                                    <li>You have <strong>3 attempts</strong> to enter the correct OTP</li>
                                    <li>Never share this OTP with anyone</li>
                                    <li>If you didn't request this, please ignore this email</li>
                                </ul>
                            </div>
                            
                            <p style="margin-top: 20px; color: #666; font-size: 14px;">
                                If you didn't request a password reset, you can safely ignore this email. 
                                Your password will remain unchanged.
                            </p>
                        </div>
                        
                        <div class="footer">
                            <p>© 2026 StreetShelter - Helping Street Dogs Find Safety</p>
                            <p>This is an automated email. Please do not reply.</p>
                        </div>
                    </div>
                </body>
                </html>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        
        // For development/testing: Log OTP if using test email service
        if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your-email@gmail.com') {
            console.log('\n=================================================');
            console.log('📧 PASSWORD RESET OTP (Testing Mode)');
            console.log('=================================================');
            console.log('Email:', to);
            console.log('OTP Code:', otp);
            console.log('Valid for: 5 minutes');
            console.log('=================================================\n');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Failed to send OTP email:', error);
        throw new Error('Failed to send email');
    }
};

module.exports = {
    sendOTPEmail
};
