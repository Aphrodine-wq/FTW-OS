import { ipcMain } from 'electron'
// @ts-ignore - nodemailer types not installed
import nodemailer from 'nodemailer'

export function setupMailHandlers() {
  // Send Email
  ipcMain.handle('mail:send', async (_, { config, mailOptions }) => {
    try {
      const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure, // true for 465, false for other ports
        auth: {
          user: config.user,
          pass: config.pass,
        },
      })

      const info = await transporter.sendMail(mailOptions)
      return { success: true, messageId: info.messageId }
    } catch (error: any) {
      console.error('Mail Send Error:', error)
      return { success: false, error: error.message }
    }
  })

  // Fetch Emails (Basic IMAP) - Disabled for now due to imap-simple dependency issues
  ipcMain.handle('mail:fetch', async (_, { config, limit = 10 }) => {
    try {
      // TODO: Re-enable when imap-simple is properly configured
      console.warn('IMAP fetch is currently disabled. Install imap-simple to enable.')
      return { 
        success: false, 
        error: 'IMAP functionality is currently disabled. Please configure imap-simple dependency.' 
      }
    } catch (error: any) {
      console.error('Mail Fetch Error:', error)
      return { success: false, error: error.message }
    }
  })
}
