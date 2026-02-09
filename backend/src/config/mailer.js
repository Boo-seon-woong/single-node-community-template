const nodemailer = require('nodemailer');
const {env} = require('./env');

if (!env.MAIL_USER || !env.MAIL_PASSWORD) {
    throw new Error('MAIL_CREDENTIALS_NOT_SET');
}

const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASSWORD,
    },
});

transporter.verify()
.then(() => console.log('[mail] gmail SMTP ready'))
.catch(err => {
    console.error('[mail] SMTP verify failed',err);
    process.exit(1);
});

async function sendVerificationEmail(toEmail, verifyLink) {
    try{
        await transporter.sendMail({
            from: `"ADMIN-Boo" <${env.MAIL_USER}>`,
            to: toEmail,
            subject: 'Verify your email',
            html: `
            <h3>Email Verification</h3>
            <p>click the link below to complete your email verification.</p>
            <a href="${verifyLink}">${verifyLink}</a>
            <p>expiration time: ${env.VERIFY_EXPIRES_MINUTES} minutes</p>
            `
        });
    } catch(err){
        throw new Error('EMAIL_FAILED');
    }
}

module.exports = {sendVerificationEmail};