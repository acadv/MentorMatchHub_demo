import { Mentor, Mentee, Match, Organization } from "@shared/schema";

// Interface for template values
interface TemplateValues {
  [key: string]: string;
}

// Replace placeholders in template
function replaceTemplatePlaceholders(template: string, values: TemplateValues): string {
  return Object.entries(values).reduce((text, [key, value]) => {
    return text.replace(new RegExp(`{{${key}}}`, 'g'), value);
  }, template);
}

// Introduction email template
const introductionTemplate = `
Dear {{mentee_name}},

I am pleased to introduce you to {{mentor_name}}, who has agreed to be your mentor as part of {{organization_name}}'s mentorship program.

{{mentor_name}} is a {{mentor_title}} at {{mentor_organization}} with expertise in {{mentor_expertise}}. Based on your interests in {{mentee_interests}}, we believe this will be a valuable mentoring relationship.

{{booking_link_section}}

Please connect with {{mentor_name}} and arrange your first mentoring session. We recommend meeting within the next two weeks.

Best regards,
The {{organization_name}} Team
`;

// Follow-up email template
const followUpTemplate = `
Dear {{mentee_name}},

I hope this email finds you well. We recently connected you with {{mentor_name}} for mentorship.

We would like to know if you have scheduled a meeting with your mentor. If yes, please let us know when the session is planned. If not, please make arrangements soon to get the most out of this mentoring opportunity.

{{booking_link_section}}

Thank you for your participation in our mentorship program.

Best regards,
The {{organization_name}} Team
`;

// Feedback request template
const feedbackTemplate = `
Dear {{recipient_name}},

Thank you for participating in our mentorship program at {{organization_name}}.

We hope your recent session with {{partner_name}} was valuable. We would appreciate your feedback to help us improve the program.

Please take a moment to rate your experience from 1 to 5 stars and provide any comments you may have.

Your feedback is valuable to us.

Best regards,
The {{organization_name}} Team
`;

// Mentor invitation template
const mentorInvitationTemplate = `
Dear Mentor,

You have been invited to join {{organization_name}}'s mentorship program as a mentor.

We believe your expertise and experience would be valuable to entrepreneurs seeking guidance. Our platform makes it easy to connect with motivated mentees who match your skills and availability.

{{custom_message}}

To get started, please click the link below to complete your mentor profile:
[Complete Your Profile]

Thank you for considering this opportunity to make a difference.

Best regards,
The {{organization_name}} Team
`;

// Mentee invitation template
const menteeInvitationTemplate = `
Dear Entrepreneur,

You have been invited to join {{organization_name}}'s mentorship program as a mentee.

Our platform connects you with experienced mentors who can provide guidance tailored to your needs and goals. This is a great opportunity to gain insights and support for your entrepreneurial journey.

{{custom_message}}

To get started, please click the link below to complete your profile:
[Complete Your Profile]

We look forward to helping you find the perfect mentor.

Best regards,
The {{organization_name}} Team
`;

// Generate introduction email
export function generateIntroductionEmail(
  mentor: Mentor, 
  mentee: Mentee, 
  org: Organization, 
  match: Match
): string {
  const mentorExpertise = Array.isArray(mentor.expertise) 
    ? mentor.expertise.join(', ') 
    : 'various areas';
  
  const menteeInterests = Array.isArray(mentee.interests)
    ? mentee.interests.join(', ')
    : 'various areas';
  
  let bookingLinkSection = '';
  if (mentor.bookingLink) {
    bookingLinkSection = `
${mentor.name} has provided a booking link to make scheduling easier:
${mentor.bookingLink}`;
  }
  
  const values: TemplateValues = {
    mentor_name: mentor.name,
    mentee_name: mentee.name,
    organization_name: org.name,
    mentor_title: mentor.title || 'professional',
    mentor_organization: mentor.organization || '',
    mentor_expertise: mentorExpertise,
    mentee_interests: menteeInterests,
    booking_link_section: bookingLinkSection
  };
  
  return replaceTemplatePlaceholders(introductionTemplate, values);
}

// Generate follow-up email
export function generateFollowUpEmail(
  mentor: Mentor, 
  mentee: Mentee, 
  org: Organization
): string {
  let bookingLinkSection = '';
  if (mentor.bookingLink) {
    bookingLinkSection = `
For your convenience, here is ${mentor.name}'s booking link:
${mentor.bookingLink}`;
  }
  
  const values: TemplateValues = {
    mentor_name: mentor.name,
    mentee_name: mentee.name,
    organization_name: org.name,
    booking_link_section: bookingLinkSection
  };
  
  return replaceTemplatePlaceholders(followUpTemplate, values);
}

// Generate feedback request email for mentor
export function generateMentorFeedbackEmail(
  mentor: Mentor, 
  mentee: Mentee, 
  org: Organization
): string {
  const values: TemplateValues = {
    recipient_name: mentor.name,
    partner_name: mentee.name,
    organization_name: org.name
  };
  
  return replaceTemplatePlaceholders(feedbackTemplate, values);
}

// Generate feedback request email for mentee
export function generateMenteeFeedbackEmail(
  mentor: Mentor, 
  mentee: Mentee, 
  org: Organization
): string {
  const values: TemplateValues = {
    recipient_name: mentee.name,
    partner_name: mentor.name,
    organization_name: org.name
  };
  
  return replaceTemplatePlaceholders(feedbackTemplate, values);
}

// Generate invitation email
export function generateInvitationEmail(
  org: Organization,
  userType: 'mentor' | 'mentee',
  customMessage: string = ''
): string {
  const template = userType === 'mentor' 
    ? mentorInvitationTemplate 
    : menteeInvitationTemplate;
  
  const values: TemplateValues = {
    organization_name: org.name,
    custom_message: customMessage 
      ? `\nPersonal message: "${customMessage}"\n` 
      : ''
  };
  
  return replaceTemplatePlaceholders(template, values);
}
