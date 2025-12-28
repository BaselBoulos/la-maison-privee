import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin'
import Club from '../models/Club'
import bcrypt from 'bcryptjs'

type AdminRole = 'super' | 'club'

const generateToken = (adminId: string, role: AdminRole, clubId?: number, allowedClubIds?: number[]): string => {
  return jwt.sign({ adminId, role, clubId, allowedClubIds }, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  })
}

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body
    
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    
    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase() })
    
    if (!admin) {
      console.error('[AUTH] Admin not found:', email.toLowerCase())
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, admin.password)
    if (!isValidPassword) {
      console.error('[AUTH] Invalid password for:', email.toLowerCase())
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    
    // Ensure admin has role (migration might have missed it)
    if (!admin.role) {
      console.warn('[AUTH] Admin missing role, setting default:', email.toLowerCase())
      admin.role = 'club'
      await admin.save()
    }
    
    // Get all clubs for super admin, or specific club for club admin
    const clubs = await Club.find().sort({ id: 1 }).lean()
    const adminRole = admin.role || 'club'
    const superAdminAllowed = adminRole === 'super' 
      ? clubs.map(c => c.id) 
      : admin.allowedClubIds || []
    
    const token = generateToken(
      admin._id.toString(), 
      adminRole, 
      admin.clubId, 
      superAdminAllowed
    )
    
    const club = admin.clubId 
      ? clubs.find(c => c.id === admin.clubId) 
      : undefined
    
    res.json({
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
        role: adminRole,
        clubId: admin.clubId,
        allowedClubIds: superAdminAllowed
      },
      club: club ? {
        id: club.id,
        name: club.name,
        slug: club.slug,
        theme: club.theme,
        locale: club.locale,
        currency: club.currency
      } : undefined
    })
  } catch (error: any) {
    console.error('[AUTH] Login error:', error)
    res.status(500).json({ message: error.message || 'Login failed' })
  }
}

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name, clubName, clubSlug } = req.body
    
    if (!email || !password || !name || !clubName) {
      return res.status(400).json({ message: 'Name, email, password, and clubName are required' })
    }
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: email.toLowerCase() })
    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin already exists' })
    }
    
    // Get next club ID
    const clubs = await Club.find().sort({ id: -1 }).limit(1).lean()
    const nextClubId = clubs.length > 0 ? clubs[0].id + 1 : 1
    
    const slug = (clubSlug || clubName || 'club')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || `club-${nextClubId}`
    
    // Create new club
    const newClub = await Club.create({
      id: nextClubId,
      name: clubName,
      slug,
      theme: { primary: '#d4af37', accent: '#8b2635', logo: '' },
      locale: 'en-IL',
      currency: 'ILS'
    })
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Create new admin
    const newAdmin = await Admin.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: 'club',
      clubId: nextClubId,
      allowedClubIds: [nextClubId]
    })
    
    // Get all clubs for token
    const allClubs = await Club.find().sort({ id: 1 }).lean()
    const superAdminAllowed = allClubs.map(c => c.id)
    
    const token = generateToken(
      newAdmin._id.toString(), 
      newAdmin.role, 
      newAdmin.clubId, 
      newAdmin.allowedClubIds
    )
    
    res.status(201).json({
      token,
      admin: {
        id: newAdmin._id.toString(),
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        clubId: newAdmin.clubId,
        allowedClubIds: newAdmin.allowedClubIds
      },
      club: {
        id: newClub.id,
        name: newClub.name,
        slug: newClub.slug,
        theme: newClub.theme,
        locale: newClub.locale,
        currency: newClub.currency
      },
      onboardingRequired: false
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
