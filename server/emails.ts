import { Resend } from 'resend';
import { Mentor, Mentee, Organization } from '@shared/schema';

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

// For development/testing, we need to use Resend's test emails instead of example.com domains
function getSafeEmailAddress(email: string): string {
  // In development/testing, use Resend's test email address
  if (email.endsWith('example.com') || !email.includes('@') || !email.includes('.')) {
    return 'delivered@resend.dev';
  }
  return email;
}

// Function to send welcome email to approved mentors
export async function sendMentorWelcomeEmail(mentor: Mentor, organization: Organization): Promise<boolean> {
  try {
    const safeEmail = getSafeEmailAddress(mentor.email);
    
    const { data, error } = await resend.emails.send({
      from: `Mentor Match <onboarding@resend.dev>`,
      to: safeEmail,
      subject: `Welcome to ${organization.name}'s Mentor Program!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${organization.primaryColor || '#3B82F6'}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to ${organization.name}!</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Dear ${mentor.name},</p>
            <p>We're delighted to welcome you as an approved mentor in the ${organization.name} mentorship program!</p>
            <p>Your expertise and experience will be invaluable to our mentees who are eager to learn and grow. You are now visible in our mentor pool and may be matched with mentees based on skills and interests.</p>
            <p>Here's what you can expect next:</p>
            <ul>
              <li>You'll receive notifications when you're matched with a mentee</li>
              <li>You can review potential matches and schedule sessions</li>
              <li>You'll have access to resources to help make your mentoring effective</li>
            </ul>
            <p>Thank you for your commitment to supporting the next generation of entrepreneurs and professionals.</p>
            <p>Best regards,<br>The ${organization.name} Team</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending mentor welcome email:', error);
      return false;
    }

    console.log('Mentor welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send mentor welcome email:', error);
    return false;
  }
}

// Function to send welcome email to approved mentees
export async function sendMenteeWelcomeEmail(mentee: Mentee, organization: Organization): Promise<boolean> {
  try {
    const safeEmail = getSafeEmailAddress(mentee.email);
    
    const { data, error } = await resend.emails.send({
      from: `Mentor Match <onboarding@resend.dev>`,
      to: safeEmail,
      subject: `Welcome to ${organization.name}'s Mentorship Program!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: ${organization.primaryColor || '#3B82F6'}; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Welcome to ${organization.name}!</h1>
          </div>
          <div style="padding: 20px; border: 1px solid #e5e7eb; border-top: none;">
            <p>Dear ${mentee.name},</p>
            <p>Welcome to the ${organization.name} mentorship program! We're excited to have you join us as a mentee.</p>
            <p>Your application has been approved, and we're now working on finding the perfect mentor match for you based on your goals, interests, and requirements.</p>
            <p>Here's what happens next:</p>
            <ul>
              <li>You'll be notified when we've found a suitable mentor for you</li>
              <li>You'll be able to schedule your first mentoring session</li>
              <li>You'll gain access to additional resources to help you make the most of your mentorship</li>
            </ul>
            <p>We're committed to helping you grow and achieve your goals through this mentorship opportunity.</p>
            <p>Best regards,<br>The ${organization.name} Team</p>
          </div>
          <div style="background-color: #f3f4f6; padding: 10px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>© ${new Date().getFullYear()} ${organization.name}. All rights reserved.</p>
          </div>
        </div>
      `,
    });

    if (error) {
      console.error('Error sending mentee welcome email:', error);
      return false;
    }

    console.log('Mentee welcome email sent successfully:', data?.id);
    return true;
  } catch (error) {
    console.error('Failed to send mentee welcome email:', error);
    return false;
  }
}