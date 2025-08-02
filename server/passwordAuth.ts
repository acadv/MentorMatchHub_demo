import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import { loginSchema, registerSchema } from '@shared/schema';
import { storage } from './storage';
import { randomUUID } from 'crypto';

// Helper function to hash a password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Helper function to verify a password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Register a new user with password
export async function registerUser(req: Request, res: Response) {
  try {
    // Validate the request body
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validation.error.format() });
    }

    const { username, email, password } = validation.data;

    // Check if the username already exists
    const existingUserByUsername = await storage.getUserByUsername(username);
    if (existingUserByUsername) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Check if the email already exists
    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const hashedPassword = await hashPassword(password);

    // Create a new user with the hashed password
    const user = await storage.createUser({
      id: randomUUID(), // Generate a unique ID for the user
      username,
      email,
      password: hashedPassword,
      role: 'admin', // Default role
      authType: 'password',
      organizationId: 6, // Default organization
    });
    // ── LOGGING for debug ─────────────────────────────────────────────
    console.log('🎉 New user registered:', {
      id:             user.id,
      username:       user.username,
      email:          user.email,
      role:           user.role,
      organizationId: user.organizationId,
      authType:       user.authType,

    });
    // ─────────────────────────────────────────────────────────────────

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to login after registration' });
      }

      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(201).json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Registration failed' });
  }
}


// Login a user with password
export async function loginUserWithPassword(req: Request, res: Response, next: NextFunction) {
  try {
    // Validate the request body
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validation.error.format() });
    }

    const { username, password } = validation.data;

    // Find the user by username
    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check if the user has a password (was registered with password auth)
    if (!user.password) {
      return res.status(401).json({ message: 'This account uses another authentication method' });
    }

    // Verify the password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Log the user in
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Login failed' });
      }

      // Return the user without the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Login failed' });
  }
}