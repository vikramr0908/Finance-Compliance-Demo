import { ComplianceItemWithCategory } from '../types/database';
import emailjs from '@emailjs/browser';
import { emailConfig, isEmailConfigured } from './emailConfig';

interface EmailNotification {
  item: ComplianceItemWithCategory;
  type: 'overdue' | 'nearing_due';
  daysRemaining?: number;
}

export async function sendEmailNotification(notification: EmailNotification): Promise<void> {
  const { item, type, daysRemaining } = notification;
  
  if (!item.owner_email) {
    console.warn(`No email address for compliance item: ${item.title}`);
    return;
  }

  const subject = type === 'overdue' 
    ? `URGENT: Compliance Item Overdue - ${item.title}`
    : `Reminder: Compliance Item Due Soon - ${item.title}`;

  const body = type === 'overdue'
    ? `
Compliance Item Overdue

Title: ${item.title}
Category: ${item.compliance_categories?.name || 'Uncategorized'}
Status: ${item.status}
Priority: ${item.priority}
Due Date: ${item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Not set'}
Assigned To: ${item.assigned_to || 'Unassigned'}

This compliance item is now overdue. Please take immediate action.

Description:
${item.description || 'No description provided'}

Notes:
${item.notes || 'No additional notes'}
    `.trim()
    : `
Compliance Item Due Soon

Title: ${item.title}
Category: ${item.compliance_categories?.name || 'Uncategorized'}
Status: ${item.status}
Priority: ${item.priority}
Due Date: ${item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Not set'}
Days Remaining: ${daysRemaining}
Assigned To: ${item.assigned_to || 'Unassigned'}

This compliance item is due in ${daysRemaining} day(s). Please review and update the status.

Description:
${item.description || 'No description provided'}

Notes:
${item.notes || 'No additional notes'}
    `.trim();

  const emailLog = {
    to: item.owner_email,
    subject,
    body,
    sentAt: new Date().toISOString(),
    itemId: item.id,
    type,
    sent: false,
    error: null as string | null,
  };

  // Try to send email via EmailJS if configured
  if (isEmailConfigured()) {
    try {
      // Initialize EmailJS with public key
      emailjs.init(emailConfig.publicKey);

      // Prepare template parameters for EmailJS
      const templateParams = {
        to_email: item.owner_email,
        subject: subject,
        message: body,
        item_title: item.title,
        item_category: item.compliance_categories?.name || 'Uncategorized',
        item_status: item.status,
        item_priority: item.priority,
        due_date: item.due_date ? new Date(item.due_date).toLocaleDateString() : 'Not set',
        assigned_to: item.assigned_to || 'Unassigned',
        days_remaining: daysRemaining?.toString() || '',
        notification_type: type,
      };

      // Send email via EmailJS
      const response = await emailjs.send(
        emailConfig.serviceId,
        emailConfig.templateId,
        templateParams
      );

      emailLog.sent = true;
      emailLog.error = null;

      console.log(
        `%c✅ Email Sent Successfully via SMTP`,
        'color: #10b981; font-weight: bold; font-size: 14px;',
        {
          to: item.owner_email,
          subject,
          response: response.text,
        }
      );
    } catch (error) {
      emailLog.sent = false;
      emailLog.error = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(
        `%c❌ Email Send Failed`,
        'color: #dc2626; font-weight: bold; font-size: 14px;',
        {
          to: item.owner_email,
          error: emailLog.error,
        }
      );
    }
  } else {
    // EmailJS not configured - log warning
    console.warn(
      `%c⚠️ EmailJS not configured. Email logged but not sent.`,
      'color: #f59e0b; font-weight: bold; font-size: 14px;',
      'Please configure EmailJS credentials in .env file'
    );
    emailLog.error = 'EmailJS not configured';
  }

  // Store email notifications in localStorage
  const existingNotifications = JSON.parse(
    localStorage.getItem('email_notifications') || '[]'
  );
  existingNotifications.push(emailLog);
  localStorage.setItem('email_notifications', JSON.stringify(existingNotifications));

  // Log to console
  console.log('Email notification details:', emailLog);
}

export async function checkAndSendNotifications(items: ComplianceItemWithCategory[]): Promise<void> {
  const now = new Date();
  const notifications: EmailNotification[] = [];

  items.forEach((item) => {
    // Skip if already compliant or no due date or no email
    if (item.status === 'compliant' || !item.due_date || !item.owner_email || item.owner_email.trim() === '') {
      return;
    }

    const dueDate = new Date(item.due_date);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Check if overdue (past due date and still pending/in_progress/non_compliant)
    if (daysUntilDue < 0 && (item.status === 'pending' || item.status === 'in_progress' || item.status === 'non_compliant')) {
      notifications.push({
        item,
        type: 'overdue',
      });
    }
    // Check if nearing due date (within 3 days)
    else if (daysUntilDue >= 0 && daysUntilDue <= 3 && (item.status === 'pending' || item.status === 'in_progress' || item.status === 'non_compliant')) {
      notifications.push({
        item,
        type: 'nearing_due',
        daysRemaining: daysUntilDue,
      });
    }
  });

  // Send notifications (avoid duplicates by checking last sent time)
  await Promise.all(
    notifications.map(async (notification) => {
      const lastSentKey = `email_sent_${notification.item.id}_${notification.type}`;
      const lastSent = localStorage.getItem(lastSentKey);
      const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;

      // Only send if not sent in the last 24 hours
      if (!lastSent || parseInt(lastSent) < oneDayAgo) {
        await sendEmailNotification(notification);
        localStorage.setItem(lastSentKey, Date.now().toString());
        
        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(
            notification.type === 'overdue' 
              ? `URGENT: ${notification.item.title} is overdue`
              : `Reminder: ${notification.item.title} due in ${notification.daysRemaining} day(s)`,
            {
              body: `Email sent to ${notification.item.owner_email}`,
              icon: '/xforia-logo.svg',
            }
          );
        }
      }
    })
  );
}

export function getEmailNotificationStatus(item: ComplianceItemWithCategory): {
  needsNotification: boolean;
  type?: 'overdue' | 'nearing_due';
  daysRemaining?: number;
} {
  if (item.status === 'compliant' || !item.due_date || !item.owner_email || item.owner_email.trim() === '') {
    return { needsNotification: false };
  }

  const now = new Date();
  const dueDate = new Date(item.due_date);
  const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilDue < 0 && (item.status === 'pending' || item.status === 'in_progress')) {
    return {
      needsNotification: true,
      type: 'overdue',
    };
  }

  if (daysUntilDue >= 0 && daysUntilDue <= 3 && (item.status === 'pending' || item.status === 'in_progress' || item.status === 'non_compliant')) {
    return {
      needsNotification: true,
      type: 'nearing_due',
      daysRemaining: daysUntilDue,
    };
  }

  return { needsNotification: false };
}
