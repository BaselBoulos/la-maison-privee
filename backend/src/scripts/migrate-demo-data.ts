import mongoose from 'mongoose'
import '../config/env'
import Club from '../models/Club'
import Interest from '../models/Interest'
import InvitationCode from '../models/InvitationCode'
import Member from '../models/Member'
import Event from '../models/Event'
import Admin from '../models/Admin'
import {
  mockClubs,
  mockInterests,
  mockInvitationCodes,
  mockMembers,
  mockEvents
} from '../data/mockData'

// Mock admins data (from authController)
const MOCK_ADMINS = [
  {
    email: 'super@lamaisonprivee.com',
    password: 'admin123', // Will be hashed by Admin model
    name: 'Super Admin',
    role: 'super' as const,
    clubId: undefined,
    allowedClubIds: [1, 2, 3] // All clubs
  },
  {
    email: 'lmp.admin@lamaisonprivee.com',
    password: 'admin123',
    name: 'LMP Admin',
    role: 'club' as const,
    clubId: 1,
    allowedClubIds: [1]
  },
  {
    email: 'dxb.admin@gulfprivee.com',
    password: 'admin123',
    name: 'Gulf Privée Admin',
    role: 'club' as const,
    clubId: 2,
    allowedClubIds: [2, 3]
  }
]

const migrate = async () => {
  try {
    // Connect to MongoDB with "dashboard" database
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.error('❌ MONGODB_URI not found in environment variables')
      process.exit(1)
    }

    // Replace database name with "dashboard"
    const dashboardUri = uri.replace(/\/[^/?]+(\?|$)/, '/dashboard$1')
    
    console.log('🔌 Connecting to MongoDB (dashboard database)...')
    await mongoose.connect(dashboardUri, {
      retryWrites: true,
      w: 'majority',
    })
    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${mongoose.connection.name}`)
    
    // Clear existing data and drop indexes
    console.log('\n🗑️  Clearing existing data and indexes...')
    await Club.deleteMany({})
    await Interest.deleteMany({})
    await InvitationCode.deleteMany({})
    await Member.deleteMany({})
    await Event.deleteMany({})
    await Admin.deleteMany({})
    
    // Drop old indexes that might conflict
    try {
      await Member.collection.dropIndexes()
      console.log('  ✓ Dropped old Member indexes')
    } catch (e: any) {
      if (e.code !== 27) { // 27 = IndexNotFound
        console.warn('  ⚠️  Could not drop Member indexes:', e.message)
      }
    }
    
    console.log('✅ Existing data cleared')
    
    // Step 1: Migrate Clubs
    console.log('\n📦 Step 1: Migrating Clubs...')
    const clubMap = new Map<number, mongoose.Types.ObjectId>()
    for (const club of mockClubs) {
      const doc = await Club.create({
        id: club.id,
        name: club.name,
        slug: club.slug,
        theme: club.theme,
        locale: club.locale,
        currency: club.currency
      })
      clubMap.set(club.id, doc._id)
      console.log(`  ✓ Created club: ${club.name} (ID: ${club.id})`)
    }
    console.log(`✅ Migrated ${mockClubs.length} clubs`)
    
    // Step 2: Migrate Interests
    console.log('\n📦 Step 2: Migrating Interests...')
    const interestMap = new Map<string, mongoose.Types.ObjectId>()
    for (const interest of mockInterests) {
      const doc = await Interest.create({
        name: interest.name,
        icon: interest.icon,
        enabled: interest.enabled,
        clubId: interest.clubId
      })
      interestMap.set(interest.id, doc._id)
      console.log(`  ✓ Created interest: ${interest.name}`)
    }
    console.log(`✅ Migrated ${mockInterests.length} interests`)
    
    // Step 3: Migrate InvitationCodes
    console.log('\n📦 Step 3: Migrating Invitation Codes...')
    const codeMap = new Map<string, mongoose.Types.ObjectId>()
    for (const code of mockInvitationCodes) {
      const doc = await InvitationCode.create({
        code: code.code,
        status: code.status,
        createdAt: new Date(code.createdAt),
        usedAt: code.usedAt ? new Date(code.usedAt) : undefined,
        expiresAt: code.expiresAt ? new Date(code.expiresAt) : undefined,
        clubId: code.clubId
      })
      codeMap.set(code.id, doc._id)
      console.log(`  ✓ Created code: ${code.code} (${code.status})`)
    }
    console.log(`✅ Migrated ${mockInvitationCodes.length} invitation codes`)
    
    // Step 4: Migrate Members
    console.log('\n📦 Step 4: Migrating Members...')
    const memberMap = new Map<string, mongoose.Types.ObjectId>()
    let skippedCount = 0
    for (const member of mockMembers) {
      try {
        // Check if member with same email and clubId already exists
        const existing = await Member.findOne({ 
          email: member.email.toLowerCase(), 
          clubId: member.clubId 
        })
        
        if (existing) {
          console.warn(`  ⚠️  Skipped duplicate: ${member.name} (${member.email}) in club ${member.clubId}`)
          memberMap.set(member.id, existing._id)
          skippedCount++
          continue
        }
        
        // Find interest ObjectIds by name
        const interestIds = member.interests
          .map(interestName => {
            const interest = mockInterests.find(
              i => i.name === interestName && 
              (!i.clubId || i.clubId === member.clubId)
            )
            return interest ? interestMap.get(interest.id) : null
          })
          .filter(Boolean) as mongoose.Types.ObjectId[]
        
        // Find invitation code ObjectId
        const codeId = member.invitationCode
          ? codeMap.get(
              mockInvitationCodes.find(c => c.code === member.invitationCode)?.id || ''
            )
          : undefined
        
        if (!codeId && member.invitationCode) {
          console.warn(`  ⚠️  Warning: Invitation code ${member.invitationCode} not found for member ${member.name}`)
        }
        
        const doc = await Member.create({
          name: member.name,
          email: member.email,
          phone: member.phone,
          city: member.city,
          interests: interestIds,
          status: member.status,
          invitationCode: codeId || new mongoose.Types.ObjectId(), // Fallback if code not found
          joinedDate: new Date(member.joinedDate),
          profilePhoto: member.profilePhoto,
          clubId: member.clubId
        })
        memberMap.set(member.id, doc._id)
        console.log(`  ✓ Created member: ${member.name} (${member.email})`)
      } catch (error: any) {
        if (error.code === 11000) {
          // Duplicate key error - try to find existing member
          const existing = await Member.findOne({ 
            email: member.email.toLowerCase(), 
            clubId: member.clubId 
          })
          if (existing) {
            console.warn(`  ⚠️  Skipped duplicate: ${member.name} (${member.email}) in club ${member.clubId}`)
            memberMap.set(member.id, existing._id)
            skippedCount++
          } else {
            throw error
          }
        } else {
          throw error
        }
      }
    }
    console.log(`✅ Migrated ${mockMembers.length - skippedCount} members (${skippedCount} skipped as duplicates)`)
    
    // Step 5: Migrate Events
    console.log('\n📦 Step 5: Migrating Events...')
    for (const event of mockEvents) {
      // Find target interest ObjectIds by name
      const targetInterestIds = event.targetInterests
        .map(interestName => {
          const interest = mockInterests.find(
            i => i.name === interestName && 
            (!i.clubId || i.clubId === event.clubId)
          )
          return interest ? interestMap.get(interest.id) : null
        })
        .filter(Boolean) as mongoose.Types.ObjectId[]
      
      // Convert member ID strings to ObjectIds for RSVPs
      const rsvpYes = event.rsvps.yes
        .map(id => memberMap.get(id))
        .filter(Boolean) as mongoose.Types.ObjectId[]
      
      const rsvpNo = event.rsvps.no
        .map(id => memberMap.get(id))
        .filter(Boolean) as mongoose.Types.ObjectId[]
      
      const rsvpMaybe = event.rsvps.maybe
        .map(id => memberMap.get(id))
        .filter(Boolean) as mongoose.Types.ObjectId[]
      
      // Convert attendance member IDs
      const attended = event.attendance?.attended
        .map(id => memberMap.get(id))
        .filter(Boolean) as mongoose.Types.ObjectId[] || []
      
      const noShow = event.attendance?.noShow
        .map(id => memberMap.get(id))
        .filter(Boolean) as mongoose.Types.ObjectId[] || []
      
      await Event.create({
        title: event.title,
        date: new Date(event.date),
        time: event.time,
        location: event.location,
        maxCapacity: event.maxCapacity,
        price: event.price,
        description: event.description,
        image: event.image,
        targetInterests: targetInterestIds,
        targetCities: event.targetCities,
        invitedMembersIds: event.invitedMembersIds,
        rsvps: {
          yes: rsvpYes,
          no: rsvpNo,
          maybe: rsvpMaybe
        },
        attendance: event.attendance ? {
          attended,
          noShow
        } : undefined,
        clubId: event.clubId
      })
      console.log(`  ✓ Created event: ${event.title}`)
    }
    console.log(`✅ Migrated ${mockEvents.length} events`)
    
    // Step 6: Migrate Admins
    console.log('\n📦 Step 6: Migrating Admins...')
    for (const admin of MOCK_ADMINS) {
      await Admin.create({
        email: admin.email,
        password: admin.password, // Will be hashed by pre-save hook
        name: admin.name,
        role: admin.role || 'club',
        clubId: admin.clubId,
        allowedClubIds: admin.allowedClubIds || (admin.clubId ? [admin.clubId] : [])
      })
      console.log(`  ✓ Created admin: ${admin.name} (${admin.email}) - Role: ${admin.role || 'club'}`)
    }
    console.log(`✅ Migrated ${MOCK_ADMINS.length} admins`)
    
    // Summary
    console.log('\n📊 Migration Summary:')
    console.log(`  • Clubs: ${mockClubs.length}`)
    console.log(`  • Interests: ${mockInterests.length}`)
    console.log(`  • Invitation Codes: ${mockInvitationCodes.length}`)
    console.log(`  • Members: ${mockMembers.length}`)
    console.log(`  • Events: ${mockEvents.length}`)
    console.log(`  • Admins: ${MOCK_ADMINS.length}`)
    
    console.log('\n🎉 Migration completed successfully!')
    
    await mongoose.connection.close()
    console.log('✅ Database connection closed')
    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Migration error:', error)
    if (error.stack) {
      console.error(error.stack)
    }
    await mongoose.connection.close()
    process.exit(1)
  }
}

migrate()

