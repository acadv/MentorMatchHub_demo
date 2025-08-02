import { Mentor, Mentee, Match } from "@shared/schema";

// Types of match reasons
type MatchReason = string;

// Interface for AI match scores
interface MatchScore {
  score: number;
  reasons: MatchReason[];
}

// Calculate expertise match score based on mentor's expertise and mentee's interests
function calculateExpertiseMatch(mentor: Mentor, mentee: Mentee): number {
  if (!mentor.expertise || !mentee.interests) return 0;
  
  const mentorExpertise = Array.isArray(mentor.expertise) ? mentor.expertise : [];
  const menteeInterests = Array.isArray(mentee.interests) ? mentee.interests : [];
  
  if (mentorExpertise.length === 0 || menteeInterests.length === 0) return 0;
  
  // Count matching areas
  const matchingAreas = mentorExpertise.filter(expertise => 
    menteeInterests.includes(expertise)
  ).length;
  
  // Calculate percentage of mentee interests that are covered
  return Math.min(100, Math.round((matchingAreas / menteeInterests.length) * 100));
}

// Calculate industry match score
function calculateIndustryMatch(mentor: Mentor, mentee: Mentee): number {
  if (!mentor.industry || !mentee.industry) return 0;
  
  return mentor.industry === mentee.industry ? 100 : 0;
}

// Calculate availability match score
function calculateAvailabilityMatch(mentor: Mentor, mentee: Mentee): number {
  if (!mentor.availability || !mentee.availability) return 0;
  
  const mentorAvailability = Array.isArray(mentor.availability) ? mentor.availability : [];
  const menteeAvailability = Array.isArray(mentee.availability) ? mentee.availability : [];
  
  if (mentorAvailability.length === 0 || menteeAvailability.length === 0) return 0;
  
  // Count common availability slots
  const commonSlots = mentorAvailability.filter(slot => 
    menteeAvailability.includes(slot)
  ).length;
  
  // Calculate based on overlap
  return Math.min(100, Math.round((commonSlots / Math.min(mentorAvailability.length, menteeAvailability.length)) * 100));
}

// Calculate meeting format match
function calculateMeetingFormatMatch(mentor: Mentor, mentee: Mentee): number {
  if (!mentor.preferredMeetingFormat || !mentee.preferredMeetingFormat) return 0;
  
  // If either prefers 'both', it's a match
  if (mentor.preferredMeetingFormat === 'both' || mentee.preferredMeetingFormat === 'both') return 100;
  
  // Check if preferences match directly
  return mentor.preferredMeetingFormat === mentee.preferredMeetingFormat ? 100 : 0;
}

// Generate specific match reasons
function generateMatchReasons(mentor: Mentor, mentee: Mentee, scores: Record<string, number>): MatchReason[] {
  const reasons: MatchReason[] = [];
  
  // Add expertise match reasons
  if (scores.expertise > 50) {
    const mentorExpertise = Array.isArray(mentor.expertise) ? mentor.expertise : [];
    const menteeInterests = Array.isArray(mentee.interests) ? mentee.interests : [];
    const matchingAreas = mentorExpertise.filter(expertise => menteeInterests.includes(expertise));
    
    if (matchingAreas.length > 0) {
      if (matchingAreas.length === menteeInterests.length) {
        reasons.push(`${mentor.name} has expertise in all areas that ${mentee.name} is interested in`);
      } else {
        reasons.push(`Both share interests in ${matchingAreas.slice(0, 2).join(', ')}${matchingAreas.length > 2 ? ' and more' : ''}`);
      }
    }
  }
  
  // Add industry match reasons
  if (scores.industry === 100) {
    reasons.push(`Both work in the ${mentor.industry} industry`);
  }
  
  // Add experience-based reason if applicable
  if (mentor.yearsOfExperience === '10+') {
    reasons.push(`${mentor.name} has 10+ years experience in areas ${mentee.name} wants to learn`);
  }
  
  // Add availability match reasons
  if (scores.availability > 50) {
    const mentorAvailability = Array.isArray(mentor.availability) ? mentor.availability : [];
    const menteeAvailability = Array.isArray(mentee.availability) ? mentee.availability : [];
    const commonSlots = mentorAvailability.filter(slot => menteeAvailability.includes(slot));
    
    if (commonSlots.includes('weekday-evenings')) {
      reasons.push('Both indicated availability on weekday evenings');
    } else if (commonSlots.includes('weekend-mornings')) {
      reasons.push('Both have weekend morning availability');
    } else if (commonSlots.length > 0) {
      reasons.push('Both have overlapping availability');
    }
  }
  
  // Add meeting format reason
  if (scores.meetingFormat === 100) {
    reasons.push(`Both prefer ${mentor.preferredMeetingFormat === 'both' ? 'flexible' : mentor.preferredMeetingFormat} meeting format`);
  }
  
  // Add booking link reason if applicable
  if (mentor.bookingLink) {
    reasons.push(`${mentor.name} has a booking link for easy scheduling`);
  }
  
  return reasons;
}

// Main function to generate match score and reasons
export function generateMatchScore(mentor: Mentor, mentee: Mentee): MatchScore {
  // Calculate individual category scores
  const scores = {
    expertise: calculateExpertiseMatch(mentor, mentee),
    industry: calculateIndustryMatch(mentor, mentee),
    availability: calculateAvailabilityMatch(mentor, mentee),
    meetingFormat: calculateMeetingFormatMatch(mentor, mentee)
  };
  
  // Calculate weighted score
  const weightedScore = Math.round(
    (scores.expertise * 0.4) + 
    (scores.industry * 0.2) + 
    (scores.availability * 0.3) + 
    (scores.meetingFormat * 0.1)
  );
  
  // Generate match reasons
  const reasons = generateMatchReasons(mentor, mentee, scores);
  
  return {
    score: weightedScore,
    reasons: reasons.length > 0 ? reasons : ['AI has determined this could be a good match']
  };
}

// Find top matches for a mentee
export function findTopMatchesForMentee(mentee: Mentee, mentors: Mentor[], maxMatches: number = 3): Match[] {
  if (!mentors.length) return [];
  
  // Generate scores for all mentors
  const matches = mentors.map(mentor => {
    const { score, reasons } = generateMatchScore(mentor, mentee);
    return {
      mentorId: mentor.id,
      menteeId: mentee.id,
      organizationId: mentee.organizationId,
      matchScore: score,
      matchReasons: reasons,
      status: 'pending',
      introEmailSent: false,
      followUpEmailSent: false,
      sessionScheduled: false
    } as Match;
  });
  
  // Sort by score and take top matches
  return matches
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, maxMatches);
}

// Find all possible matches above a threshold
export function generateMatches(mentees: Mentee[], mentors: Mentor[], threshold: number = 70): Match[] {
  if (!mentees.length || !mentors.length) return [];
  
  const allMatches: Match[] = [];
  
  // For each mentee, find matching mentors
  mentees.forEach(mentee => {
    mentors.forEach(mentor => {
      const { score, reasons } = generateMatchScore(mentor, mentee);
      
      // Only include matches above threshold
      if (score >= threshold) {
        allMatches.push({
          mentorId: mentor.id,
          menteeId: mentee.id,
          organizationId: mentee.organizationId,
          matchScore: score,
          matchReasons: reasons,
          status: 'pending',
          introEmailSent: false,
          followUpEmailSent: false,
          sessionScheduled: false
        } as Match);
      }
    });
  });
  
  // Sort by score
  return allMatches.sort((a, b) => b.matchScore - a.matchScore);
}
