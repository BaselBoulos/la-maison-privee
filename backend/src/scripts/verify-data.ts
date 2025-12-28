import mongoose from 'mongoose'
import '../config/env'
import Club from '../models/Club'
import Interest from '../models/Interest'
import InvitationCode from '../models/InvitationCode'
import Member from '../models/Member'
import Event from '../models/Event'
import Admin from '../models/Admin'

const verify = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.error('❌ MONGODB_URI not found')
      process.exit(1)
    }

    // Connect to dashboard database
    const dashboardUri = uri.replace(/\/[^/?]+(\?|$)/, '/dashboard$1')
    
    console.log('🔌 Connecting to MongoDB (dashboard database)...')
    await mongoose.connect(dashboardUri, {
      retryWrites: true,
      w: 'majority',
    })
    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${mongoose.connection.name}\n`)
    
    // Count documents
    const clubsCount = await Club.countDocuments()
    const interestsCount = await Interest.countDocuments()
    const codesCount = await InvitationCode.countDocuments()
    const membersCount = await Member.countDocuments()
    const eventsCount = await Event.countDocuments()
    const adminsCount = await Admin.countDocuments()
    
    console.log('📊 Data Summary:')
    console.log(`  • Clubs: ${clubsCount}`)
    console.log(`  • Interests: ${interestsCount}`)
    console.log(`  • Invitation Codes: ${codesCount}`)
    console.log(`  • Members: ${membersCount}`)
    console.log(`  • Events: ${eventsCount}`)
    console.log(`  • Admins: ${adminsCount}\n`)
    
    // Show sample data
    console.log('📋 Sample Data:')
    
    const clubs = await Club.find().limit(3)
    console.log('\n🏛️  Clubs:')
    clubs.forEach(c => console.log(`  • ${c.name} (ID: ${c.id}, Slug: ${c.slug})`))
    
    const members = await Member.find().populate('interests').limit(3)
    console.log('\n👥 Members (sample):')
    members.forEach(m => {
      const interestNames = (m.interests as any[]).map((i: any) => i.name).join(', ')
      console.log(`  • ${m.name} (${m.email}) - Club: ${m.clubId} - Interests: ${interestNames || 'none'}`)
    })
    
    const events = await Event.find().populate('targetInterests').limit(3)
    console.log('\n📅 Events (sample):')
    events.forEach(e => {
      const interestNames = (e.targetInterests as any[]).map((i: any) => i.name).join(', ')
      console.log(`  • ${e.title} - ${e.date.toLocaleDateString()} - Club: ${e.clubId} - Interests: ${interestNames || 'none'}`)
    })
    
    console.log('\n✅ Verification complete!')
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Verification error:', error.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

verify()

