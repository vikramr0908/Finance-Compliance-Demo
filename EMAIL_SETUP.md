# Email Setup Guide (SMTP via EmailJS)

This application uses EmailJS to send emails via SMTP. Follow these steps to configure email sending:

## Step 1: Sign up for EmailJS

1. Go to https://www.emailjs.com/
2. Sign up for a free account (200 emails/month free tier)
3. Verify your email address

## Step 2: Add Email Service

1. Go to **Email Services** in the EmailJS dashboard
2. Click **Add New Service**
3. Choose your email provider (Gmail, Outlook, Yahoo, etc.)
4. Follow the setup instructions for your provider
5. Copy your **Service ID** (you'll need this later)

## Step 3: Create Email Template

1. Go to **Email Templates** in the EmailJS dashboard
2. Click **Create New Template**
3. Use this template structure:

**Subject:**
```
{{subject}}
```

**Content (HTML):**
```html
<h2>{{subject}}</h2>

<p><strong>Compliance Item:</strong> {{item_title}}</p>
<p><strong>Category:</strong> {{item_category}}</p>
<p><strong>Status:</strong> {{item_status}}</p>
<p><strong>Priority:</strong> {{item_priority}}</p>
<p><strong>Due Date:</strong> {{due_date}}</p>
<p><strong>Assigned To:</strong> {{assigned_to}}</p>

{{#if days_remaining}}
<p><strong>Days Remaining:</strong> {{days_remaining}}</p>
{{/if}}

<hr>

<p><strong>Message:</strong></p>
<pre>{{message}}</pre>
```

4. Set **To Email** field to: `{{to_email}}`
5. Save the template
6. Copy your **Template ID** (you'll need this later)

## Step 4: Get Your Public Key

1. Go to **Account** > **General** in EmailJS dashboard
2. Find your **Public Key** under API Keys section
3. Copy the Public Key

## Step 5: Configure Environment Variables

Create a `.env` file in the project root with:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_template_id_here
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
```

Replace the placeholder values with your actual values from EmailJS.

## Step 6: Restart Development Server

After creating the `.env` file, restart your development server:

```bash
npm run dev
```

## Testing

Once configured, emails will be sent automatically when:
- Compliance items become overdue (past due date)
- Compliance items are nearing due date (within 3 days)

You can check the browser console to see email sending status.

## Troubleshooting

- **Emails not sending?** Check browser console for error messages
- **"EmailJS not configured" warning?** Make sure your `.env` file is in the project root and contains all three variables
- **Template variables not working?** Make sure your EmailJS template uses the exact variable names shown above
