import {
  users,
  type User,
  type InsertUser,
  organizations,
  type Organization,
  type InsertOrganization,
  formTemplates,
  type FormTemplate,
  type InsertFormTemplate,
  mentors,
  type Mentor,
  type InsertMentor,
  mentees,
  type Mentee,
  type InsertMentee,
  matches,
  type Match,
  type InsertMatch,
  mentoringSessions,
  type MentoringSession,
  type InsertMentoringSession,
  Form,
} from "@shared/schema";

/*storage.ts has using in-memory impl but  
The flow is:
routes.ts imports { storage } from ./storage
storage.ts exports an instance of DatabaseStorage
DatabaseStorage is implemented in db-storage.ts
*/

// Define the interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: InsertUser): Promise<User>;

  // Organization operations
  getOrganization(id: number): Promise<Organization | undefined>;
  createOrganization(organization: InsertOrganization): Promise<Organization>;
  updateOrganization(
    id: number,
    organization: Partial<Organization>,
  ): Promise<Organization | undefined>;

  // Form template operations
  getFormTemplates(organizationId: number): Promise<FormTemplate[]>;
  getFormTemplatesByType(
    organizationId: number,
    type: string,
  ): Promise<FormTemplate[]>;
  getFormTemplate(id: number): Promise<FormTemplate | undefined>;
  createFormTemplate(formTemplate: InsertFormTemplate): Promise<FormTemplate>;
  updateFormTemplate(
    id: number,
    formTemplate: Partial<FormTemplate>,
  ): Promise<FormTemplate | undefined>;
  deleteFormTemplate(id: number): Promise<boolean>;

  // Mentor operations
  getMentors(organizationId: number): Promise<Mentor[]>;
  getMentor(id: number): Promise<Mentor | undefined>;
  getMentorByEmail(email: string): Promise<Mentor | undefined>;
  createMentor(mentor: InsertMentor): Promise<Mentor>;
  updateMentor(
    id: number,
    mentor: Partial<Mentor>,
  ): Promise<Mentor | undefined>;

  // Mentee operations
  getMentees(organizationId: number): Promise<Mentee[]>;
  getMentee(id: number): Promise<Mentee | undefined>;
  getMenteeByEmail(email: string): Promise<Mentee | undefined>;
  createMentee(mentee: InsertMentee): Promise<Mentee>;
  updateMentee(
    id: number,
    mentee: Partial<Mentee>,
  ): Promise<Mentee | undefined>;

  // Match operations
  getMatches(organizationId: number): Promise<Match[]>;
  getMatchesByStatus(organizationId: number, status: string): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatch(id: number, match: Partial<Match>): Promise<Match | undefined>;

  // Mentoring Session operations
  getMentoringSessions(matchId: number): Promise<MentoringSession[]>;
  getMentoringSession(id: number): Promise<MentoringSession | undefined>;
  createMentoringSession(
    session: InsertMentoringSession,
  ): Promise<MentoringSession>;
  updateMentoringSession(
    id: number,
    session: Partial<MentoringSession>,
  ): Promise<MentoringSession | undefined>;

  // Analytics
  getTotalMatches(organizationId: number): Promise<number>;
  getActiveMentors(organizationId: number): Promise<number>;
  getSessionsCompleted(organizationId: number): Promise<number>;
  getAverageRating(organizationId: number): Promise<number>;
  getPendingMatches(organizationId: number): Promise<number>;
}

//Inmemory storage implementation for dummydata-not in use
export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private organizations: Map<number, Organization>;
  private formTemplates: Map<number, FormTemplate>;
  private mentors: Map<number, Mentor>;
  private mentees: Map<number, Mentee>;
  private matches: Map<number, Match>;
  private mentoringSessions: Map<number, MentoringSession>;

  private organizationId: number;
  private formTemplateId: number;
  private mentorId: number;
  private menteeId: number;
  private matchId: number;
  private mentoringSessionId: number;

  constructor() {
    this.users = new Map();
    this.organizations = new Map();
    this.formTemplates = new Map();
    this.mentors = new Map();
    this.mentees = new Map();
    this.matches = new Map();
    this.mentoringSessions = new Map();

    this.organizationId = 1;
    this.formTemplateId = 1;
    this.mentorId = 1;
    this.menteeId = 1;
    this.matchId = 1;
    this.mentoringSessionId = 1;

    // Seed the database with a default organization and admin user
    this.seedDatabase();
  }

  //SeedDatabase() used only once for creating org
  private seedDatabase() {
    // Create default organization
    const organization: Organization = {
      id: this.organizationId++,
      name: "Demo Organization",
      logo: null,
      primaryColor: "#3B82F6",
      secondaryColor: "#8B5CF6",
      accentColor: "#10B981",
      //testing
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionStatus: null,
      subscriptionPlan: null,
      //
      createdAt: new Date(),
    };
    console.log('org details:',organization)
    this.organizations.set(organization.id, organization);

    // Create admin user
    const admin: User = {
      id: "1", // Replit Auth style ID
      email: "admin121@example.com",
      firstName: "Admin",
      lastName: "User",
      profileImageUrl: null,
      role: "admin",
      organizationId: organization.id,
      createdAt: new Date(),
      updatedAt: new Date(),
      
    };
    console.log('admin details:',admin)
    this.users.set(admin.id, admin);

    // Create sample mentor form template
    const mentorForm: FormTemplate = {
      id: this.formTemplateId++,
      organizationId: organization.id,
      name: "Mentor Onboarding Form",
      type: "mentor",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          placeholder: "John Doe",
          required: true,
        },
        {
          id: "title",
          type: "text",
          label: "Professional Title",
          placeholder: "Marketing Director",
          required: true,
        },
        {
          id: "organization",
          type: "text",
          label: "Organization",
          placeholder: "Company Name",
          required: true,
        },
        {
          id: "industry",
          type: "select",
          label: "Industry",
          required: true,
          options: [
            { value: "technology", label: "Technology" },
            { value: "healthcare", label: "Healthcare" },
            { value: "finance", label: "Finance" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "expertise",
          type: "multiselect",
          label: "Areas of Expertise",
          required: true,
          options: [
            { value: "marketing", label: "Marketing" },
            { value: "sales", label: "Sales" },
            { value: "product", label: "Product Management" },
            { value: "engineering", label: "Engineering" },
            { value: "design", label: "Design" },
            { value: "finance", label: "Finance" },
            { value: "operations", label: "Operations" },
          ],
        },
        {
          id: "yearsOfExperience",
          type: "select",
          label: "Years of Experience",
          required: true,
          options: [
            { value: "1-3", label: "1-3 years" },
            { value: "4-6", label: "4-6 years" },
            { value: "7-10", label: "7-10 years" },
            { value: "10+", label: "10+ years" },
          ],
        },
        {
          id: "availability",
          type: "checkbox",
          label: "Availability",
          required: true,
          options: [
            { value: "weekday-mornings", label: "Weekday Mornings" },
            { value: "weekday-afternoons", label: "Weekday Afternoons" },
            { value: "weekday-evenings", label: "Weekday Evenings" },
            { value: "weekend-mornings", label: "Weekend Mornings" },
            { value: "weekend-afternoons", label: "Weekend Afternoons" },
            { value: "weekend-evenings", label: "Weekend Evenings" },
          ],
        },
        {
          id: "meetingFormat",
          type: "radio",
          label: "Preferred Meeting Format",
          required: true,
          options: [
            { value: "virtual", label: "Virtual" },
            { value: "in-person", label: "In-Person" },
            { value: "both", label: "Both" },
          ],
        },
        {
          id: "bookingLink",
          type: "text",
          label: "Booking Link (optional)",
          placeholder: "https://calendly.com/your-link",
          required: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.formTemplates.set(mentorForm.id, mentorForm);

    // Create sample mentee form template
    const menteeForm: FormTemplate = {
      id: this.formTemplateId++,
      organizationId: organization.id,
      name: "Mentee Onboarding Form",
      type: "mentee",
      fields: [
        {
          id: "name",
          type: "text",
          label: "Full Name",
          placeholder: "Jane Doe",
          required: true,
        },
        {
          id: "background",
          type: "textarea",
          label: "Professional Background",
          placeholder: "Brief description of your professional background...",
          required: true,
        },
        {
          id: "goals",
          type: "textarea",
          label: "Mentorship Goals",
          placeholder: "What do you hope to achieve through mentorship?",
          required: true,
        },
        {
          id: "industry",
          type: "select",
          label: "Industry",
          required: true,
          options: [
            { value: "technology", label: "Technology" },
            { value: "healthcare", label: "Healthcare" },
            { value: "finance", label: "Finance" },
            { value: "education", label: "Education" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "interests",
          type: "multiselect",
          label: "Areas of Interest",
          required: true,
          options: [
            { value: "marketing", label: "Marketing" },
            { value: "sales", label: "Sales" },
            { value: "product", label: "Product Management" },
            { value: "engineering", label: "Engineering" },
            { value: "design", label: "Design" },
            { value: "finance", label: "Finance" },
            { value: "operations", label: "Operations" },
          ],
        },
        {
          id: "availability",
          type: "checkbox",
          label: "Availability",
          required: true,
          options: [
            { value: "weekday-mornings", label: "Weekday Mornings" },
            { value: "weekday-afternoons", label: "Weekday Afternoons" },
            { value: "weekday-evenings", label: "Weekday Evenings" },
            { value: "weekend-mornings", label: "Weekend Mornings" },
            { value: "weekend-afternoons", label: "Weekend Afternoons" },
            { value: "weekend-evenings", label: "Weekend Evenings" },
          ],
        },
        {
          id: "meetingFormat",
          type: "radio",
          label: "Preferred Meeting Format",
          required: true,
          options: [
            { value: "virtual", label: "Virtual" },
            { value: "in-person", label: "In-Person" },
            { value: "both", label: "Both" },
          ],
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.formTemplates.set(menteeForm.id, menteeForm);

    // Create sample mentors
    const mentor1: Mentor = {
      id: this.mentorId++,
      userId: null,
      organizationId: organization.id,
      name: "David Wilson",
      email: "david.wilson@example.com",
      title: "Marketing Director",
      organization: "GrowthCo",
      bio: "Experienced marketing professional with a passion for helping startups.",
      industry: "technology",
      expertise: ["marketing", "sales"],
      availability: ["weekday-evenings", "weekend-mornings"],
      bookingLink: "https://calendly.com/david-wilson",
      preferredMeetingFormat: "virtual",
      yearsOfExperience: "10+",
      active: true,
      profileCompleted: true,
      formResponses: {
        name: "David Wilson",
        title: "Marketing Director",
        organization: "GrowthCo",
        industry: "technology",
        expertise: ["marketing", "sales"],
        yearsOfExperience: "10+",
        availability: ["weekday-evenings", "weekend-mornings"],
        meetingFormat: "virtual",
        bookingLink: "https://calendly.com/david-wilson",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mentors.set(mentor1.id, mentor1);

    const mentor2: Mentor = {
      id: this.mentorId++,
      userId: null,
      organizationId: organization.id,
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      title: "CMO",
      organization: "TechStart Inc.",
      bio: "Passionate about startup marketing and growth strategies.",
      industry: "technology",
      expertise: ["marketing", "product"],
      availability: ["weekday-afternoons", "weekend-mornings"],
      bookingLink: "https://calendly.com/sarah-johnson",
      preferredMeetingFormat: "both",
      yearsOfExperience: "7-10",
      active: true,
      profileCompleted: true,
      formResponses: {
        name: "Sarah Johnson",
        title: "CMO",
        organization: "TechStart Inc.",
        industry: "technology",
        expertise: ["marketing", "product"],
        yearsOfExperience: "7-10",
        availability: ["weekday-afternoons", "weekend-mornings"],
        meetingFormat: "both",
        bookingLink: "https://calendly.com/sarah-johnson",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mentors.set(mentor2.id, mentor2);

    const mentor3: Mentor = {
      id: this.mentorId++,
      userId: null,
      organizationId: organization.id,
      name: "Jason Rodriguez",
      email: "jason.rodriguez@example.com",
      title: "Senior Developer",
      organization: "TechCorp",
      bio: "Backend developer with a focus on scalable systems.",
      industry: "technology",
      expertise: ["engineering"],
      availability: ["weekday-evenings", "weekend-afternoons"],
      bookingLink: "https://calendly.com/jason-rodriguez",
      preferredMeetingFormat: "virtual",
      yearsOfExperience: "4-6",
      active: true,
      profileCompleted: true,
      formResponses: {
        name: "Jason Rodriguez",
        title: "Senior Developer",
        organization: "TechCorp",
        industry: "technology",
        expertise: ["engineering"],
        yearsOfExperience: "4-6",
        availability: ["weekday-evenings", "weekend-afternoons"],
        meetingFormat: "virtual",
        bookingLink: "https://calendly.com/jason-rodriguez",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mentors.set(mentor3.id, mentor3);

    // Create sample mentees
    const mentee1: Mentee = {
      id: this.menteeId++,
      userId: null,
      organizationId: organization.id,
      name: "Emily Chen",
      email: "emily.chen@example.com",
      background: "Recent marketing graduate looking to break into tech.",
      goals: "Gain insights on digital marketing strategies for startups.",
      industry: "technology",
      interests: ["marketing", "sales"],
      availability: ["weekday-evenings", "weekend-mornings"],
      preferredMeetingFormat: "virtual",
      active: true,
      profileCompleted: true,
      formResponses: {
        name: "Emily Chen",
        background: "Recent marketing graduate looking to break into tech.",
        goals: "Gain insights on digital marketing strategies for startups.",
        industry: "technology",
        interests: ["marketing", "sales"],
        availability: ["weekday-evenings", "weekend-mornings"],
        meetingFormat: "virtual",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mentees.set(mentee1.id, mentee1);

    const mentee2: Mentee = {
      id: this.menteeId++,
      userId: null,
      organizationId: organization.id,
      name: "Marcus Brown",
      email: "marcus.brown@example.com",
      background: "Self-taught developer looking to improve backend skills.",
      goals: "Learn about scalable architecture and backend best practices.",
      industry: "technology",
      interests: ["engineering"],
      availability: ["weekday-evenings", "weekend-afternoons"],
      preferredMeetingFormat: "virtual",
      active: true,
      profileCompleted: true,
      formResponses: {
        name: "Marcus Brown",
        background: "Self-taught developer looking to improve backend skills.",
        goals: "Learn about scalable architecture and backend best practices.",
        industry: "technology",
        interests: ["engineering"],
        availability: ["weekday-evenings", "weekend-afternoons"],
        meetingFormat: "virtual",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.mentees.set(mentee2.id, mentee2);

    // Create sample matches
    const match1: Match = {
      id: this.matchId++,
      organizationId: organization.id,
      mentorId: mentor1.id,
      menteeId: mentee1.id,
      matchScore: 95,
      matchReasons: [
        "Both specialize in digital marketing",
        "David has 10+ years experience in areas Emily wants to learn",
        "Both indicated availability on weekday evenings",
      ],
      status: "pending",
      adminId: admin.id,
      introEmailSent: false,
      followUpEmailSent: false,
      sessionScheduled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matches.set(match1.id, match1);

    const match2: Match = {
      id: this.matchId++,
      organizationId: organization.id,
      mentorId: mentor2.id,
      menteeId: mentee1.id,
      matchScore: 83,
      matchReasons: [
        "Both interested in startup marketing strategies",
        "Sarah has experience in Emily's target industry",
        "Both prefer structured mentoring approach",
      ],
      status: "pending",
      adminId: admin.id,
      introEmailSent: false,
      followUpEmailSent: false,
      sessionScheduled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matches.set(match2.id, match2);

    const match3: Match = {
      id: this.matchId++,
      organizationId: organization.id,
      mentorId: mentor3.id,
      menteeId: mentee2.id,
      matchScore: 91,
      matchReasons: [
        "Both specialize in backend development",
        "Jason has expertise in technologies Marcus wants to learn",
        "Both have flexible weekend availability",
      ],
      status: "pending",
      adminId: admin.id,
      introEmailSent: false,
      followUpEmailSent: false,
      sessionScheduled: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.matches.set(match3.id, match3);

    // Create sample completed matches with sessions and ratings
    const completedMatch: Match = {
      id: this.matchId++,
      organizationId: organization.id,
      mentorId: mentor1.id,
      menteeId: mentee2.id,
      matchScore: 75,
      matchReasons: [
        "Marcus wants to learn about tech industry",
        "David has cross-functional experience",
      ],
      status: "completed",
      adminId: admin.id,
      introEmailSent: true,
      followUpEmailSent: true,
      sessionScheduled: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(),
    };
    this.matches.set(completedMatch.id, completedMatch);

    // Create sample session
    const session: MentoringSession = {
      id: this.mentoringSessionId++,
      matchId: completedMatch.id,
      scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      status: "completed",
      mentorFeedback:
        "Great session, Marcus is very motivated and asked good questions.",
      menteeFeedback:
        "David provided valuable insights about the industry. Very helpful!",
      mentorRating: 5,
      menteeRating: 5,
      feedbackEmailSent: true,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      updatedAt: new Date(),
    };
    this.mentoringSessions.set(session.id, session);
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(user.id, newUser);
    return newUser;
  }

  async upsertUser(user: InsertUser): Promise<User> {
    const existingUser = await this.getUser(user.id);

    if (existingUser) {
      // Update existing user
      const updatedUser: User = {
        ...existingUser,
        ...user,
        updatedAt: new Date(),
      };
      this.users.set(user.id, updatedUser);
      return updatedUser;
    } else {
      // Create new user
      return this.createUser(user);
    }
  }

  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    return this.organizations.get(id);
  }

  async createOrganization(
    organization: InsertOrganization,
  ): Promise<Organization> {
    const id = this.organizationId++;
    const newOrganization: Organization = {
      ...organization,
      id,
      createdAt: new Date(),
    };
    this.organizations.set(id, newOrganization);
    return newOrganization;
  }

  async updateOrganization(
    id: number,
    organization: Partial<Organization>,
  ): Promise<Organization | undefined> {
    const existingOrganization = this.organizations.get(id);
    if (!existingOrganization) return undefined;

    const updatedOrganization = { ...existingOrganization, ...organization };
    this.organizations.set(id, updatedOrganization);
    return updatedOrganization;
  }

  // Form template operations
  async getFormTemplates(organizationId: number): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values()).filter(
      (template) => template.organizationId === organizationId,
    );
  }

  async getFormTemplatesByType(
    organizationId: number,
    type: string,
  ): Promise<FormTemplate[]> {
    return Array.from(this.formTemplates.values()).filter(
      (template) =>
        template.organizationId === organizationId && template.type === type,
    );
  }

  async getFormTemplate(id: number): Promise<FormTemplate | undefined> {
    return this.formTemplates.get(id);
  }

  async createFormTemplate(
    formTemplate: InsertFormTemplate,
  ): Promise<FormTemplate> {
    const id = this.formTemplateId++;
    const now = new Date();
    const newFormTemplate: FormTemplate = {
      ...formTemplate,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.formTemplates.set(id, newFormTemplate);
    return newFormTemplate;
  }

  async updateFormTemplate(
    id: number,
    formTemplate: Partial<FormTemplate>,
  ): Promise<FormTemplate | undefined> {
    const existingFormTemplate = this.formTemplates.get(id);
    if (!existingFormTemplate) return undefined;

    const updatedFormTemplate = {
      ...existingFormTemplate,
      ...formTemplate,
      updatedAt: new Date(),
    };
    this.formTemplates.set(id, updatedFormTemplate);
    return updatedFormTemplate;
  }

  async deleteFormTemplate(id: number): Promise<boolean> {
    return this.formTemplates.delete(id);
  }

  // Mentor operations
  async getMentors(organizationId: number): Promise<Mentor[]> {
    return Array.from(this.mentors.values()).filter(
      (mentor) => mentor.organizationId === organizationId,
    );
  }

  async getMentor(id: number): Promise<Mentor | undefined> {
    return this.mentors.get(id);
  }

  async getMentorByEmail(email: string): Promise<Mentor | undefined> {
    return Array.from(this.mentors.values()).find(
      (mentor) => mentor.email === email,
    );
  }

  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const id = this.mentorId++;
    const now = new Date();
    const newMentor: Mentor = {
      ...mentor,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.mentors.set(id, newMentor);
    return newMentor;
  }

  async updateMentor(
    id: number,
    mentor: Partial<Mentor>,
  ): Promise<Mentor | undefined> {
    const existingMentor = this.mentors.get(id);
    if (!existingMentor) return undefined;

    const updatedMentor = {
      ...existingMentor,
      ...mentor,
      updatedAt: new Date(),
    };
    this.mentors.set(id, updatedMentor);
    return updatedMentor;
  }

  // Mentee operations
  async getMentees(organizationId: number): Promise<Mentee[]> {
    return Array.from(this.mentees.values()).filter(
      (mentee) => mentee.organizationId === organizationId,
    );
  }

  async getMentee(id: number): Promise<Mentee | undefined> {
    return this.mentees.get(id);
  }

  async getMenteeByEmail(email: string): Promise<Mentee | undefined> {
    return Array.from(this.mentees.values()).find(
      (mentee) => mentee.email === email,
    );
  }

  async createMentee(mentee: InsertMentee): Promise<Mentee> {
    const id = this.menteeId++;
    const now = new Date();
    const newMentee: Mentee = {
      ...mentee,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.mentees.set(id, newMentee);
    return newMentee;
  }

  async updateMentee(
    id: number,
    mentee: Partial<Mentee>,
  ): Promise<Mentee | undefined> {
    const existingMentee = this.mentees.get(id);
    if (!existingMentee) return undefined;

    const updatedMentee = {
      ...existingMentee,
      ...mentee,
      updatedAt: new Date(),
    };
    this.mentees.set(id, updatedMentee);
    return updatedMentee;
  }

  // Match operations
  async getMatches(organizationId: number): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) => match.organizationId === organizationId,
    );
  }

  async getMatchesByStatus(
    organizationId: number,
    status: string,
  ): Promise<Match[]> {
    return Array.from(this.matches.values()).filter(
      (match) =>
        match.organizationId === organizationId && match.status === status,
    );
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.matchId++;
    const now = new Date();
    const newMatch: Match = {
      ...match,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  async updateMatch(
    id: number,
    match: Partial<Match>,
  ): Promise<Match | undefined> {
    const existingMatch = this.matches.get(id);
    if (!existingMatch) return undefined;

    const updatedMatch = {
      ...existingMatch,
      ...match,
      updatedAt: new Date(),
    };
    this.matches.set(id, updatedMatch);
    return updatedMatch;
  }

  // Mentoring Session operations
  async getMentoringSessions(matchId: number): Promise<MentoringSession[]> {
    return Array.from(this.mentoringSessions.values()).filter(
      (session) => session.matchId === matchId,
    );
  }

  async getMentoringSession(id: number): Promise<MentoringSession | undefined> {
    return this.mentoringSessions.get(id);
  }

  async createMentoringSession(
    session: InsertMentoringSession,
  ): Promise<MentoringSession> {
    const id = this.mentoringSessionId++;
    const now = new Date();
    const newSession: MentoringSession = {
      ...session,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.mentoringSessions.set(id, newSession);
    return newSession;
  }

  async updateMentoringSession(
    id: number,
    session: Partial<MentoringSession>,
  ): Promise<MentoringSession | undefined> {
    const existingSession = this.mentoringSessions.get(id);
    if (!existingSession) return undefined;

    const updatedSession = {
      ...existingSession,
      ...session,
      updatedAt: new Date(),
    };
    this.mentoringSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Analytics
  async getTotalMatches(organizationId: number): Promise<number> {
    return Array.from(this.matches.values()).filter(
      (match) => match.organizationId === organizationId,
    ).length;
  }

  async getActiveMentors(organizationId: number): Promise<number> {
    return Array.from(this.mentors.values()).filter(
      (mentor) => mentor.organizationId === organizationId && mentor.active,
    ).length;
  }

  async getSessionsCompleted(organizationId: number): Promise<number> {
    const matchIds = Array.from(this.matches.values())
      .filter((match) => match.organizationId === organizationId)
      .map((match) => match.id);

    return Array.from(this.mentoringSessions.values()).filter(
      (session) =>
        matchIds.includes(session.matchId) && session.status === "completed",
    ).length;
  }

  async getAverageRating(organizationId: number): Promise<number> {
    const matchIds = Array.from(this.matches.values())
      .filter((match) => match.organizationId === organizationId)
      .map((match) => match.id);

    const sessions = Array.from(this.mentoringSessions.values()).filter(
      (session) =>
        matchIds.includes(session.matchId) && session.status === "completed",
    );

    if (sessions.length === 0) return 0;

    const totalRatings = sessions.reduce((sum, session) => {
      const ratings = [];
      if (session.mentorRating) ratings.push(session.mentorRating);
      if (session.menteeRating) ratings.push(session.menteeRating);
      return (
        sum +
        (ratings.length
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : 0)
      );
    }, 0);

    return parseFloat((totalRatings / sessions.length).toFixed(1));
  }

  async getPendingMatches(organizationId: number): Promise<number> {
    return Array.from(this.matches.values()).filter(
      (match) =>
        match.organizationId === organizationId && match.status === "pending",
    ).length;
  }
}

// Import the DatabaseStorage implementation
import { DatabaseStorage } from "./db-storage";

// Use DatabaseStorage for persistent data storage
// We've set this to always use DatabaseStorage rather than relying on environment variables
// since we want to persist user authentication data

// Export the appropriate storage implementation
export const storage = new DatabaseStorage();
