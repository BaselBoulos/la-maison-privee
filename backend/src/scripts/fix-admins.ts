import mongoose from 'mongoose'
import '../config/env'
import Admin from '../models/Admin'

const fixAdmins = async () => {
  try {
    const uri = process.env.MONGODB_URI
    if (!uri) {
      console.error('❌ MONGODB_URI not found')
      process.exit(1)
    }

    const dashboardUri = uri.replace(/\/[^/?]+(\?|$)/, '/dashboard$1')
    
    console.log('🔌 Connecting to MongoDB (dashboard database)...')
    await mongoose.connect(dashboardUri, {
      retryWrites: true,
      w: 'majority',
    })
    console.log('✅ Connected to MongoDB')
    console.log(`📊 Database: ${mongoose.connection.name}\n`)
    
    // Fix admins
    const superAdmin = await Admin.findOne({ email: 'super@lamaisonprivee.com' })
    if (superAdmin) {
      superAdmin.role = 'super'
      superAdmin.allowedClubIds = [1, 2, 3]
      await superAdmin.save()
      console.log('✓ Fixed super admin')
    }
    
    const lmpAdmin = await Admin.findOne({ email: 'lmp.admin@lamaisonprivee.com' })
    if (lmpAdmin) {
      lmpAdmin.role = 'club'
      lmpAdmin.clubId = 1
      lmpAdmin.allowedClubIds = [1]
      await lmpAdmin.save()
      console.log('✓ Fixed LMP admin')
    }
    
    const dxbAdmin = await Admin.findOne({ email: 'dxb.admin@gulfprivee.com' })
    if (dxbAdmin) {
      dxbAdmin.role = 'club'
      dxbAdmin.clubId = 2
      dxbAdmin.allowedClubIds = [2, 3]
      await dxbAdmin.save()
      console.log('✓ Fixed DXB admin')
    }
    
    // Ensure all admins have a role
    const adminsWithoutRole = await Admin.find({ role: { $exists: false } })
    for (const admin of adminsWithoutRole) {
      admin.role = 'club'
      await admin.save()
      console.log(`✓ Fixed admin ${admin.email} - set role to 'club'`)
    }
    
    console.log('\n✅ All admins fixed!')
    
    await mongoose.connection.close()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    await mongoose.connection.close()
    process.exit(1)
  }
}

fixAdmins()

