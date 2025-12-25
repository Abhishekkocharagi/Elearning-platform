# Email Configuration Guide

This application requires email configuration to send OTP verification emails and other notifications.

## Required Environment Variables

Add these to your `.env` file in the `backend` directory:

```env
# Email Configuration (SMTP)
MAIL_HOST=smtp.gmail.com          # Your SMTP server host
MAIL_PORT=587                     # SMTP port (587 for TLS, 465 for SSL)
MAIL_SECURE=false                 # true for port 465 (SSL), false for port 587 (TLS)
MAIL_USER=your-email@gmail.com    # Your email address
MAIL_PASS=your-app-password       # Your email password or app-specific password
```

## Common Email Providers

### Gmail Setup

1. **Enable 2-Step Verification** on your Google account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this app password (not your regular password) as `MAIL_PASS`

```env
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-16-character-app-password
```

### Outlook/Hotmail Setup

```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@outlook.com
MAIL_PASS=your-password
```

### Yahoo Mail Setup

```env
MAIL_HOST=smtp.mail.yahoo.com
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=your-email@yahoo.com
MAIL_PASS=your-app-password
```

### Custom SMTP Server

If you're using a custom SMTP server (like SendGrid, Mailgun, etc.):

```env
MAIL_HOST=smtp.sendgrid.net        # Replace with your SMTP host
MAIL_PORT=587
MAIL_SECURE=false
MAIL_USER=apikey                   # Usually 'apikey' for SendGrid
MAIL_PASS=your-api-key             # Your SMTP API key
```

## Testing Email Configuration

After setting up your environment variables:

1. Restart your backend server
2. Try to register a new user
3. Check the server console for email sending logs
4. Check your email inbox (and spam folder) for the OTP

## Troubleshooting

### Error: "Email configuration is missing"
- Make sure all `MAIL_*` environment variables are set in your `.env` file
- Restart the server after adding environment variables

### Error: "Invalid login" or "Authentication failed"
- For Gmail: Make sure you're using an App Password, not your regular password
- Check that your email and password are correct
- Verify 2-Step Verification is enabled (for Gmail)

### Error: "Connection timeout"
- Check your internet connection
- Verify the `MAIL_HOST` is correct for your email provider
- Try a different port (587 or 465)

### Emails not received
- Check spam/junk folder
- Verify the recipient email address is correct
- Check server logs for detailed error messages
- Some email providers may delay or block automated emails

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of your main account password
- Consider using environment-specific email services for production

