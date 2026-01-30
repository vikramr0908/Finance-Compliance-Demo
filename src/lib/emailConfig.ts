// EmailJS Configuration
// Get these values from https://www.emailjs.com/
// 1. Sign up at https://www.emailjs.com/
// 2. Create an email service (Gmail, Outlook, etc.)
// 3. Create an email template
// 4. Get your Public Key from Account > API Keys

export const emailConfig = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || '',
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '',
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
};

export const isEmailConfigured = () => {
  return !!(emailConfig.serviceId && emailConfig.templateId && emailConfig.publicKey);
};
