import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { sendMentorWelcomeEmail, sendMenteeWelcomeEmail } from "./emails";
import { log } from "./vite";
import { registerSubscriptionRoutes } from "./subscription-routes";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { registerUser, loginUserWithPassword } from "./passwordAuth";
import {
  insertUserSchema,
  insertOrganizationSchema,
  insertFormTemplateSchema,
  insertMentorSchema,
  insertMenteeSchema,
  insertMatchSchema,
  insertMentoringSessionSchema,
  loginSchema,
  registerSchema,
} from "@shared/schema";
import express from 'express';
import { getOrCreateCustomer, createCheckoutSession } from './stripe';
import { db } from './db';


export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  // ─── BODY PARSERS ───────────────────────────────────────────────
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  // ────────────────────────────────────────────────────────────────
  // Setup authentication
  await setupAuth(app);
  
  // Password-based authentication routes
  app.post('/api/register', registerUser);
  app.post('/api/login/password', loginUserWithPassword);
  
  // Auth user endpoint
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      /* commented to resolve redirect to login
      // If user authenticated via password, the user ID is stored differently
      const userId = req.user.claims?.sub || req.user.id;
      const user = await storage.getUser(userId);
      res.json(user);
      */
    //////////////////////
       // If there's no session user, just return null
       
        if (!req.user) {
          return res.json(null);
        }
        // Otherwise look them up in your DB
        const userId = req.user.claims?.sub || req.user.id;
        const user = await storage.getUser(userId);
        res.json(user);

      ////////////////////
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Register subscription routes
  registerSubscriptionRoutes(app);

  // Organization routes
  app.get("/api/organizations/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const organization = await storage.getOrganization(id);
    
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    
    res.json(organization);
  });
  
  app.patch("/api/organizations/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertOrganizationSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const organization = await storage.updateOrganization(id, data);
      
      if (!organization) {
        return res.status(404).json({ message: "Organization not found" });
      }
      
      res.json(organization);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Form template routes
  app.get("/api/form-templates", async (req: Request, res: Response) => {
    const organizationId = parseInt(req.query.organizationId as string || "1");
    const type = req.query.type as string;
    
    let templates;
    if (type) {
      templates = await storage.getFormTemplatesByType(organizationId, type);
    } else {
      templates = await storage.getFormTemplates(organizationId);
    }
    
    res.json(templates);
  });
  
  app.get("/api/form-templates/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const template = await storage.getFormTemplate(id);
    
    if (!template) {
      return res.status(404).json({ message: "Form template not found" });
    }
    
    res.json(template);
  });
  
  app.post("/api/form-templates", async (req: Request, res: Response) => {
    try {
      const data = insertFormTemplateSchema.parse(req.body);
      const template = await storage.createFormTemplate(data);
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/form-templates/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertFormTemplateSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const template = await storage.updateFormTemplate(id, data);
      
      if (!template) {
        return res.status(404).json({ message: "Form template not found" });
      }
      
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.delete("/api/form-templates/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteFormTemplate(id);
    
    if (!success) {
      return res.status(404).json({ message: "Form template not found" });
    }
    
    res.status(204).send();
  });
  
  // Mentor routes
  app.get("/api/mentors", async (req: Request, res: Response) => {
    const organizationId = parseInt(req.query.organizationId as string || "1");
    const mentors = await storage.getMentors(organizationId);
    res.json(mentors);
  });
  
  app.get("/api/mentors/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const mentor = await storage.getMentor(id);
    
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    
    res.json(mentor);
  });
  
  app.post("/api/mentors", async (req: Request, res: Response) => {
    try {
      const data = insertMentorSchema.parse(req.body);
      
      // Check if mentor already exists with this email
      const existingMentor = await storage.getMentorByEmail(data.email);
      if (existingMentor) {
        return res.status(409).json({ message: "Mentor with this email already exists" });
      }
      
      const mentor = await storage.createMentor(data);
      res.status(201).json(mentor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/mentors/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertMentorSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const mentor = await storage.updateMentor(id, data);
      
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      
      res.json(mentor);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mentor approval endpoint
  app.post("/api/mentors/:id/approve", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    try {
      // Get the mentor
      const mentor = await storage.getMentor(id);
      if (!mentor) {
        return res.status(404).json({ message: "Mentor not found" });
      }
      
      // Update mentor to approved status
      const updatedMentor = await storage.updateMentor(id, { 
        approved: true 
      });
      
      // If welcome email hasn't been sent yet, send it
      if (!mentor.welcomeEmailSent) {
        // Get organization data for the email
        const organization = await storage.getOrganization(mentor.organizationId);
        if (!organization) {
          return res.status(500).json({ message: "Organization not found" });
        }
        
        // Send welcome email
        const emailSent = await sendMentorWelcomeEmail(updatedMentor!, organization);
        
        // Update mentor record to indicate email was sent
        if (emailSent) {
          await storage.updateMentor(id, { welcomeEmailSent: true });
          updatedMentor!.welcomeEmailSent = true;
        }
      }
      
      res.json({ 
        success: true, 
        mentor: updatedMentor,
        message: "Mentor approved successfully"
      });
    } catch (error) {
      console.error("Error approving mentor:", error);
      res.status(500).json({ message: "Failed to approve mentor" });
    }
  });
  
  // Mentee routes
  app.get("/api/mentees", async (req: Request, res: Response) => {
    const organizationId = parseInt(req.query.organizationId as string || "1");
    const mentees = await storage.getMentees(organizationId);
    res.json(mentees);
  });
  
  app.get("/api/mentees/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const mentee = await storage.getMentee(id);
    
    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found" });
    }
    
    res.json(mentee);
  });
  
  app.post("/api/mentees", async (req: Request, res: Response) => {
    try {
      const data = insertMenteeSchema.parse(req.body);
      
      // Check if mentee already exists with this email
      const existingMentee = await storage.getMenteeByEmail(data.email);
      if (existingMentee) {
        return res.status(409).json({ message: "Mentee with this email already exists" });
      }
      
      const mentee = await storage.createMentee(data);
      res.status(201).json(mentee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/mentees/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertMenteeSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const mentee = await storage.updateMentee(id, data);
      
      if (!mentee) {
        return res.status(404).json({ message: "Mentee not found" });
      }
      
      res.json(mentee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mentee approval endpoint
  app.post("/api/mentees/:id/approve", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    try {
      // Get the mentee
      const mentee = await storage.getMentee(id);
      if (!mentee) {
        return res.status(404).json({ message: "Mentee not found" });
      }
      
      // Update mentee to approved status
      const updatedMentee = await storage.updateMentee(id, { 
        approved: true 
      });
      
      // If welcome email hasn't been sent yet, send it
      if (!mentee.welcomeEmailSent) {
        // Get organization data for the email
        const organization = await storage.getOrganization(mentee.organizationId);
        if (!organization) {
          return res.status(500).json({ message: "Organization not found" });
        }
        
        // Send welcome email
        const emailSent = await sendMenteeWelcomeEmail(updatedMentee!, organization);
        
        // Update mentee record to indicate email was sent
        if (emailSent) {
          await storage.updateMentee(id, { welcomeEmailSent: true });
          updatedMentee!.welcomeEmailSent = true;
        }
      }
      
      res.json({ 
        success: true, 
        mentee: updatedMentee,
        message: "Mentee approved successfully"
      });
    } catch (error) {
      console.error("Error approving mentee:", error);
      res.status(500).json({ message: "Failed to approve mentee" });
    }
  });
  
  // Match routes
  app.get("/api/matches", async (req: Request, res: Response) => {
    const organizationId = parseInt(req.query.organizationId as string || "1");
    const status = req.query.status as string;
    
    let matches;
    if (status) {
      matches = await storage.getMatchesByStatus(organizationId, status);
    } else {
      matches = await storage.getMatches(organizationId);
    }
    
    res.json(matches);
  });
  
  app.get("/api/matches/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const match = await storage.getMatch(id);
    
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    res.json(match);
  });
  
  app.post("/api/matches", async (req: Request, res: Response) => {
    try {
      const data = insertMatchSchema.parse(req.body);
      
      // Check if mentor exists
      const mentor = await storage.getMentor(data.mentorId);
      if (!mentor) {
        return res.status(400).json({ message: "Mentor not found" });
      }
      
      // Check if mentee exists
      const mentee = await storage.getMentee(data.menteeId);
      if (!mentee) {
        return res.status(400).json({ message: "Mentee not found" });
      }
      
      const match = await storage.createMatch(data);
      res.status(201).json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/matches/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertMatchSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const match = await storage.updateMatch(id, data);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      res.json(match);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mentoring Session routes
  app.get("/api/sessions", async (req: Request, res: Response) => {
    const matchId = parseInt(req.query.matchId as string);
    
    if (!matchId) {
      return res.status(400).json({ message: "Match ID is required" });
    }
    
    const sessions = await storage.getMentoringSessions(matchId);
    res.json(sessions);
  });
  
  app.get("/api/sessions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const session = await storage.getMentoringSession(id);
    
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    res.json(session);
  });
  
  app.post("/api/sessions", async (req: Request, res: Response) => {
    try {
      const data = insertMentoringSessionSchema.parse(req.body);
      
      // Check if match exists
      const match = await storage.getMatch(data.matchId);
      if (!match) {
        return res.status(400).json({ message: "Match not found" });
      }
      
      const session = await storage.createMentoringSession(data);
      
      // Update match as session scheduled
      await storage.updateMatch(data.matchId, { sessionScheduled: true });
      
      res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  app.patch("/api/sessions/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const updateSchema = insertMentoringSessionSchema.partial();
    
    try {
      const data = updateSchema.parse(req.body);
      const session = await storage.updateMentoringSession(id, data);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // If session is completed, update match status
      if (session.status === 'completed' && data.mentorRating && data.menteeRating) {
        await storage.updateMatch(session.matchId, { status: 'completed' });
      }
      
      res.json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Analytics routes
  app.get("/api/analytics", async (req: Request, res: Response) => {
    const organizationId = parseInt(req.query.organizationId as string || "1");
    
    const totalMatches = await storage.getTotalMatches(organizationId);
    const activeMentors = await storage.getActiveMentors(organizationId);
    const sessionsCompleted = await storage.getSessionsCompleted(organizationId);
    const averageRating = await storage.getAverageRating(organizationId);
    const pendingMatches = await storage.getPendingMatches(organizationId);
    
    res.json({
      totalMatches,
      activeMentors,
      sessionsCompleted,
      averageRating,
      pendingMatches
    });
  });
  
  // Helper route to get both a mentor and mentee by ID (for match details)
  app.get("/api/match-details/:matchId", async (req: Request, res: Response) => {
    const matchId = parseInt(req.params.matchId);
    
    const match = await storage.getMatch(matchId);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    const mentor = await storage.getMentor(match.mentorId);
    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }
    
    const mentee = await storage.getMentee(match.menteeId);
    if (!mentee) {
      return res.status(404).json({ message: "Mentee not found" });
    }
    
    const sessions = await storage.getMentoringSessions(matchId);
    
    res.json({
      match,
      mentor,
      mentee,
      sessions
    });
  });
  
  // Send invitation email endpoint
  app.post("/api/invitations", (req: Request, res: Response) => {
    const { emails, userType, message, organizationId, formTemplateId } = req.body;
    
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "Emails are required" });
    }
    
    if (!userType || !['mentor', 'mentee'].includes(userType)) {
      return res.status(400).json({ message: "Valid user type is required" });
    }
    
    // Additional verification for form template (if provided)
    let formTemplate = null;
    if (formTemplateId) {
      // In a real implementation, this would verify the form template exists
      // and is appropriate for the user type
      log(`Using form template ${formTemplateId} for invitations`);
    }
    
    // In a real implementation, this would send actual emails with a link 
    // that includes the form template ID to use during signup
    // For now, we'll just return success
    res.json({
      success: true,
      message: `Invitations sent to ${emails.length} ${userType}s${formTemplateId ? ' with form template' : ''}`,
      invitations: emails.map(email => ({
        email,
        userType,
        formTemplateId: formTemplateId || null,
        sent: true,
        sentAt: new Date()
      }))
    });
  });
  
  // Approve match endpoint
  app.post("/api/matches/:id/approve", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const { adminId } = req.body;
    
    if (!adminId) {
      return res.status(400).json({ message: "Admin ID is required" });
    }
    
    const match = await storage.getMatch(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Update match status to approved
    const updatedMatch = await storage.updateMatch(id, {
      status: 'approved',
      adminId,
      introEmailSent: true,
      updatedAt: new Date()
    });
    
    // In a real implementation, this would send an introduction email
    
    res.json(updatedMatch);
  });
  
  // Send follow-up email endpoint
  app.post("/api/matches/:id/follow-up", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    const match = await storage.getMatch(id);
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }
    
    // Update match to indicate follow-up email was sent
    const updatedMatch = await storage.updateMatch(id, {
      followUpEmailSent: true,
      updatedAt: new Date()
    });
    
    // In a real implementation, this would send a follow-up email
    
    res.json(updatedMatch);
  });
  
  // Send feedback request email endpoint
  app.post("/api/sessions/:id/request-feedback", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    
    const session = await storage.getMentoringSession(id);
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }
    
    // Update session to indicate feedback email was sent
    const updatedSession = await storage.updateMentoringSession(id, {
      feedbackEmailSent: true,
      updatedAt: new Date()
    });
    
    // In a real implementation, this would send feedback request emails
    
    res.json(updatedSession);
  });

  return httpServer;
}
