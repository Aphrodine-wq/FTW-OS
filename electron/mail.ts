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

  // Fetch Emails (Basic IMAP)
  ipcMain.handle('mail:fetch', async (_, { config, limit = 10 }) => {
    try {
      const imaps = require('imap-simple')
      
      const connection = await imaps.connect({
        imap: {
          user: config.user,
          password: config.pass,
          host: config.host,
          port: config.port || 993,
          tls: config.secure !== false,
          authTimeout: 3000
        }
      })

      await connection.openBox('INBOX')
      
      const searchCriteria = ['UNSEEN']
      const fetchOptions = {
        bodies: ['HEADER', 'TEXT'],
        markSeen: false
      }

      const messages = await connection.search(searchCriteria, fetchOptions)
      
      // Transform messages to simple format
      const emails = messages.slice(0, limit).map((msg: any) => {
        const header = msg.parts.find((p: any) => p.which === 'HEADER')
        const body = msg.parts.find((p: any) => p.which === 'TEXT')
        return {
          id: msg.attributes.uid,
          from: header?.body.from[0],
          subject: header?.body.subject[0],
          date: header?.body.date[0],
          body: body?.body
        }
      })

      connection.end()
      return { success: true, emails }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Mail Fetch Error:', error)
      return { success: false, error: errorMessage }
    }
  })
}
