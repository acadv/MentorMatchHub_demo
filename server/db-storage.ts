import { 
  users, type User, type InsertUser,
  organizations, type Organization, type InsertOrganization,
  formTemplates, type FormTemplate, type InsertFormTemplate,
  mentors, type Mentor, type InsertMentor,
  mentees, type Mentee, type InsertMentee,
  matches, type Match, type InsertMatch,
  mentoringSessions, type MentoringSession, type InsertMentoringSession,
  Form
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async upsertUser(user: InsertUser): Promise<User> {
    // Try to find existing user by email first
    const existingUser = await this.getUserByEmail(user.email);
    
    if (existingUser) {
      // Update existing user
      const [updatedUser] = await db
        .update(users)
        .set({
          ...user,
          updatedAt: new Date()
        })
        .where(eq(users.email, user.email))
        .returning();
      return updatedUser;
    } else {
      // Insert new user
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    }
  }
  
  // Organization operations
  async getOrganization(id: number): Promise<Organization | undefined> {
    const [organization] = await db.select().from(organizations).where(eq(organizations.id, id));
    return organization;
  }
  
  async createOrganization(organization: InsertOrganization): Promise<Organization> {
    const [newOrganization] = await db.insert(organizations).values(organization).returning();
    return newOrganization;
  }
  
  async updateOrganization(id: number, organization: Partial<Organization>): Promise<Organization | undefined> {
    const [updatedOrganization] = await db
      .update(organizations)
      .set(organization)
      .where(eq(organizations.id, id))
      .returning();
    console.log('Updated organization:', updatedOrganization)
    return updatedOrganization;
  }
  
  // Form template operations
  async getFormTemplates(organizationId: number): Promise<FormTemplate[]> {
    return db.select().from(formTemplates).where(eq(formTemplates.organizationId, organizationId));
  }
  
  async getFormTemplatesByType(organizationId: number, type: string): Promise<FormTemplate[]> {
    return db
      .select()
      .from(formTemplates)
      .where(and(
        eq(formTemplates.organizationId, organizationId),
        eq(formTemplates.type, type)
      ));
  }
  
  async getFormTemplate(id: number): Promise<FormTemplate | undefined> {
    const [template] = await db.select().from(formTemplates).where(eq(formTemplates.id, id));
    return template;
  }
  
  async createFormTemplate(formTemplate: InsertFormTemplate): Promise<FormTemplate> {
    const [newTemplate] = await db.insert(formTemplates).values(formTemplate).returning();
    return newTemplate;
  }
  
  async updateFormTemplate(id: number, formTemplate: Partial<FormTemplate>): Promise<FormTemplate | undefined> {
    const [updatedTemplate] = await db
      .update(formTemplates)
      .set({
        ...formTemplate,
        updatedAt: new Date()
      })
      .where(eq(formTemplates.id, id))
      .returning();
    return updatedTemplate;
  }
  
  async deleteFormTemplate(id: number): Promise<boolean> {
    const result = await db.delete(formTemplates).where(eq(formTemplates.id, id));
    return !!result;
  }
  
  // Mentor operations
  async getMentors(organizationId: number): Promise<Mentor[]> {
    return db.select().from(mentors).where(eq(mentors.organizationId, organizationId));
  }
  
  async getMentor(id: number): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.id, id));
    return mentor;
  }
  
  async getMentorByEmail(email: string): Promise<Mentor | undefined> {
    const [mentor] = await db.select().from(mentors).where(eq(mentors.email, email));
    return mentor;
  }
  
  async createMentor(mentor: InsertMentor): Promise<Mentor> {
    const [newMentor] = await db.insert(mentors).values(mentor).returning();
    return newMentor;
  }
  
  async updateMentor(id: number, mentor: Partial<Mentor>): Promise<Mentor | undefined> {
    const [updatedMentor] = await db
      .update(mentors)
      .set({
        ...mentor,
        updatedAt: new Date()
      })
      .where(eq(mentors.id, id))
      .returning();
    return updatedMentor;
  }
  
  // Mentee operations
  async getMentees(organizationId: number): Promise<Mentee[]> {
    return db.select().from(mentees).where(eq(mentees.organizationId, organizationId));
  }
  
  async getMentee(id: number): Promise<Mentee | undefined> {
    const [mentee] = await db.select().from(mentees).where(eq(mentees.id, id));
    return mentee;
  }
  
  async getMenteeByEmail(email: string): Promise<Mentee | undefined> {
    const [mentee] = await db.select().from(mentees).where(eq(mentees.email, email));
    return mentee;
  }
  
  async createMentee(mentee: InsertMentee): Promise<Mentee> {
    const [newMentee] = await db.insert(mentees).values(mentee).returning();
    return newMentee;
  }
  
  async updateMentee(id: number, mentee: Partial<Mentee>): Promise<Mentee | undefined> {
    const [updatedMentee] = await db
      .update(mentees)
      .set({
        ...mentee,
        updatedAt: new Date()
      })
      .where(eq(mentees.id, id))
      .returning();
    return updatedMentee;
  }
  
  // Match operations
  async getMatches(organizationId: number): Promise<Match[]> {
    return db.select().from(matches).where(eq(matches.organizationId, organizationId));
  }
  
  async getMatchesByStatus(organizationId: number, status: string): Promise<Match[]> {
    return db
      .select()
      .from(matches)
      .where(and(
        eq(matches.organizationId, organizationId),
        eq(matches.status, status as any)
      ));
  }
  
  async getMatch(id: number): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }
  
  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }
  
  async updateMatch(id: number, match: Partial<Match>): Promise<Match | undefined> {
    const [updatedMatch] = await db
      .update(matches)
      .set(match)
      .where(eq(matches.id, id))
      .returning();
    return updatedMatch;
  }
  
  // Mentoring Session operations
  async getMentoringSessions(matchId: number): Promise<MentoringSession[]> {
    return db
      .select()
      .from(mentoringSessions)
      .where(eq(mentoringSessions.matchId, matchId));
  }
  
  async getMentoringSession(id: number): Promise<MentoringSession | undefined> {
    const [session] = await db.select().from(mentoringSessions).where(eq(mentoringSessions.id, id));
    return session;
  }
  
  async createMentoringSession(session: InsertMentoringSession): Promise<MentoringSession> {
    const [newSession] = await db.insert(mentoringSessions).values(session).returning();
    return newSession;
  }
  
  async updateMentoringSession(id: number, session: Partial<MentoringSession>): Promise<MentoringSession | undefined> {
    const [updatedSession] = await db
      .update(mentoringSessions)
      .set({
        ...session,
        updatedAt: new Date()
      })
      .where(eq(mentoringSessions.id, id))
      .returning();
    return updatedSession;
  }
  
  // Analytics
  async getTotalMatches(organizationId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(eq(matches.organizationId, organizationId));
    return result[0]?.count || 0;
  }
  
  async getActiveMentors(organizationId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(mentors)
      .where(and(
        eq(mentors.organizationId, organizationId),
        eq(mentors.active, true),
        eq(mentors.approved, true)
      ));
    return result[0]?.count || 0;
  }
  
  async getSessionsCompleted(organizationId: number): Promise<number> {
    // First get all matches for the organization
    const orgMatches = await this.getMatches(organizationId);
    
    // If no matches, return 0
    if (orgMatches.length === 0) return 0;
    
    // Count completed sessions for each match and sum them up
    let totalCompleted = 0;
    for (const match of orgMatches) {
      const result = await db
        .select({ count: sql<number>`count(*)` })
        .from(mentoringSessions)
        .where(and(
          eq(mentoringSessions.matchId, match.id),
          eq(mentoringSessions.status, 'completed')
        ));
      totalCompleted += result[0]?.count || 0;
    }
    
    return totalCompleted;
  }
  
  async getAverageRating(organizationId: number): Promise<number> {
    // First get all matches for the organization
    const orgMatches = await this.getMatches(organizationId);
    
    // If no matches, return 0
    if (orgMatches.length === 0) return 0;
    
    // Collect all ratings from sessions for these matches
    let totalRating = 0;
    let ratingCount = 0;
    
    for (const match of orgMatches) {
      const sessions = await db
        .select()
        .from(mentoringSessions)
        .where(eq(mentoringSessions.matchId, match.id));
      
      for (const session of sessions) {
        if (session.mentorRating !== null) {
          totalRating += session.mentorRating;
          ratingCount++;
        }
        if (session.menteeRating !== null) {
          totalRating += session.menteeRating;
          ratingCount++;
        }
      }
    }
    
    return ratingCount > 0 ? totalRating / ratingCount : 0;
  }
  
  async getPendingMatches(organizationId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(matches)
      .where(and(
        eq(matches.organizationId, organizationId),
        eq(matches.status, 'pending')
      ));
    return result[0]?.count || 0;
  }
}