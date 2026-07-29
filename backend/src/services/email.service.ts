import nodemailer from 'nodemailer';

const mailTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    }
});

export const sendPasswordReset = async (to: string, token: string) => {

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Redefinição de Senha - GP Finanças',
        html: `<p>Clique no link para redefinir sua senha:</p><a href="${resetUrl}">${resetUrl}</a>`
    };

    await mailTransporter.sendMail(mailOptions);

};