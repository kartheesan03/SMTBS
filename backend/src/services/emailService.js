const nodemailer = require('nodemailer');
let transporter = null;
const initializeTransporter = async () => {
    if (transporter) return;
    try {
        if (process.env.SMTP_HOST && process.env.SMTP_PORT) {
            transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: process.env.SMTP_PORT,
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS
                }
            });
            console.log('Real SMTP transporter initialized.');
        } else {
            console.log('No SMTP configuration found. Generating Ethereal test account...');
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
            console.log(`Ethereal transporter initialized. User: ${testAccount.user}`);
        }
    } catch (error) {
        console.error('Failed to initialize nodemailer transporter:', error);
    }
};
const sendEmail = async ({ to, subject, html }) => {
    try {
        await initializeTransporter();
        if (!transporter) {
            throw new Error('Transporter not initialized.');
        }
        const info = await transporter.sendMail({
            from: '"SMTBMS System" <noreply@smtbms.com>',
            to,
            subject,
            html
        });
        console.log(`Email sent: ${info.messageId}`);
        if (info.messageId && !process.env.SMTP_HOST) {
            console.log(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        }
        return info;
    } catch (error) {
        console.error(`Failed to send email to ${to}:`, error);
        return null;
    }
};
module.exports = {
    sendEmail
};
