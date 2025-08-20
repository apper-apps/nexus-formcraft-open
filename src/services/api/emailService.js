// Mock email service for sending notifications
// In a real application, this would integrate with an email service provider

const delay = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const emailService = {
  async sendNotification(recipients, subject, formName, formData) {
    await delay();
    
    // Validate recipients
    if (!recipients || recipients.length === 0) {
      throw new Error('No recipients specified');
    }

    // Validate email addresses
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const invalidEmails = recipients.filter(email => !emailRegex.test(email));
    if (invalidEmails.length > 0) {
      throw new Error(`Invalid email addresses: ${invalidEmails.join(', ')}`);
    }

    // Mock email sending - in production, this would call an actual email service
    const emailContent = {
      to: recipients,
      subject: subject,
      body: `
        A new form submission has been received for: ${formName}
        
        Submission Details:
        ${Object.entries(formData)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')}
        
        Submitted at: ${new Date().toLocaleString()}
      `
    };

    // Simulate email service response
    console.log('Mock Email Sent:', emailContent);
    
    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recipients: recipients,
      sentAt: new Date().toISOString()
    };
  }
};

export { emailService };