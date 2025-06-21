import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Sends an email using the provided parameters.
 * @param {Object} options - The email options.
 * @param {string} options.subject - The subject of the email.
 * @param {string} options.send_to - The email address to send the email to.
 * @param {string} options.sent_from - The email address the email is sent from.
 * @param {string} options.reply_to - The email address to set as the reply-to address.
 * @param {string} options.template - The name of the email template.
 * @param {Object} options.context - The context data for the email template.
 */
const sendMail = async (options) => {
  // Get SMTP configuration from environment variables
  const smptHost = process.env.BREVO_SMPT_HOST;
  const smptPort = process.env.BREVO_SMPT_PORT;
  const smptMail = process.env.BREVO_SMPT_EMAIL;
  const smptPass = process.env.BREVO_SMPT_KEY;
  // Create a transporter using the SMTP configuration
  const transporter = nodemailer.createTransport({
    host: smptHost,
    port: smptPort,
    auth: {
      user: smptMail,
      pass: smptPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
  // Configure handlebars options for email template rendering
  const handlebarOptions = {
    viewEngine: {
      extname: '.handlebars',
      partialsDir: path.resolve('./views'),
      defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: '.handlebars',
  };
  // Use handlebars for email template rendering
  transporter.use('compile', hbs(handlebarOptions));
  // Set the email options
  const mailOptions = {
    from: options.sent_from,
    to: options.send_to,
    replyTo: options.reply_to,
    subject: options.subject,
    template: options.template,
    context: options.context,
  };
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (err) {
    throw err;
  }
};
export default sendMail;
