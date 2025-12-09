// Mock Data - Hardcoded for demo purposes
// This will be replaced with database queries later

export interface Member {
  id: string
  name: string
  email: string
  phone?: string
  city?: string
  interests: string[]
  status: 'active' | 'inactive' | 'invited'
  joinedDate: string
  invitationCode?: string
  profilePhoto?: string
  tier?: 'Standard' | 'Premium' | 'Platinum' | 'VIP' | 'Founding'
}

export interface Interest {
  id: string
  name: string
  icon?: string
  enabled: boolean
}

export interface Event {
  id: string
  title: string
  date: string
  time: string
  location: string
  maxCapacity?: number
  price?: number
  description: string
  image?: string
  targetInterests: string[]
  targetCities: string[]
  rsvps: {
    yes: string[]
    no: string[]
    maybe: string[]
  }
  waitlist?: string[]
  attendance?: {
    attended: string[]
    noShow: string[]
  }
}

export interface InvitationCode {
  id: string
  code: string
  status: 'unused' | 'used'
  assignedMemberId?: string
  assignedMemberName?: string
  createdAt: string
  usedAt?: string
  expiresAt?: string
}

// Mock Data - Members with linked invitation codes
export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John D.',
    email: 'john@example.com',
    city: 'New York',
    interests: ['Fine Dining', 'Wine Tasting'],
    status: 'active',
    joinedDate: '2025-01-15',
    invitationCode: 'CLUB-4G8Z1',
    profilePhoto: 'https://i.pravatar.cc/150?img=12'
  },
  {
    id: '2',
    name: 'Maria S.',
    email: 'maria@example.com',
    city: 'London',
    interests: ['Fine Dining', 'Art & Culture'],
    status: 'active',
    joinedDate: '2025-01-20',
    invitationCode: 'CLUB-7H2K9',
    profilePhoto: 'https://i.pravatar.cc/150?img=47'
  },
  {
    id: '3',
    name: 'Marid S.',
    email: 'marid@example.com',
    city: 'London',
    interests: ['Art & Culture', 'Live Music'],
    status: 'active',
    joinedDate: '2025-02-01',
    invitationCode: 'CLUB-9M3P2',
    profilePhoto: 'https://i.pravatar.cc/150?img=33'
  },
  {
    id: '4',
    name: 'David C.',
    email: 'david@example.com',
    city: 'Dubai',
    interests: ['Live Music', 'Craft Cocktails'],
    status: 'active',
    joinedDate: '2025-02-10',
    invitationCode: 'CLUB-5N4Q8',
    profilePhoto: 'https://i.pravatar.cc/150?img=13'
  },
  {
    id: '5',
    name: 'Serish K.',
    email: 'serish@example.com',
    city: 'Dubai',
    interests: ['Craft Cocktails', 'Whisky / Spirits'],
    status: 'active',
    joinedDate: '2025-02-15',
    invitationCode: 'CLUB-8R2T6',
    profilePhoto: 'https://i.pravatar.cc/150?img=51'
  },
  {
    id: '6',
    name: 'Sarah K.',
    email: 'sarah@example.com',
    city: 'Monaco',
    interests: ['Craft Cocktails', 'Luxury Travel'],
    status: 'invited',
    joinedDate: '2025-02-20',
    invitationCode: 'CLUB-3V7W1',
    profilePhoto: 'https://i.pravatar.cc/150?img=45'
  },
  {
    id: '7',
    name: 'Robert M.',
    email: 'robert@example.com',
    city: 'Paris',
    interests: ['Wine Tasting', 'Cigar Tasting'],
    status: 'active',
    joinedDate: '2025-01-25',
    invitationCode: 'CLUB-6X9Y4',
    profilePhoto: 'https://i.pravatar.cc/150?img=68'
  },
  {
    id: '8',
    name: 'Emma W.',
    email: 'emma@example.com',
    city: 'New York',
    interests: ['Fine Dining', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-02-05',
    invitationCode: 'CLUB-2Z5A7',
    profilePhoto: 'https://i.pravatar.cc/150?img=32'
  },
  {
    id: '9',
    name: 'James L.',
    email: 'james@example.com',
    city: 'Tokyo',
    interests: ['Whisky / Spirits', 'Cigar Tasting'],
    status: 'active',
    joinedDate: '2025-02-12',
    invitationCode: 'CLUB-1B3C9',
    profilePhoto: 'https://i.pravatar.cc/150?img=15'
  },
  {
    id: '10',
    name: 'Sophie B.',
    email: 'sophie@example.com',
    city: 'London',
    interests: ['Art & Culture', 'Wine Tasting'],
    status: 'active',
    joinedDate: '2025-02-18',
    invitationCode: 'CLUB-4D6E2',
    profilePhoto: 'https://i.pravatar.cc/150?img=20'
  }
]

export const mockInterests: Interest[] = [
  { id: '1', name: 'Wine Tasting', enabled: true },
  { id: '2', name: 'Fine Dining', enabled: true },
  { id: '3', name: 'Cigar Tasting', enabled: true },
  { id: '4', name: 'Whisky / Spirits', enabled: true },
  { id: '5', name: 'Live Music', enabled: true },
  { id: '6', name: 'Art & Culture', enabled: true },
  { id: '7', name: 'Craft Cocktails', enabled: true },
  { id: '8', name: 'Luxury Travel', enabled: true }
]

export const mockInvitationCodes: InvitationCode[] = [
  {
    id: '1',
    code: 'CLUB-4G8Z1',
    status: 'used',
    assignedMemberId: '1',
    assignedMemberName: 'John D.',
    createdAt: '2024-01-10',
    usedAt: '2024-01-15'
  },
  {
    id: '2',
    code: 'CLUB-7H2K9',
    status: 'used',
    assignedMemberId: '2',
    assignedMemberName: 'Maria S.',
    createdAt: '2024-01-12',
    usedAt: '2024-01-20'
  },
  {
    id: '3',
    code: 'CLUB-9M3P2',
    status: 'used',
    assignedMemberId: '3',
    assignedMemberName: 'Marid S.',
    createdAt: '2024-01-25',
    usedAt: '2024-02-01'
  },
  {
    id: '4',
    code: 'CLUB-5N4Q8',
    status: 'used',
    assignedMemberId: '4',
    assignedMemberName: 'David C.',
    createdAt: '2024-02-05',
    usedAt: '2024-02-10'
  },
  {
    id: '5',
    code: 'CLUB-8R2T6',
    status: 'used',
    assignedMemberId: '5',
    assignedMemberName: 'Serish K.',
    createdAt: '2024-02-10',
    usedAt: '2024-02-15'
  },
  {
    id: '6',
    code: 'CLUB-3V7W1',
    status: 'used',
    assignedMemberId: '6',
    assignedMemberName: 'Sarah K.',
    createdAt: '2024-02-15',
    usedAt: '2024-02-20'
  },
  {
    id: '7',
    code: 'CLUB-6X9Y4',
    status: 'used',
    assignedMemberId: '7',
    assignedMemberName: 'Robert M.',
    createdAt: '2024-01-20',
    usedAt: '2024-01-25'
  },
  {
    id: '8',
    code: 'CLUB-2Z5A7',
    status: 'used',
    assignedMemberId: '8',
    assignedMemberName: 'Emma W.',
    createdAt: '2024-01-30',
    usedAt: '2024-02-05'
  },
  {
    id: '9',
    code: 'CLUB-1B3C9',
    status: 'used',
    assignedMemberId: '9',
    assignedMemberName: 'James L.',
    createdAt: '2024-02-08',
    usedAt: '2024-02-12'
  },
  {
    id: '10',
    code: 'CLUB-4D6E2',
    status: 'used',
    assignedMemberId: '10',
    assignedMemberName: 'Sophie B.',
    createdAt: '2024-02-13',
    usedAt: '2024-02-18'
  },
  {
    id: '11',
    code: 'VIP-938JD',
    status: 'unused',
    createdAt: '2024-02-20'
  },
  {
    id: '12',
    code: 'CLUB-7F8G3',
    status: 'unused',
    createdAt: '2024-02-20'
  },
  {
    id: '13',
    code: 'CLUB-9H1J5',
    status: 'unused',
    createdAt: '2024-02-20'
  }
]

// Events with realistic RSVPs using actual member IDs
// Note: Events dated before today are considered "past events" for attendance calculation
export const mockEvents: Event[] = [
  {
    id: '1',
    title: 'Exclusive Wine Tasting Evening',
    date: '2025-01-15',
    time: '7:00 PM',
    location: 'The Grand Cellar, New York',
    maxCapacity: 30,
    price: 150,
    description: 'Join us for an exclusive evening of premium wine tasting featuring rare vintages from renowned vineyards. Expert sommelier will guide you through a curated selection of fine wines paired with artisanal cheeses.',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&h=600&fit=crop',
    targetInterests: ['Wine Tasting', 'Fine Dining'],
    targetCities: ['New York', 'London'],
    rsvps: {
      yes: ['1', '7', '8', '10', '2', '3', '4', '5'], // John D., Robert M., Emma W., Sophie B., Maria S., Marid S., David C., Serish K. (Wine Tasting/Fine Dining)
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '2',
    title: 'Cigar & Whisky Night',
    date: '2025-01-22',
    time: '8:00 PM',
    location: 'The Gentleman\'s Lounge, London',
    maxCapacity: 25,
    price: 200,
    description: 'An intimate evening dedicated to premium cigars and rare whiskies. Experience the finest selection of aged spirits and hand-rolled cigars in an exclusive private setting.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop',
    targetInterests: ['Cigar Tasting', 'Whisky / Spirits'],
    targetCities: ['London', 'Dubai'],
    rsvps: {
      yes: ['7', '9', '1', '5', '4', '8'], // Robert M., James L., John D., Serish K., David C., Emma W. (Cigar/Whisky interests)
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '3',
    title: 'Jazz & Craft Cocktails',
    date: '2025-02-05',
    time: '9:00 PM',
    location: 'The Velvet Room, Monaco',
    maxCapacity: 40,
    price: 120,
    description: 'An elegant evening of live jazz performances accompanied by expertly crafted cocktails. Enjoy the smooth sounds of a live jazz quartet while our master mixologists create bespoke cocktails.',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    targetInterests: ['Live Music', 'Craft Cocktails'],
    targetCities: ['Monaco', 'Paris'],
    rsvps: {
      yes: ['3', '4', '5', '6', '2', '8', '10', '1', '7'], // Marid S., David C., Serish K., Sarah K., Maria S., Emma W., Sophie B., John D., Robert M. (Live Music/Craft Cocktails)
      no: [],
      maybe: []
    },
    waitlist: ['9', '10'] // James L., Sophie B. (event is full)
  },
  {
    id: '4',
    title: 'Art Gallery Opening & Fine Dining',
    date: '2025-02-12',
    time: '6:30 PM',
    location: 'Modern Art Gallery, Paris',
    maxCapacity: 35,
    price: 180,
    description: 'Exclusive private viewing of contemporary art followed by a gourmet dinner. Experience world-class art and cuisine in an intimate gallery setting.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    targetInterests: ['Art & Culture', 'Fine Dining'],
    targetCities: ['Paris', 'London'],
    rsvps: {
      yes: ['2', '3', '10', '7', '8', '1', '4', '5'], // Maria S., Marid S., Sophie B., Robert M., Emma W., John D., David C., Serish K. (Art & Culture)
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '5',
    title: 'Luxury Yacht Experience',
    date: '2025-02-20',
    time: '2:00 PM',
    location: 'Monaco Harbor',
    maxCapacity: 20,
    price: 500,
    description: 'An exclusive day on a private luxury yacht. Enjoy premium service, fine dining, and breathtaking views of the Mediterranean. Includes champagne service and gourmet lunch.',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&h=600&fit=crop',
    targetInterests: ['Luxury Travel', 'Fine Dining'],
    targetCities: ['Monaco', 'Dubai'],
    rsvps: {
      yes: ['6', '8', '2', '10', '7', '1', '3'], // Sarah K., Emma W., Maria S., Sophie B., Robert M., John D., Marid S. (Luxury Travel)
      no: [],
      maybe: []
    },
    waitlist: ['3', '4', '5', '7', '9', '10'] // Others on waitlist (event is full)
  },
  {
    id: '6',
    title: 'Whisky Masterclass',
    date: '2025-03-10',
    time: '7:30 PM',
    location: 'The Distillery Club, Dubai',
    maxCapacity: 28,
    price: 250,
    description: 'An educational and tasting experience with rare and aged whiskies. Learn from master distillers about the art of whisky making and sample exclusive bottles from private collections.',
    image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=600&fit=crop',
    targetInterests: ['Whisky / Spirits'],
    targetCities: ['Dubai', 'London'],
    rsvps: {
      yes: ['5', '9', '7', '1', '4', '8', '10', '3'], // Serish K., James L., Robert M., John D., David C., Emma W., Sophie B., Marid S. (Whisky / Spirits)
      no: ['2'], // Maria S.
      maybe: []
    },
    waitlist: []
  },
  {
    id: '7',
    title: 'Private Chef Dinner Experience',
    date: '2025-01-08',
    time: '7:00 PM',
    location: 'Private Residence, London',
    maxCapacity: 15,
    price: 300,
    description: 'An exclusive private dining experience with a Michelin-starred chef. Intimate setting with personalized menu and wine pairings.',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&h=600&fit=crop',
    targetInterests: ['Fine Dining', 'Wine Tasting'],
    targetCities: ['London', 'Paris'],
    rsvps: {
      yes: ['1', '7', '2', '8', '10', '3', '4'], // John D., Robert M., Maria S., Emma W., Sophie B., Marid S., David C.
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '8',
    title: 'Exclusive Art Collection Viewing',
    date: '2025-01-25',
    time: '6:00 PM',
    location: 'Private Gallery, Paris',
    maxCapacity: 20,
    price: 180,
    description: 'Private viewing of a rare art collection followed by champagne reception. Exclusive access to works not available to the public.',
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=800&h=600&fit=crop',
    targetInterests: ['Art & Culture'],
    targetCities: ['Paris', 'London'],
    rsvps: {
      yes: ['2', '3', '10', '7', '1', '8'], // Maria S., Marid S., Sophie B., Robert M., John D., Emma W.
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '9',
    title: 'Premium Cigar Lounge Evening',
    date: '2025-02-28',
    time: '8:00 PM',
    location: 'The Cigar Club, Dubai',
    maxCapacity: 18,
    price: 220,
    description: 'An evening in an exclusive cigar lounge featuring rare cigars and premium spirits. Expert guidance on cigar selection and pairing.',
    image: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&h=600&fit=crop',
    targetInterests: ['Cigar Tasting', 'Whisky / Spirits'],
    targetCities: ['Dubai', 'Monaco'],
    rsvps: {
      yes: ['7', '9', '1', '5', '4'], // Robert M., James L., John D., Serish K., David C.
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '10',
    title: 'Luxury Spa & Wellness Retreat',
    date: '2025-03-05',
    time: '10:00 AM',
    location: 'Elite Spa Resort, Monaco',
    maxCapacity: 12,
    price: 400,
    description: 'A full-day luxury wellness experience including spa treatments, gourmet healthy cuisine, and relaxation in exclusive facilities.',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&h=600&fit=crop',
    targetInterests: ['Luxury Travel'],
    targetCities: ['Monaco', 'Dubai'],
    rsvps: {
      yes: ['6', '8', '10', '2', '7'], // Sarah K., Emma W., Sophie B., Maria S., Robert M.
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '11',
    title: 'Jazz & Fine Wine Night',
    date: '2025-03-15',
    time: '8:00 PM',
    location: 'The Jazz Cellar, New York',
    maxCapacity: 25,
    price: 160,
    description: 'An elegant evening combining live jazz performances with curated wine tastings. Intimate setting with world-class musicians.',
    image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&h=600&fit=crop',
    targetInterests: ['Live Music', 'Wine Tasting'],
    targetCities: ['New York', 'London'],
    rsvps: {
      yes: ['1', '7', '8', '10', '2', '3', '4'], // John D., Robert M., Emma W., Sophie B., Maria S., Marid S., David C.
      no: [],
      maybe: []
    },
    waitlist: []
  },
  {
    id: '12',
    title: 'Exclusive Whisky Tasting Masterclass',
    date: '2025-03-22',
    time: '7:00 PM',
    location: 'The Whisky Library, London',
    maxCapacity: 20,
    price: 280,
    description: 'An educational masterclass featuring rare and aged whiskies from private collections. Learn from master distillers and connoisseurs.',
    image: 'https://images.unsplash.com/photo-1597432846200-a5921441427d?w=800&h=600&fit=crop',
    targetInterests: ['Whisky / Spirits'],
    targetCities: ['London', 'Dubai'],
    rsvps: {
      yes: ['5', '9', '7', '1', '4', '8'], // Serish K., James L., Robert M., John D., David C., Emma W.
      no: [],
      maybe: []
    },
    waitlist: []
  }
]

