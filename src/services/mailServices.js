import { env } from "../config/env.js"
import { transporter } from "../config/nodemailer.js"


export const sendTicketConfirmationEmail = async ({ to, eventTitle, ticketCode }) => {
  await transporter.sendMail({
    from: env.MAIL_FROM,
    to:to,
    subject: 'Confirmación de inscripción',
    html: `
      <h1>Inscripción confirmada</h1>
      <p>Hola, tu inscripción al evento ${eventTitle} fue confirmada.</p>
      <p>Código de reserva: <strong>${ticketCode}</strong></p>
    `
  })
}