export interface SendVerificationEmailParams {
  toEmail: string;
  toName?: string | null;
  code: string;
}

export async function sendVerificationEmail({
  toEmail,
  toName,
  code
}: SendVerificationEmailParams): Promise<{ success: boolean }> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS configuration missing in environment variables.');
    throw new Error('Email service is not configured. Please contact support.');
  }

  const payload: Record<string, any> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: toEmail,
      email: toEmail,
      recipient: toEmail,
      recipient_email: toEmail,
      user_email: toEmail,
      reply_to: toEmail,
      to_name: toName || toEmail.split('@')[0],
      name: toName || toEmail.split('@')[0],
      verification_code: code,
      code: code,
      passcode: code,
      app_name: 'CareerOS'
    }
  };

  if (privateKey && privateKey.trim().length > 0) {
    payload.accessToken = privateKey;
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EmailJS API Error response:', response.status, errorText);
    throw new Error('Failed to dispatch verification email via EmailJS.');
  }

  return { success: true };
}

export interface SendPasswordResetEmailParams {
  toEmail: string;
  toName?: string | null;
  code: string;
  resetUrl: string;
}

export async function sendPasswordResetEmail({
  toEmail,
  toName,
  code,
  resetUrl
}: SendPasswordResetEmailParams): Promise<{ success: boolean }> {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.error('EmailJS configuration missing in environment variables.');
    throw new Error('Email service is not configured. Please contact support.');
  }

  const payload: Record<string, any> = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    template_params: {
      to_email: toEmail,
      email: toEmail,
      recipient: toEmail,
      recipient_email: toEmail,
      user_email: toEmail,
      reply_to: toEmail,
      to_name: toName || toEmail.split('@')[0],
      name: toName || toEmail.split('@')[0],
      verification_code: code,
      code: code,
      passcode: code,
      reset_code: code,
      reset_link: resetUrl,
      message: `Your CareerOS password reset code is ${code}. Click the link below to reset your password:\n${resetUrl}`,
      app_name: 'CareerOS'
    }
  };

  if (privateKey && privateKey.trim().length > 0) {
    payload.accessToken = privateKey;
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('EmailJS API Error response:', response.status, errorText);
    throw new Error('Failed to dispatch password reset email via EmailJS.');
  }

  return { success: true };
}

