import { ipcMain } from 'electron'
// eslint-disable-next-line @typescript-eslint/no-require-imports
import nodemailer = require('nodemailer')

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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Mail Send Error:', error)
      return { success: false, error: errorMessage }
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
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Mail Fetch Error:', error)
      return { success: false, error: errorMessage }
    }
  })
}
