const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { User, OTP } = require('../models');
const { sendOTPEmail } = require('../utils/emailService');


router.post('/request-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            
            return res.status(200).json({ 
                message: 'If this email exists, an OTP has been sent' 
            });
        }

        
        const otp = crypto.randomInt(100000, 999999).toString();
        
        
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        
        await OTP.destroy({ 
            where: { 
                email, 
                used: false 
            } 
        });

        
        await OTP.create({
            email,
            otp,
            expiresAt,
            attempts: 0,
            used: false
        });

        
        await sendOTPEmail(email, otp, user.name);

        res.status(200).json({ 
            message: 'OTP has been sent to your email' 
        });

    } catch (error) {
        console.error('Request OTP error:', error);
        res.status(500).json({ 
            message: 'Failed to send OTP. Please try again later.' 
        });
    }
});


router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ 
                message: 'Email and OTP are required' 
            });
        }

        
        const otpRecord = await OTP.findOne({ 
            where: { 
                email, 
                used: false 
            },
            order: [['createdAt', 'DESC']]
        });

        if (!otpRecord) {
            return res.status(400).json({ 
                message: 'No OTP found. Please request a new one.' 
            });
        }

        
        if (new Date() > otpRecord.expiresAt) {
            await otpRecord.destroy();
            return res.status(400).json({ 
                message: 'OTP has expired. Please request a new one.' 
            });
        }

        
        if (otpRecord.attempts >= 3) {
            await otpRecord.destroy();
            return res.status(400).json({ 
                message: 'Too many failed attempts. Please request a new OTP.' 
            });
        }

        
        if (otpRecord.otp !== otp) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({ 
                message: `Invalid OTP. ${3 - otpRecord.attempts} attempts remaining.` 
            });
        }

        
        const resetToken = crypto.randomBytes(32).toString('hex');
        
        
        otpRecord.used = true;
        otpRecord.resetToken = resetToken;
        await otpRecord.save();

        res.status(200).json({ 
            message: 'OTP verified successfully',
            resetToken 
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ 
            message: 'Failed to verify OTP. Please try again.' 
        });
    }
});


router.post('/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ 
                message: 'Email, reset token, and new password are required' 
            });
        }

        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        
        const otpRecord = await OTP.findOne({ 
            where: { 
                email, 
                resetToken,
                used: true 
            } 
        });

        if (!otpRecord) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        
        const tokenExpiryTime = new Date(otpRecord.updatedAt.getTime() + 15 * 60 * 1000);
        if (new Date() > tokenExpiryTime) {
            await otpRecord.destroy();
            return res.status(400).json({ 
                message: 'Reset token has expired. Please start the process again.' 
            });
        }

        
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            return res.status(404).json({ 
                message: 'User not found' 
            });
        }

        
        user.password = newPassword;
        await user.save();

        
        await otpRecord.destroy();

        res.status(200).json({ 
            message: 'Password reset successfully. You can now login with your new password.' 
        });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ 
            message: 'Failed to reset password. Please try again.' 
        });
    }
});


router.post('/admin/reset-password', async (req, res) => {
    try {
        const { email, resetToken, newPassword } = req.body;

        if (!email || !resetToken || !newPassword) {
            return res.status(400).json({ 
                message: 'Email, reset token, and new password are required' 
            });
        }

        
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }

        
        
        
        
        const otpRecord = await OTP.findOne({ 
            where: { 
                email, 
                resetToken,
                used: true 
            } 
        });

        if (!otpRecord) {
            return res.status(400).json({ 
                message: 'Invalid or expired reset token' 
            });
        }

        
        const tokenExpiryTime = new Date(otpRecord.updatedAt.getTime() + 15 * 60 * 1000);
        if (new Date() > tokenExpiryTime) {
            await otpRecord.destroy();
            return res.status(400).json({ 
                message: 'Reset token has expired. Please start the process again.' 
            });
        }

        
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        
        await otpRecord.destroy();

        res.status(200).json({ 
            message: 'Admin password reset verified',
            newPassword: hashedPassword 
        });

    } catch (error) {
        console.error('Admin reset password error:', error);
        res.status(500).json({ 
            message: 'Failed to reset password. Please try again.' 
        });
    }
});

module.exports = router;
