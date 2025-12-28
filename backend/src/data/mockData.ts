// Mock Data - Used ONLY for database migration script (migrate-demo-data.ts)
// This file is kept for one-time migration purposes only
// All application code now uses MongoDB database
// DO NOT import this file in production code - use database models instead

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
  clubId: number
}

export interface Interest {
  id: string
  name: string
  icon?: string
  enabled: boolean
  clubId?: number
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
  invitedMembersIds?: number[] // IDs of members who were actually invited to this event
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
  clubId: number
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
  clubId: number
}

export interface Club {
  id: number
  name: string
  slug: string
  theme: {
    primary: string
    accent: string
    logo?: string
  }
  locale: string
  currency: string
}

export const mockClubs: Club[] = [
  {
    id: 1,
    name: 'La Maison Privée',
    slug: 'lmp',
    theme: {
      primary: '#d4af37',
      accent: '#8b2635',
      logo: 'https://dummyimage.com/160x40/d4af37/050505&text=LMP'
    },
    locale: 'en-IL',
    currency: 'ILS'
  },
  {
    id: 2,
    name: 'Gulf Privée',
    slug: 'dxb',
    theme: {
      primary: '#c08b5c',
      accent: '#0c4a6e',
      logo: 'https://dummyimage.com/160x40/c08b5c/050505&text=DXB'
    },
    locale: 'en-IL',
    currency: 'ILS'
  },
  {
    id: 3,
    name: 'Riyadh Privée',
    slug: 'ruh',
    theme: {
      primary: '#c08b5c',
      accent: '#1f2937',
      logo: 'https://dummyimage.com/160x40/c08b5c/050505&text=RUH'
    },
    locale: 'en-IL',
    currency: 'ILS'
  }
]

// Mock Data - Members with linked invitation codes
export const mockMembers: Member[] = [
  {
    id: '1',
    name: 'John D.',
    email: 'john@example.com',
    phone: '+972-52-123-4567',
    city: 'New York',
    interests: ['Fine Dining', 'Wine Tasting'],
    status: 'active',
    joinedDate: '2025-01-15',
    invitationCode: 'CLUB-4G8Z1',
    profilePhoto: 'https://i.pravatar.cc/150?img=12',
    clubId: 1
  },
  {
    id: '2',
    name: 'Maria S.',
    email: 'maria@example.com',
    phone: '+972-54-234-5678',
    city: 'London',
    interests: ['Fine Dining', 'Art & Culture'],
    status: 'active',
    joinedDate: '2025-01-20',
    invitationCode: 'CLUB-7H2K9',
    profilePhoto: 'https://i.pravatar.cc/150?img=47',
    clubId: 1
  },
  {
    id: '3',
    name: 'Marid S.',
    email: 'marid@example.com',
    phone: '+972-50-345-6789',
    city: 'London',
    interests: ['Art & Culture', 'Live Music'],
    status: 'active',
    joinedDate: '2025-02-01',
    invitationCode: 'CLUB-9M3P2',
    profilePhoto: 'https://i.pravatar.cc/150?img=33',
    clubId: 1
  },
  {
    id: '4',
    name: 'David C.',
    email: 'david@example.com',
    phone: '+971-50-456-7890',
    city: 'Dubai',
    interests: ['Live Music', 'Craft Cocktails'],
    status: 'active',
    joinedDate: '2025-02-10',
    invitationCode: 'CLUB-5N4Q8',
    profilePhoto: 'https://i.pravatar.cc/150?img=13',
    clubId: 2
  },
  {
    id: '5',
    name: 'Serish K.',
    email: 'serish@example.com',
    phone: '+971-52-567-8901',
    city: 'Dubai',
    interests: ['Craft Cocktails', 'Whisky / Spirits'],
    status: 'active',
    joinedDate: '2025-02-15',
    invitationCode: 'CLUB-8R2T6',
    profilePhoto: 'https://i.pravatar.cc/150?img=51',
    clubId: 2
  },
  {
    id: '6',
    name: 'Sarah K.',
    email: 'sarah@example.com',
    phone: '+33-6-12-34-56-78',
    city: 'Monaco',
    interests: ['Craft Cocktails', 'Luxury Travel'],
    status: 'invited',
    joinedDate: '2025-02-20',
    invitationCode: 'CLUB-3V7W1',
    profilePhoto: 'https://i.pravatar.cc/150?img=45',
    clubId: 2
  },
  {
    id: '7',
    name: 'Robert M.',
    email: 'robert@example.com',
    phone: '+33-6-23-45-67-89',
    city: 'Paris',
    interests: ['Wine Tasting', 'Cigar Tasting'],
    status: 'active',
    joinedDate: '2025-01-25',
    invitationCode: 'CLUB-6X9Y4',
    profilePhoto: 'https://i.pravatar.cc/150?img=68',
    clubId: 1
  },
  {
    id: '8',
    name: 'Emma W.',
    email: 'emma@example.com',
    phone: '+1-212-555-0123',
    city: 'New York',
    interests: ['Fine Dining', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-02-05',
    invitationCode: 'CLUB-2Z5A7',
    profilePhoto: 'https://i.pravatar.cc/150?img=32',
    clubId: 1
  },
  {
    id: '9',
    name: 'James L.',
    email: 'james@example.com',
    phone: '+81-90-1234-5678',
    city: 'Tokyo',
    interests: ['Whisky / Spirits', 'Cigar Tasting'],
    status: 'active',
    joinedDate: '2025-02-12',
    invitationCode: 'CLUB-1B3C9',
    profilePhoto: 'https://i.pravatar.cc/150?img=15',
    clubId: 2
  },
  {
    id: '10',
    name: 'Sophie B.',
    email: 'sophie@example.com',
    phone: '+44-20-7123-4567',
    city: 'London',
    interests: ['Art & Culture', 'Wine Tasting'],
    status: 'active',
    joinedDate: '2025-02-18',
    invitationCode: 'CLUB-4D6E2',
    profilePhoto: 'https://i.pravatar.cc/150?img=20',
    clubId: 1
  },
  // New La Maison Privée members
  {
    id: '11',
    name: 'Alexandre P.',
    email: 'alexandre.paris@example.com',
    phone: '+33-6-34-56-78-90',
    city: 'Paris',
    interests: ['Fine Dining', 'Art & Culture'],
    status: 'active',
    joinedDate: '2025-02-22',
    invitationCode: 'LMP-1A2B3',
    profilePhoto: 'https://i.pravatar.cc/150?img=34',
    clubId: 1
  },
  {
    id: '12',
    name: 'Camille R.',
    email: 'camille.r@example.com',
    phone: '+1-646-555-0234',
    city: 'New York',
    interests: ['Wine Tasting', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-02-24',
    invitationCode: 'LMP-4C5D6',
    profilePhoto: 'https://i.pravatar.cc/150?img=44',
    clubId: 1
  },
  {
    id: '13',
    name: 'Etienne L.',
    email: 'etienne.l@example.com',
    phone: '+44-20-7234-5678',
    city: 'London',
    interests: ['Live Music', 'Craft Cocktails'],
    status: 'invited',
    joinedDate: '2025-03-01',
    invitationCode: 'LMP-7E8F9',
    profilePhoto: 'https://i.pravatar.cc/150?img=59',
    clubId: 1
  },
  {
    id: '21',
    name: 'Basel Boulos',
    email: 'baselboulos@gmail.com',
    phone: '+1-555-0101',
    city: 'Tel Aviv',
    interests: ['Fine Dining', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-03-05',
    invitationCode: 'LMP-NEW21',
    profilePhoto: 'https://i.pravatar.cc/150?img=21',
    clubId: 1
  },
  {
    id: '22',
    name: 'Basel Boulos',
    email: 'baselboulos@gmail.com',
    phone: '+966-55-123-0001',
    city: 'Riyadh',
    interests: ['Fine Dining', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-03-06',
    invitationCode: 'RUH-NEW22',
    profilePhoto: 'https://i.pravatar.cc/150?img=22',
    clubId: 3
  },
  {
    id: '23',
    name: 'Basel Agency',
    email: 'baselwebagency@gmail.com',
    phone: '+1-555-0202',
    city: 'Riyadh',
    interests: ['Art & Culture', 'Live Music'],
    status: 'active',
    joinedDate: '2025-03-06',
    invitationCode: 'RUH-NEW23',
    profilePhoto: 'https://i.pravatar.cc/150?img=23',
    clubId: 3
  },
  // New Gulf Privée members
  {
    id: '14',
    name: 'Maha A.',
    email: 'maha.a@example.com',
    phone: '+971-54-678-9012',
    city: 'Dubai',
    interests: ['Luxury Travel', 'Fine Dining'],
    status: 'active',
    joinedDate: '2025-02-25',
    invitationCode: 'DXB-1K2L3',
    profilePhoto: 'https://i.pravatar.cc/150?img=61',
    clubId: 2
  },
  {
    id: '15',
    name: 'Omar H.',
    email: 'omar.h@example.com',
    phone: '+971-56-789-0123',
    city: 'Dubai',
    interests: ['Whisky / Spirits', 'Cigar Tasting'],
    status: 'active',
    joinedDate: '2025-02-27',
    invitationCode: 'DXB-4M5N6',
    profilePhoto: 'https://i.pravatar.cc/150?img=62',
    clubId: 2
  },
  {
    id: '16',
    name: 'Nour F.',
    email: 'nour.f@example.com',
    phone: '+971-58-890-1234',
    city: 'Abu Dhabi',
    interests: ['Art & Culture', 'Live Music'],
    status: 'invited',
    joinedDate: '2025-03-02',
    invitationCode: 'DXB-7P8Q9',
    profilePhoto: 'https://i.pravatar.cc/150?img=63',
    clubId: 2
  },
  // New Riyadh Privée members
  {
    id: '17',
    name: 'Faisal R.',
    email: 'faisal.r@example.com',
    phone: '+966-50-901-2345',
    city: 'Riyadh',
    interests: ['Fine Dining', 'Luxury Travel'],
    status: 'active',
    joinedDate: '2025-02-21',
    invitationCode: 'RUH-1R2S3',
    profilePhoto: 'https://i.pravatar.cc/150?img=64',
    clubId: 3
  },
  {
    id: '18',
    name: 'Laila K.',
    email: 'laila.k@example.com',
    phone: '+966-55-012-3456',
    city: 'Riyadh',
    interests: ['Art & Culture', 'Live Music'],
    status: 'active',
    joinedDate: '2025-02-26',
    invitationCode: 'RUH-4T5U6',
    profilePhoto: 'https://i.pravatar.cc/150?img=65',
    clubId: 3
  },
  {
    id: '19',
    name: 'Salem M.',
    email: 'salem.m@example.com',
    phone: '+966-59-123-4567',
    city: 'Riyadh',
    interests: ['Cigar Tasting', 'Whisky / Spirits'],
    status: 'invited',
    joinedDate: '2025-03-03',
    invitationCode: 'RUH-7V8W9',
    profilePhoto: 'https://i.pravatar.cc/150?img=66',
    clubId: 3
  }
]

export const mockInterests: Interest[] = [
  { id: '1', name: 'Wine Tasting', enabled: true, clubId: 1 },
  { id: '2', name: 'Fine Dining', enabled: true, clubId: 1 },
  { id: '3', name: 'Cigar Tasting', enabled: true, clubId: 1 },
  { id: '4', name: 'Whisky / Spirits', enabled: true, clubId: 2 },
  { id: '5', name: 'Live Music', enabled: true, clubId: 2 },
  { id: '6', name: 'Art & Culture', enabled: true, clubId: 1 },
  { id: '7', name: 'Craft Cocktails', enabled: true, clubId: 2 },
  { id: '8', name: 'Luxury Travel', enabled: true, clubId: 2 }
]

export const mockInvitationCodes: InvitationCode[] = [
  {
    id: '1',
    code: 'CLUB-4G8Z1',
    status: 'used',
    assignedMemberId: '1',
    assignedMemberName: 'John D.',
    createdAt: '2024-01-10',
    usedAt: '2024-01-15',
    clubId: 1
  },
  {
    id: '2',
    code: 'CLUB-7H2K9',
    status: 'used',
    assignedMemberId: '2',
    assignedMemberName: 'Maria S.',
    createdAt: '2024-01-12',
    usedAt: '2024-01-20',
    clubId: 1
  },
  {
    id: '3',
    code: 'CLUB-9M3P2',
    status: 'used',
    assignedMemberId: '3',
    assignedMemberName: 'Marid S.',
    createdAt: '2024-01-25',
    usedAt: '2024-02-01',
    clubId: 1
  },
  {
    id: '4',
    code: 'CLUB-5N4Q8',
    status: 'used',
    assignedMemberId: '4',
    assignedMemberName: 'David C.',
    createdAt: '2024-02-05',
    usedAt: '2024-02-10',
    clubId: 2
  },
  {
    id: '5',
    code: 'CLUB-8R2T6',
    status: 'used',
    assignedMemberId: '5',
    assignedMemberName: 'Serish K.',
    createdAt: '2024-02-10',
    usedAt: '2024-02-15',
    clubId: 2
  },
  {
    id: '6',
    code: 'CLUB-3V7W1',
    status: 'used',
    assignedMemberId: '6',
    assignedMemberName: 'Sarah K.',
    createdAt: '2024-02-15',
    usedAt: '2024-02-20',
    clubId: 2
  },
  {
    id: '7',
    code: 'CLUB-6X9Y4',
    status: 'used',
    assignedMemberId: '7',
    assignedMemberName: 'Robert M.',
    createdAt: '2024-01-20',
    usedAt: '2024-01-25',
    clubId: 1
  },
  {
    id: '8',
    code: 'CLUB-2Z5A7',
    status: 'used',
    assignedMemberId: '8',
    assignedMemberName: 'Emma W.',
    createdAt: '2024-01-30',
    usedAt: '2024-02-05',
    clubId: 1
  },
  {
    id: '9',
    code: 'CLUB-1B3C9',
    status: 'used',
    assignedMemberId: '9',
    assignedMemberName: 'James L.',
    createdAt: '2024-02-08',
    usedAt: '2024-02-12',
    clubId: 2
  },
  {
    id: '10',
    code: 'CLUB-4D6E2',
    status: 'used',
    assignedMemberId: '10',
    assignedMemberName: 'Sophie B.',
    createdAt: '2024-02-13',
    usedAt: '2024-02-18',
    clubId: 1
  },
  {
    id: '11',
    code: 'VIP-938JD',
    status: 'unused',
    createdAt: '2024-02-20',
    clubId: 1
  },
  {
    id: '33',
    code: 'LMP-DEMO1',
    status: 'unused',
    createdAt: '2025-01-01',
    clubId: 1
  },
  {
    id: '34',
    code: 'LMP-DEMO2',
    status: 'unused',
    createdAt: '2025-01-01',
    clubId: 1
  },
  {
    id: '35',
    code: 'LMP-TEST1',
    status: 'unused',
    createdAt: '2025-01-01',
    clubId: 1
  },
  {
    id: '12',
    code: 'CLUB-7F8G3',
    status: 'unused',
    createdAt: '2024-02-20',
    clubId: 2
  },
  {
    id: '13',
    code: 'CLUB-9H1J5',
    status: 'unused',
    createdAt: '2024-02-20',
    clubId: 2
  },
  // New codes for added members
  {
    id: '14',
    code: 'LMP-1A2B3',
    status: 'unused',
    assignedMemberId: '11',
    assignedMemberName: 'Alexandre P.',
    createdAt: '2025-02-20',
    clubId: 1
  },
  {
    id: '15',
    code: 'LMP-4C5D6',
    status: 'unused',
    assignedMemberId: '12',
    assignedMemberName: 'Camille R.',
    createdAt: '2025-02-21',
    clubId: 1
  },
  {
    id: '16',
    code: 'LMP-7E8F9',
    status: 'unused',
    assignedMemberId: '13',
    assignedMemberName: 'Etienne L.',
    createdAt: '2025-02-23',
    clubId: 1
  },
  {
    id: '17',
    code: 'DXB-1K2L3',
    status: 'unused',
    assignedMemberId: '14',
    assignedMemberName: 'Maha A.',
    createdAt: '2025-02-22',
    clubId: 2
  },
  {
    id: '18',
    code: 'DXB-4M5N6',
    status: 'unused',
    assignedMemberId: '15',
    assignedMemberName: 'Omar H.',
    createdAt: '2025-02-23',
    clubId: 2
  },
  {
    id: '19',
    code: 'DXB-7P8Q9',
    status: 'unused',
    assignedMemberId: '16',
    assignedMemberName: 'Nour F.',
    createdAt: '2025-02-24',
    clubId: 2
  },
  {
    id: '20',
    code: 'RUH-1R2S3',
    status: 'unused',
    assignedMemberId: '17',
    assignedMemberName: 'Faisal R.',
    createdAt: '2025-02-22',
    clubId: 3
  },
  {
    id: '21',
    code: 'RUH-4T5U6',
    status: 'unused',
    assignedMemberId: '18',
    assignedMemberName: 'Laila K.',
    createdAt: '2025-02-24',
    clubId: 3
  },
  {
    id: '22',
    code: 'RUH-7V8W9',
    status: 'unused',
    assignedMemberId: '19',
    assignedMemberName: 'Salem M.',
    createdAt: '2025-02-26',
    clubId: 3
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
    invitedMembersIds: [1, 2, 7, 8, 10, 11, 12], // John D., Maria S., Robert M., Emma W., Sophie B., Alexandre P., Camille R.
    rsvps: {
      yes: ['1', '7', '8', '10', '2', '3', '4', '5'], // John D., Robert M., Emma W., Sophie B., Maria S., Marid S., David C., Serish K. (Wine Tasting/Fine Dining)
      no: [],
      maybe: []
    },
    waitlist: [],
    attendance: {
      attended: ['1', '7', '8', '10', '2', '3'], // 6 members attended
      noShow: ['4', '5']
    },
    clubId: 1
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
    invitedMembersIds: [5, 9, 15], // Serish K., James L., Omar H.
    rsvps: {
      yes: ['7', '9', '1', '5', '4', '8'], // Robert M., James L., John D., Serish K., David C., Emma W. (Cigar/Whisky interests)
      no: [],
      maybe: []
    },
    waitlist: [],
    attendance: {
      attended: ['7', '9', '1', '5', '4'], // 5 members attended
      noShow: ['8']
    },
    clubId: 2
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
    invitedMembersIds: [4, 5, 6, 16], // David C., Serish K., Sarah K., Nour F.
    rsvps: {
      yes: ['3', '4', '5', '6', '2', '8', '10', '1', '7'], // Marid S., David C., Serish K., Sarah K., Maria S., Emma W., Sophie B., John D., Robert M. (Live Music/Craft Cocktails)
      no: [],
      maybe: []
    },
    waitlist: ['9', '10'], // James L., Sophie B. (event is full)
    attendance: {
      attended: ['3', '4', '5', '6', '2', '8', '10', '1'], // 8 members attended
      noShow: ['7']
    },
    clubId: 2
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
    invitedMembersIds: [2, 3, 10, 11], // Maria S., Marid S., Sophie B., Alexandre P.
    rsvps: {
      yes: ['2', '3', '10', '7', '8', '1', '4', '5'], // Maria S., Marid S., Sophie B., Robert M., Emma W., John D., David C., Serish K. (Art & Culture)
      no: [],
      maybe: []
    },
    waitlist: [],
    attendance: {
      attended: ['2', '3', '10', '7', '8', '1'], // 6 members attended
      noShow: ['4', '5']
    },
    clubId: 1
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
    invitedMembersIds: [6, 14], // Sarah K., Maha A.
    rsvps: {
      yes: ['6', '8', '2', '10', '7', '1', '3'], // Sarah K., Emma W., Maria S., Sophie B., Robert M., John D., Marid S. (Luxury Travel)
      no: [],
      maybe: []
    },
    waitlist: ['3', '4', '5', '7', '9', '10'], // Others on waitlist (event is full)
    clubId: 2
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
    invitedMembersIds: [5, 9, 15, 19], // Serish K., James L., Omar H., Salem M.
    rsvps: {
      yes: ['5', '9', '7', '1', '4', '8', '10', '3'], // Serish K., James L., Robert M., John D., David C., Emma W., Sophie B., Marid S. (Whisky / Spirits)
      no: ['2'], // Maria S.
      maybe: []
    },
    waitlist: [],
    clubId: 2
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
    invitedMembersIds: [1, 2, 7, 8, 10, 11, 12], // John D., Maria S., Robert M., Emma W., Sophie B., Alexandre P., Camille R.
    rsvps: {
      yes: ['1', '7', '2', '8', '10', '3', '4'], // John D., Robert M., Maria S., Emma W., Sophie B., Marid S., David C.
      no: [],
      maybe: []
    },
    waitlist: [],
    attendance: {
      attended: ['1', '7', '2', '8', '10', '3'], // 6 members attended
      noShow: ['4']
    },
    clubId: 1
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
    invitedMembersIds: [2, 3, 10, 11], // Maria S., Marid S., Sophie B., Alexandre P.
    rsvps: {
      yes: ['2', '3', '10', '7', '1', '8'], // Maria S., Marid S., Sophie B., Robert M., John D., Emma W.
      no: [],
      maybe: []
    },
    waitlist: [],
    attendance: {
      attended: ['2', '3', '10', '7', '1'], // 5 members attended
      noShow: ['8']
    },
    clubId: 1
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
    invitedMembersIds: [5, 9, 15], // Serish K., James L., Omar H.
    rsvps: {
      yes: ['7', '9', '1', '5', '4'], // Robert M., James L., John D., Serish K., David C.
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 2
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
    invitedMembersIds: [6, 14], // Sarah K., Maha A.
    rsvps: {
      yes: ['6', '8', '10', '2', '7'], // Sarah K., Emma W., Sophie B., Maria S., Robert M.
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 2
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
    invitedMembersIds: [1, 3, 10, 12, 13], // John D., Marid S., Sophie B., Camille R., Etienne L.
    rsvps: {
      yes: ['1', '7', '8', '10', '2', '3', '4'], // John D., Robert M., Emma W., Sophie B., Maria S., Marid S., David C.
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 1
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
    invitedMembersIds: [5, 9, 15], // Serish K., James L., Omar H.
    rsvps: {
      yes: ['5', '9', '7', '1', '4', '8'], // Serish K., James L., Robert M., John D., David C., Emma W.
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 2
  },
  // New La Maison Privée events
  {
    id: '13',
    title: 'Champagne & Caviar Evening',
    date: '2025-03-28',
    time: '7:30 PM',
    location: 'Private Salon, Paris',
    maxCapacity: 24,
    price: 320,
    description: 'An intimate tasting of grand cru champagnes paired with premium caviar selections.',
    image: 'https://images.unsplash.com/photo-1544145945-f90425340c7b?w=800&h=600&fit=crop',
    targetInterests: ['Fine Dining', 'Wine Tasting'],
    targetCities: ['Paris', 'London'],
    invitedMembersIds: [1, 2, 7, 10, 11, 12], // John D., Maria S., Robert M., Sophie B., Alexandre P., Camille R.
    rsvps: {
      yes: ['1', '2', '7', '10', '11', '12'],
      no: [],
      maybe: ['13']
    },
    waitlist: [],
    clubId: 1
  },
  {
    id: '14',
    title: 'Gallery Preview & Jazz',
    date: '2025-04-04',
    time: '8:00 PM',
    location: 'Left Bank Gallery, Paris',
    maxCapacity: 30,
    price: 180,
    description: 'Private preview of contemporary art followed by live jazz and champagne.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',
    targetInterests: ['Art & Culture', 'Live Music'],
    targetCities: ['Paris', 'London'],
    invitedMembersIds: [2, 3, 11, 13], // Maria S., Marid S., Alexandre P., Etienne L.
    rsvps: {
      yes: ['11', '12', '13', '2', '3', '7'],
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 1
  },
  // New Gulf Privée events
  {
    id: '15',
    title: 'Skyline Supper Club',
    date: '2025-03-30',
    time: '8:30 PM',
    location: 'Rooftop Lounge, Dubai',
    maxCapacity: 28,
    price: 350,
    description: 'Fine dining under the stars with a tasting menu inspired by Gulf flavors.',
    image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&h=600&fit=crop',
    targetInterests: ['Fine Dining', 'Luxury Travel'],
    targetCities: ['Dubai', 'Abu Dhabi'],
    invitedMembersIds: [14], // Maha A.
    rsvps: {
      yes: ['4', '5', '14', '15', '16'],
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 2
  },
  {
    id: '16',
    title: 'Desert Falconry & Sundowners',
    date: '2025-04-06',
    time: '5:00 PM',
    location: 'Private Desert Camp, Dubai',
    maxCapacity: 20,
    price: 400,
    description: 'Exclusive falconry showcase followed by sunset cocktails and mezze.',
    image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800&h=600&fit=crop',
    targetInterests: ['Luxury Travel', 'Craft Cocktails'],
    targetCities: ['Dubai', 'Abu Dhabi'],
    invitedMembersIds: [4, 5, 6], // David C., Serish K., Sarah K.
    rsvps: {
      yes: ['4', '5', '14', '15'],
      no: [],
      maybe: ['16']
    },
    waitlist: [],
    clubId: 2
  },
  // New Riyadh Privée events
  {
    id: '17',
    title: 'Private Majlis Tasting',
    date: '2025-03-29',
    time: '7:00 PM',
    location: 'Diplomatic Quarter, Riyadh',
    maxCapacity: 18,
    price: 280,
    description: 'An evening of premium dates, Arabic coffee, and modern Saudi cuisine pairings.',
    image: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=800&h=600&fit=crop',
    targetInterests: ['Fine Dining'],
    targetCities: ['Riyadh'],
    invitedMembersIds: [17], // Faisal R.
    rsvps: {
      yes: ['17', '18'],
      no: [],
      maybe: ['19']
    },
    waitlist: [],
    clubId: 3
  },
  {
    id: '18',
    title: 'Desert Night Music Soirée',
    date: '2025-04-07',
    time: '8:00 PM',
    location: 'Private Camp, Riyadh',
    maxCapacity: 25,
    price: 320,
    description: 'Live oud and jazz fusion under the stars with artisanal mocktails and canapés.',
    image: 'https://images.unsplash.com/photo-1470229538611-16ba8c7ffbd7?w=800&h=600&fit=crop',
    targetInterests: ['Live Music', 'Art & Culture'],
    targetCities: ['Riyadh'],
    invitedMembersIds: [18], // Laila K.
    rsvps: {
      yes: ['17', '18', '19'],
      no: [],
      maybe: []
    },
    waitlist: [],
    clubId: 3
  },
  // Upcoming events (future-dated) for demos
  {
    id: '19',
    title: 'Winter White Gala',
    date: '2026-01-20',
    time: '8:00 PM',
    location: 'Grand Ballroom, Paris',
    maxCapacity: 150,
    price: 650,
    description: 'Black-tie gala featuring Michelin-starred tasting menu and live orchestra.',
    image: 'https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=800&h=600&fit=crop',
    targetInterests: ['Fine Dining', 'Art & Culture'],
    targetCities: ['Paris', 'London'],
    invitedMembersIds: [1, 2, 3, 7, 10, 11], // John D., Maria S., Marid S., Robert M., Sophie B., Alexandre P.
    rsvps: { yes: ['1', '2', '7', '10'], no: [], maybe: ['3', '8'] },
    waitlist: [],
    attendance: undefined,
    clubId: 1
  },
  {
    id: '20',
    title: 'Sky Garden Soirée',
    date: '2026-02-05',
    time: '7:30 PM',
    location: 'Sky Garden, Dubai',
    maxCapacity: 120,
    price: 550,
    description: 'Sunset canapés, live DJ, and signature cocktails overlooking the skyline.',
    image: 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&h=600&fit=crop',
    targetInterests: ['Craft Cocktails', 'Live Music'],
    targetCities: ['Dubai', 'Abu Dhabi'],
    invitedMembersIds: [4, 5, 16], // David C., Serish K., Nour F.
    rsvps: { yes: ['4', '5', '14', '15', '16'], no: [], maybe: ['9'] },
    waitlist: [],
    attendance: undefined,
    clubId: 2
  },
  {
    id: '21',
    title: 'Desert Stargazing Retreat',
    date: '2026-03-12',
    time: '6:30 PM',
    location: 'Private Camp, Riyadh',
    maxCapacity: 60,
    price: 480,
    description: 'Astronomy-led stargazing, oud music, and Bedouin-inspired fine dining.',
    image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=800&h=600&fit=crop',
    targetInterests: ['Luxury Travel', 'Art & Culture', 'Live Music'],
    targetCities: ['Riyadh'],
    invitedMembersIds: [17, 18], // Faisal R., Laila K.
    rsvps: { yes: ['17', '18'], no: [], maybe: ['19'] },
    waitlist: [],
    attendance: undefined,
    clubId: 3
  }
]

