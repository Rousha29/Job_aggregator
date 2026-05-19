import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const isDev = process.env.NODE_ENV !== 'production';

const createMailhogTransport = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mailhog',
    port: parseInt(process.env.SMTP_PORT || '1025'),
    secure: false,
    ignoreTLS: true,
  });

export const sendVerificationEmail = async (email, token) => {
  if (process.env.NODE_ENV === 'test') return;
  const verifyUrl = `${process.env.APP_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  const subject = 'Vérifiez votre adresse email – Job Aggregator';
  const html = `
    <p>Bonjour,</p>
    <p>Cliquez sur le lien ci-dessous pour vérifier votre adresse email. Ce lien expire dans 24h.</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>Si vous n'avez pas créé de compte, ignorez cet email.</p>
  `;

  if (isDev) {
    const transporter = createMailhogTransport();
    await transporter.sendMail({
      from: 'no-reply@jobaggregator.dev',
      to: email,
      subject,
      html,
    });
  } else {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'no-reply@jobaggregator.com',
      to: email,
      subject,
      html,
    });
  }
};
