
/**
 * Content Moderation System
 * Detects inappropriate language, name-calling, and disrespectful behavior
 */

export interface ModerationResult {
  isViolation: boolean
  violationType?: string
  severity?: 'minor' | 'moderate' | 'severe'
  flaggedWords: string[]
  message?: string
}

// Define inappropriate language patterns
const MODERATION_RULES = {
  // Political name-calling
  political_namecalling: {
    patterns: [
      /\blibtard(s)?\b/gi,
      /\bmaggot(s)?\b/gi,
      /\brepubli(c)?unt(s)?\b/gi,
      /\bdemoncrat(s)?\b/gi,
      /\brepubtard(s)?\b/gi,
      /\bdemotard(s)?\b/gi,
      /\bcommie(s)?\b/gi,
      /\bnazi(s)?\b/gi,
      /\bfascist(s)?\b/gi,
      /\blibturd(s)?\b/gi,
    ],
    severity: 'moderate' as const,
    message: 'Political name-calling detected',
  },
  
  // Profanity and vulgar language
  profanity: {
    patterns: [
      /\bb[i!1]tch(es)?\b/gi,
      /\bf[u\*]ck(er|ing|ed)?\b/gi,
      /\bf\*ck(er|ing|ed)?\b/gi,
      /\bass\s*hole(s)?\b/gi,
      /\ba\*\*hole(s)?\b/gi,
      /\bs\.?o\.?b\.?\b/gi,
      /\bson\s+of\s+a\s+b[i!1]tch\b/gi,
      /\bbull\s*sh[i!1]t\b/gi,
      /\bdam[nm]\s*(it|you)\b/gi,
      /\bgodd[a@]m[nm]\b/gi,
      /\bsh[i!1]t(ty|head)?\b/gi,
      /\bc[u\*]nt(s)?\b/gi,
      /\bd[i!1]ck(head|s)?\b/gi,
      /\bpuss(y|ies)\b/gi,
      /\bbast[a@]rd(s)?\b/gi,
    ],
    severity: 'moderate' as const,
    message: 'Inappropriate language detected',
  },
  
  // Disrespectful terms
  disrespect: {
    patterns: [
      /\bidiot(s|ic)?\b/gi,
      /\bmoron(ic|s)?\b/gi,
      /\bstupid(ity)?\b/gi,
      /\bdumb\s*(ass|f[u\*]ck)?\b/gi,
      /\bloser(s)?\b/gi,
      /\bscum(bag)?(s)?\b/gi,
      /\btrash(y)?\b/gi,
      /\bpathetic\b/gi,
      /\bworthless\b/gi,
      /\big?norant\b/gi,
      /\bretard(ed|s)?\b/gi,
    ],
    severity: 'minor' as const,
    message: 'Disrespectful language detected',
  },
  
  // Threats and harassment
  threats: {
    patterns: [
      /\b(i('ll|ll| will)|we('ll|ll| will))\s+(kill|hurt|harm|destroy|end)\s+(you|them|him|her)\b/gi,
      /\byou\s+(should|deserve\s+to|need\s+to)\s+die\b/gi,
      /\bkys\b/gi, // "kill yourself"
      /\bkill\s+yourself\b/gi,
      /\bgo\s+die\b/gi,
    ],
    severity: 'severe' as const,
    message: 'Threatening language detected',
  },
}

/**
 * Check content for inappropriate language and behavior
 */
export function moderateContent(content: string): ModerationResult {
  const flaggedWords: string[] = []
  let violationType: string | undefined
  let severity: 'minor' | 'moderate' | 'severe' = 'minor'
  let message: string | undefined

  // Check each rule category
  for (const [ruleType, rule] of Object.entries(MODERATION_RULES)) {
    for (const pattern of rule.patterns) {
      const matches = content.match(pattern)
      if (matches) {
        matches.forEach(match => {
          if (!flaggedWords.includes(match.toLowerCase())) {
            flaggedWords.push(match.toLowerCase())
          }
        })
        
        // Use the most severe violation found
        if (!violationType || getSeverityLevel(rule.severity) > getSeverityLevel(severity)) {
          violationType = ruleType
          severity = rule.severity
          message = rule.message
        }
      }
    }
  }

  return {
    isViolation: flaggedWords.length > 0,
    violationType,
    severity,
    flaggedWords,
    message,
  }
}

function getSeverityLevel(severity: 'minor' | 'moderate' | 'severe'): number {
  const levels = { minor: 1, moderate: 2, severe: 3 }
  return levels[severity] || 0
}

/**
 * Determine what action to take based on user's violation count
 */
export function determineEnforcementAction(violationCount: number): {
  action: 'warning' | '14_days' | '28_days' | 'permanent'
  message: string
} {
  if (violationCount === 0) {
    return {
      action: 'warning',
      message: 'This is your first violation. You have received a written warning. Please review our community standards.',
    }
  } else if (violationCount === 1) {
    return {
      action: '14_days',
      message: 'This is your second violation. Your account has been suspended for 14 days.',
    }
  } else if (violationCount === 2) {
    return {
      action: '28_days',
      message: 'This is your third violation. Your account has been suspended for 28 days.',
    }
  } else {
    return {
      action: 'permanent',
      message: 'You have violated our community standards for the fourth time. Your account has been permanently banned.',
    }
  }
}

/**
 * Calculate suspension end date based on suspension type
 */
export function calculateSuspensionEndDate(suspensionType: string): Date | null {
  const now = new Date()
  
  switch (suspensionType) {
    case '14_days':
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)
    case '28_days':
      return new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000)
    case 'permanent':
      return null // Permanent ban has no end date
    default:
      return null
  }
}

/**
 * Format flagged words for display (censoring while keeping recognizable)
 */
export function formatFlaggedWords(words: string[]): string {
  return words
    .map(word => {
      if (word.length <= 3) return '***'
      return word.charAt(0) + '*'.repeat(word.length - 2) + word.charAt(word.length - 1)
    })
    .join(', ')
}
