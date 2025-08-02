import { pgTable, text, serial, integer, boolean, timestamp, json, pgEnum, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User roles enum
export const userRoleEnum = pgEnum('user_role', ['admin', 'mentor', 'mentee']);

// Form field type enum
export const fieldTypeEnum = pgEnum('field_type', [
  'text', 
  'textarea', 
  'select', 
  'multiselect', 
  'checkbox',
  'radio',
  'email',
  'number'
]);

// Match status enum
export const matchStatusEnum = pgEnum('match_status', [
  'pending',
  'approved',
  'rejected',
  'completed'
]);

// Session status enum
export const sessionStatusEnum = pgEnum('session_status', [
  'scheduled',
  'completed',
  'cancelled',
  'pending'
]);

// User table schema
export const users = pgTable("users", {
  id: varchar("id").primaryKey(), // Changed to varchar for Replit Auth compatibility
  email: text("email").notNull().unique(),
  username: text("username").unique(),
  password: text("password"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  role: userRoleEnum("role").notNull().default('admin'),
  organizationId: integer("organization_id"),
  authType: text("auth_type").default('oauth'), // 'oauth' or 'password'
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Organization table schema
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location"),
  about: text("about"),
  logo: text("logo"),
  primaryColor: text("primary_color").default('#3B82F6'),
  secondaryColor: text("secondary_color").default('#8B5CF6'),
  accentColor: text("accent_color").default('#10B981'),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: text("subscription_status"),
  subscriptionPlan: text("subscription_plan"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Form templates table schema
export const formTemplates = pgTable("form_templates", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "mentor" or "mentee"
  fields: json("fields").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentors table schema
export const mentors = pgTable("mentors", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  title: text("title"),
  organization: text("organization"),
  bio: text("bio"),
  industry: text("industry"),
  expertise: json("expertise").$type<string[]>(),
  availability: json("availability").$type<string[]>(),
  bookingLink: text("booking_link"),
  preferredMeetingFormat: text("preferred_meeting_format"),
  yearsOfExperience: text("years_of_experience"),
  active: boolean("active").default(true),
  approved: boolean("approved").default(false),
  welcomeEmailSent: boolean("welcome_email_sent").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  formResponses: json("form_responses").$type<FormResponses>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentees table schema
export const mentees = pgTable("mentees", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"),
  organizationId: integer("organization_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  background: text("background"),
  goals: text("goals"),
  industry: text("industry"), 
  interests: json("interests").$type<string[]>(),
  availability: json("availability").$type<string[]>(),
  preferredMeetingFormat: text("preferred_meeting_format"),
  active: boolean("active").default(true),
  approved: boolean("approved").default(false),
  welcomeEmailSent: boolean("welcome_email_sent").default(false),
  profileCompleted: boolean("profile_completed").default(false),
  formResponses: json("form_responses").$type<FormResponses>(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Matches table schema
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  organizationId: integer("organization_id").notNull(),
  mentorId: integer("mentor_id").notNull(),
  menteeId: integer("mentee_id").notNull(),
  matchScore: integer("match_score"),
  matchReasons: json("match_reasons"),
  status: matchStatusEnum("status").default('pending'),
  adminId: varchar("admin_id"),
  introEmailSent: boolean("intro_email_sent").default(false),
  followUpEmailSent: boolean("follow_up_email_sent").default(false),
  sessionScheduled: boolean("session_scheduled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Mentoring sessions table schema
export const mentoringSessions = pgTable("mentoring_sessions", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  scheduledDate: timestamp("scheduled_date"),
  status: sessionStatusEnum("status").default('pending'),
  mentorFeedback: text("mentor_feedback"),
  menteeFeedback: text("mentee_feedback"),
  mentorRating: integer("mentor_rating"),
  menteeRating: integer("mentee_rating"),
  feedbackEmailSent: boolean("feedback_email_sent").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Auth sessions table schema for Replit Auth
export const authSessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  }
);

// Insert schemas
// Don't omit id for users since it's required for Replit Auth
export const insertUserSchema = createInsertSchema(users).omit({ createdAt: true, updatedAt: true });

// Schema for password login
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

// Schema for user registration with password
export const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});
export const insertOrganizationSchema = createInsertSchema(organizations).omit({ id: true, createdAt: true });
export const insertFormTemplateSchema = createInsertSchema(formTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMentorSchema = createInsertSchema(mentors).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMenteeSchema = createInsertSchema(mentees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMatchSchema = createInsertSchema(matches).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMentoringSessionSchema = createInsertSchema(mentoringSessions).omit({ id: true, createdAt: true, updatedAt: true });

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;

export type FormTemplate = typeof formTemplates.$inferSelect;
export type InsertFormTemplate = z.infer<typeof insertFormTemplateSchema>;

export type Mentor = typeof mentors.$inferSelect;
export type InsertMentor = z.infer<typeof insertMentorSchema>;

export type Mentee = typeof mentees.$inferSelect;
export type InsertMentee = z.infer<typeof insertMenteeSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type MentoringSession = typeof mentoringSessions.$inferSelect;
export type InsertMentoringSession = z.infer<typeof insertMentoringSessionSchema>;

export type AuthSession = typeof authSessions.$inferSelect;

// Form field types for the form builder
export const formFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'textarea', 'select', 'multiselect', 'checkbox', 'radio', 'email', 'number']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  options: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).optional(),
  defaultValue: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]).optional(),
});

export type FormField = z.infer<typeof formFieldSchema>;

export const formSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['mentor', 'mentee']),
  fields: z.array(formFieldSchema),
});

export type Form = z.infer<typeof formSchema>;

// Form responses type
export type FormResponses = {
  [key: string]: string | string[] | number | boolean | null;
};
