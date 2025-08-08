import nodemailer from 'nodemailer'
import { serverEnv, getBaseUrl, isEmailConfigured } from '@/config/env.server'

/**
 * Create Nodemailer transporter using server env config
 */
function createEmailTransporter() {
  if (!isEmailConfigured()) {
    console.warn('[Email] Configuration missing — emails will not be sent.')
    return null
  }

  return nodemailer.createTransport({
    host: serverEnv.EMAIL_HOST,
    port: serverEnv.EMAIL_PORT,
    secure: serverEnv.EMAIL_PORT === 465,
    auth: {
      user: serverEnv.EMAIL_USER,
      pass: serverEnv.EMAIL_PASS,
    },
  })
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  userName: string
): Promise<boolean> {
  const transporter = createEmailTransporter()
  if (!transporter) return false

  const resetUrl = `${getBaseUrl()}/auth/reset-password?token=${resetToken}`

  const mailOptions = {
    from: serverEnv.EMAIL_FROM,
    to: email,
    subject: 'Password Reset Request - NPCL Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hello ${userName},</p>
        <p>You requested to reset your NPCL Dashboard password.</p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">
            Reset Password
          </a>
        </div>
        <p>If you didn't request this, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending password reset email:', error)
    return false
  }
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(
  email: string,
  userName: string,
  temporaryPassword?: string
): Promise<boolean> {
  const transporter = createEmailTransporter()
  if (!transporter) return false

  const loginUrl = `${getBaseUrl()}/auth/login`

  const mailOptions = {
    from: serverEnv.EMAIL_FROM,
    to: email,
    subject: 'Welcome to NPCL Dashboard',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to NPCL Dashboard</h2>
        <p>Hello ${userName},</p>
        <p>Your account has been created successfully.</p>
        ${
          temporaryPassword
            ? `<p><strong>Login credentials:</strong></p>
               <ul>
                 <li>Email: ${email}</li>
                 <li>Temporary Password: ${temporaryPassword}</li>
               </ul>
               <p style="color: #d9534f;"><strong>Please change your password after first login.</strong></p>`
            : ''
        }
        <div style="margin: 20px 0;">
          <a href="${loginUrl}" style="padding: 10px 20px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 4px;">
            Login to Dashboard
          </a>
        </div>
        <p>If you need help, contact your system administrator.</p>
      </div>
    `,
  }

  try {
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return false
  }
}
