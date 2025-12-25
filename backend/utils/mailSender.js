const nodemailer = require('nodemailer');

const mailSender = async (email, title, body) => {
    try {
        // Validate environment variables
        if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            throw new Error('Email configuration is missing. Please check MAIL_HOST, MAIL_USER, and MAIL_PASS environment variables.');
        }

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT || 587,
            secure: process.env.MAIL_SECURE === 'true' || false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Verify transporter configuration
        await transporter.verify();

        const info = await transporter.sendMail({
            from: `"StudyNotion" <${process.env.MAIL_USER}>`,
            to: email,
            subject: title,
            html: body
        });

        console.log('Email sent successfully to:', email);
        return info;
    }
    catch (error) {
        console.error('Error while sending mail (mailSender):', error.message);
        // Re-throw the error so the calling function knows it failed
        throw error;
    }
}

module.exports = mailSender;