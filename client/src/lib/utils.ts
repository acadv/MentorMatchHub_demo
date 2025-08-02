import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  });
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}

// Generate a random ID for form elements
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Filter and format form responses
export function formatFormResponses(responses: Record<string, any>, fields: any[]): Record<string, string> {
  const formatted: Record<string, string> = {};
  
  fields.forEach(field => {
    const value = responses[field.id];
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        formatted[field.label] = value.join(', ');
      } else {
        formatted[field.label] = String(value);
      }
    }
  });
  
  return formatted;
}

// Display formatted form responses or return original value
export function displayFormValue(formResponses: any, fieldName: string, defaultValue: any) {
  if (!formResponses) return defaultValue;
  
  // Try to get directly from formResponses if it exists
  if (formResponses[fieldName] !== undefined) {
    if (Array.isArray(formResponses[fieldName])) {
      return formResponses[fieldName];
    }
    return formResponses[fieldName];
  }
  
  // Default fallback
  return defaultValue;
}

// Format a match score as a percentage
export function formatMatchScore(score: number): string {
  return `${score}%`;
}

// Convert email to avatar URL (placeholder)
export function getAvatarUrl(email: string): string {
  const hash = btoa(email).substring(0, 12);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${hash}`;
}

// Calculate progress percentage
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// Format a rating as stars
export function formatRating(rating: number): string {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Parse CSV of emails
export function parseEmailList(text: string): string[] {
  if (!text) return [];
  
  return text
    .split(/[,;\n]/)
    .map(email => email.trim())
    .filter(email => email && isValidEmail(email));
}

// Get initials from name
export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}
