import nodemailer from 'nodemailer';

const isTestEnv = process.env.NODE_ENV === 'test';

const mailTransporter = isTestEnv
  ? nodemailer.createTransport({ jsonTransport: true })
  : nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

export const sendPasswordReset = async (to: string, token: string, userName?: string) => {

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: to,
    subject: 'Redefinição de Senha - GP Finanças',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #0f172a;">
        <div style="max-width: 520px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); border: 1px solid #e2e8f0;">
          
          <!-- Linha de Destaque Superior em Gradiente (Estilo Stripe/Vercel) -->
          <div style="height: 6px; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%);"></div>
          <div style="padding: 32px;">
            
            <!-- Nome da Marca em Texto Tipográfico Limpo -->
            <div style="text-align: center; margin-bottom: 28px;">
              <h1 style="font-size: 24px; font-weight: 800; color: #1e293b; letter-spacing: -0.5px; margin: 0;">
                GP Finanças
              </h1>
            </div>
            <!-- Conteúdo do E-mail -->
           <p style="font-size: 16px; font-weight: 600; color: #0f172a; margin-top: 0;">Olá, ${userName || 'Usuário'}!</p>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Recebemos uma solicitação para redefinir a senha da sua conta no <strong>GP Finanças</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #334155;">
              Se você fez essa solicitação, clique no botão abaixo para criar uma nova senha segura.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #334155; margin-bottom: 28px;">
              Caso não tenha solicitado, por favor desconsidere este e-mail.
            </p>
            <!-- Botão de Ação Primário -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${resetUrl}" style="display: block; width: 100%; box-sizing: border-box; background-color: #4F46E5; color: #ffffff; text-align: center; padding: 14px 20px; border-radius: 8px; font-weight: 700; text-decoration: none; font-size: 16px; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.25);">
                Redefinir Minha Senha
              </a>
            </div>
            <!-- Caixa de Aviso de Segurança -->
            <div style="background-color: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; font-size: 13px; color: #475569; line-height: 1.5; margin-top: 28px;">
              ⚠️ <strong>Aviso de Segurança:</strong> Este link é exclusivo para a sua redefinição de senha e expira automaticamente em <strong>10 minutos</strong> para proteger sua conta. Se você não solicitou essa redefinição, sua conta permanece segura.
            </div>
            <!-- Link por extenso caso o cliente não suporte botões -->
            <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; line-height: 1.4; word-break: break-all;">
              Ou acesse direto pelo link:<br />
              <a href="${resetUrl}" style="color: #4F46E5; text-decoration: underline;">${resetUrl}</a>
            </p>
          </div>
          <!-- Rodapé -->
          <div style="background-color: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #64748b;">
            <p style="margin: 0 0 6px 0; font-weight: 700; color: #1e293b;">GP Finanças</p>
            <p style="margin: 0 0 6px 0; font-size: 11px; color: #94a3b8;">Equipe GP Finanças © ${new Date().getFullYear()} | Para sua segurança, nunca compartilhamos sua senha.</p>
            <p style="margin-top: 10px;">
              <a href="#" style="color: #4F46E5; text-decoration: underline;">Política de Privacidade</a> | 
              <a href="#" style="color: #4F46E5; text-decoration: underline;">Ajuda</a>
            </p>
          </div>
        </div>
      </div>
    `,
  };

  try {

    await mailTransporter.sendMail(mailOptions);

  } catch {

    console.warn(" [SMTP Warning]: Não foi possível enviar e-mail via SMTP (verifique cota do Mailtrap).");

    console.log(" [DEV Link]: Link de redefinição:", resetUrl);

  };

};