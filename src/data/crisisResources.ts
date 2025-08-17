/**
 * Crisis Resources Database
 * 
 * Comprehensive database of crisis helplines, emergency contacts,
 * and mental health resources organized by region and type
 */

export interface CrisisResource {
  id: string;
  name: string;
  type: 'hotline' | 'text' | 'chat' | 'emergency' | 'local' | 'specialized';
  region: 'global' | 'us' | 'uk' | 'canada' | 'australia' | 'india' | 'eu' | string;
  phone?: string;
  textNumber?: string;
  website?: string;
  chatUrl?: string;
  description: string;
  availability: '24/7' | 'business-hours' | 'limited' | string;
  languages: string[];
  specializations?: string[];
  isEmergency: boolean;
  isFree: boolean;
  lastVerified: string; // ISO date
}

export const crisisResources: CrisisResource[] = [
  // GLOBAL EMERGENCY
  {
    id: 'global-emergency',
    name: 'Local Emergency Services',
    type: 'emergency',
    region: 'global',
    phone: '911', // Will be localized based on region
    description: 'Immediate emergency services for life-threatening situations',
    availability: '24/7',
    languages: ['Local Language'],
    isEmergency: true,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // UNITED STATES
  {
    id: 'us-988',
    name: '988 Suicide & Crisis Lifeline',
    type: 'hotline',
    region: 'us',
    phone: '988',
    website: 'https://988lifeline.org',
    chatUrl: 'https://988lifeline.org/chat',
    description: 'Free and confidential emotional support for people in suicidal crisis or emotional distress',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'us-crisis-text',
    name: 'Crisis Text Line',
    type: 'text',
    region: 'us',
    textNumber: '741741',
    website: 'https://www.crisistextline.org',
    description: 'Free, 24/7 support for those in crisis. Text HOME to 741741',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'us-samhsa',
    name: 'SAMHSA National Helpline',
    type: 'hotline',
    region: 'us',
    phone: '1-800-662-4357',
    website: 'https://www.samhsa.gov/find-help/national-helpline',
    description: 'Treatment referral and information service for mental health and substance use disorders',
    availability: '24/7',
    languages: ['English', 'Spanish'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'us-trevor',
    name: 'The Trevor Project',
    type: 'hotline',
    region: 'us',
    phone: '1-866-488-7386',
    textNumber: '678678',
    website: 'https://www.thetrevorproject.org',
    chatUrl: 'https://www.thetrevorproject.org/get-help/',
    description: 'Crisis intervention and suicide prevention for LGBTQ+ youth',
    availability: '24/7',
    languages: ['English'],
    specializations: ['LGBTQ+', 'Youth'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // UNITED KINGDOM
  {
    id: 'uk-samaritans',
    name: 'Samaritans',
    type: 'hotline',
    region: 'uk',
    phone: '116 123',
    website: 'https://www.samaritans.org',
    description: 'Free support for anyone in emotional distress, struggling to cope, or at risk of suicide',
    availability: '24/7',
    languages: ['English'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'uk-shout',
    name: 'Shout Crisis Text Line',
    type: 'text',
    region: 'uk',
    textNumber: '85258',
    website: 'https://giveusashout.org',
    description: 'Free, confidential, 24/7 text support service. Text SHOUT to 85258',
    availability: '24/7',
    languages: ['English'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'uk-mind',
    name: 'Mind Infoline',
    type: 'hotline',
    region: 'uk',
    phone: '0300 123 3393',
    website: 'https://www.mind.org.uk',
    description: 'Information and support for mental health problems',
    availability: '9am-6pm, Monday to Friday',
    languages: ['English'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // CANADA
  {
    id: 'canada-talk-suicide',
    name: 'Talk Suicide Canada',
    type: 'hotline',
    region: 'canada',
    phone: '1-833-456-4566',
    website: 'https://talksuicide.ca',
    description: 'National suicide prevention service providing support in English and French',
    availability: '24/7',
    languages: ['English', 'French'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'canada-kids-help',
    name: 'Kids Help Phone',
    type: 'hotline',
    region: 'canada',
    phone: '1-800-668-6868',
    textNumber: '686868',
    website: 'https://kidshelpphone.ca',
    description: 'Professional counselling and information for young people',
    availability: '24/7',
    languages: ['English', 'French'],
    specializations: ['Youth', 'Children'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // AUSTRALIA
  {
    id: 'au-lifeline',
    name: 'Lifeline Australia',
    type: 'hotline',
    region: 'australia',
    phone: '13 11 14',
    website: 'https://www.lifeline.org.au',
    chatUrl: 'https://www.lifeline.org.au/crisis-chat/',
    description: 'Crisis support and suicide prevention services',
    availability: '24/7',
    languages: ['English'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'au-beyond-blue',
    name: 'Beyond Blue',
    type: 'hotline',
    region: 'australia',
    phone: '1300 22 4636',
    website: 'https://www.beyondblue.org.au',
    chatUrl: 'https://www.beyondblue.org.au/get-support/get-immediate-support',
    description: 'Support for anxiety, depression and suicide prevention',
    availability: '24/7',
    languages: ['English'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // INDIA
  {
    id: 'india-aasra',
    name: 'AASRA',
    type: 'hotline',
    region: 'india',
    phone: '91-9820466726',
    website: 'http://www.aasra.info',
    description: 'Suicide prevention helpline providing emotional support',
    availability: '24/7',
    languages: ['English', 'Hindi'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'india-sneha',
    name: 'SNEHA',
    type: 'hotline',
    region: 'india',
    phone: '044-24640050',
    website: 'http://www.snehaindia.org',
    description: 'Suicide prevention center providing emotional support',
    availability: '24/7',
    languages: ['English', 'Tamil', 'Hindi'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'india-vandrevala',
    name: 'Vandrevala Foundation',
    type: 'hotline',
    region: 'india',
    phone: '1860-2662-345',
    website: 'https://www.vandrevalafoundation.com',
    description: 'Mental health support and crisis intervention',
    availability: '24/7',
    languages: ['English', 'Hindi', 'Marathi', 'Gujarati'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // EUROPEAN UNION
  {
    id: 'eu-116-123',
    name: 'European Helpline Network',
    type: 'hotline',
    region: 'eu',
    phone: '116 123',
    website: 'https://www.befrienders.org',
    description: 'Emotional support helpline available in many EU countries',
    availability: 'Varies by country',
    languages: ['Multiple European languages'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },

  // SPECIALIZED RESOURCES
  {
    id: 'global-lgbt-hotline',
    name: 'LGBT National Hotline',
    type: 'hotline',
    region: 'us',
    phone: '1-888-843-4564',
    website: 'https://www.lgbthotline.org',
    description: 'Peer-support telephone and online chat hotline for LGBTQ+ community',
    availability: '4pm-12am ET, Monday-Friday; 12pm-5pm ET, Saturday',
    languages: ['English'],
    specializations: ['LGBTQ+'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'global-veterans-crisis',
    name: 'Veterans Crisis Line',
    type: 'hotline',
    region: 'us',
    phone: '1-800-273-8255',
    textNumber: '838255',
    website: 'https://www.veteranscrisisline.net',
    chatUrl: 'https://www.veteranscrisisline.net/get-help/chat',
    description: 'Crisis support specifically for veterans and their families',
    availability: '24/7',
    languages: ['English'],
    specializations: ['Veterans', 'Military'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  },
  {
    id: 'global-postpartum-support',
    name: 'Postpartum Support International',
    type: 'hotline',
    region: 'global',
    phone: '1-944-944-4773',
    website: 'https://www.postpartum.net',
    description: 'Support for perinatal mental health and postpartum depression',
    availability: 'Business hours',
    languages: ['English', 'Spanish'],
    specializations: ['Postpartum', 'Maternal Mental Health'],
    isEmergency: false,
    isFree: true,
    lastVerified: '2024-01-01'
  }
];

// Helper functions for filtering resources
export const getResourcesByRegion = (region: string) =>
  crisisResources.filter(resource => 
    resource.region === region || resource.region === 'global'
  );

export const getEmergencyResources = () =>
  crisisResources.filter(resource => resource.isEmergency);

export const getResourcesByType = (type: CrisisResource['type']) =>
  crisisResources.filter(resource => resource.type === type);

export const getSpecializedResources = (specialization: string) =>
  crisisResources.filter(resource => 
    resource.specializations?.includes(specialization)
  );

export const get24HourResources = () =>
  crisisResources.filter(resource => 
    resource.availability === '24/7'
  );

// Get appropriate resources based on user location and needs
export const getRecommendedResources = (context: {
  region?: string;
  isEmergency?: boolean;
  specialization?: string;
  preferredContact?: 'phone' | 'text' | 'chat';
  language?: string;
}): CrisisResource[] => {
  let filtered = crisisResources;

  // Filter by region
  if (context.region) {
    filtered = filtered.filter(resource => 
      resource.region === context.region || resource.region === 'global'
    );
  }

  // Filter by emergency status
  if (context.isEmergency !== undefined) {
    filtered = filtered.filter(resource => 
      resource.isEmergency === context.isEmergency
    );
  }

  // Filter by specialization
  if (context.specialization) {
    filtered = filtered.filter(resource => 
      resource.specializations?.includes(context.specialization)
    );
  }

  // Filter by contact preference
  if (context.preferredContact) {
    filtered = filtered.filter(resource => {
      switch (context.preferredContact) {
        case 'phone':
          return !!resource.phone;
        case 'text':
          return !!resource.textNumber;
        case 'chat':
          return !!resource.chatUrl;
        default:
          return true;
      }
    });
  }

  // Filter by language
  if (context.language) {
    filtered = filtered.filter(resource => 
      resource.languages.includes(context.language) ||
      resource.languages.includes('English') // English as fallback
    );
  }

  // Sort by priority: emergency first, then 24/7, then free
  return filtered.sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1;
    if (!a.isEmergency && b.isEmergency) return 1;
    if (a.availability === '24/7' && b.availability !== '24/7') return -1;
    if (a.availability !== '24/7' && b.availability === '24/7') return 1;
    if (a.isFree && !b.isFree) return -1;
    if (!a.isFree && b.isFree) return 1;
    return 0;
  });
};

// Emergency numbers by region
export const emergencyNumbers: Record<string, string> = {
  'us': '911',
  'uk': '999',
  'canada': '911',
  'australia': '000',
  'india': '112',
  'eu': '112',
  'global': '911' // Default fallback
};

export const getEmergencyNumber = (region: string): string => {
  return emergencyNumbers[region] || emergencyNumbers['global'];
};
