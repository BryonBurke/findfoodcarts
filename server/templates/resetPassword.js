export const resetPasswordTemplate = (resetLink) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <h2 style="color: #333;">Password Reset Request</h2>
    <p>You have requested to reset your password. Click the link below to proceed:</p>
    <a href="${resetLink}" 
       style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">
      Reset Password
    </a>
    <p>If you did not request this password reset, please ignore this email.</p>
    <p>This link will expire in 1 hour.</p>
    <hr style="border: 1px solid #eee; margin: 20px 0;">
    <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
  </div>
`; 