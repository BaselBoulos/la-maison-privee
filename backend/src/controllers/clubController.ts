import { Request, Response } from 'express'
import Club from '../models/Club'
import { getClubId } from '../utils/club'
import jwt from 'jsonwebtoken'

export const listClubs = async (_req: Request, res: Response) => {
  try {
    const clubs = await Club.find().sort({ id: 1 }).lean()
    
    const formatted = clubs.map((c: any) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      theme: c.theme,
      locale: c.locale,
      currency: c.currency
    }))
    
    res.json(formatted)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const getCurrentClub = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const club = await Club.findOne({ id: clubId }).lean()
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }
    
    res.json({
      id: club.id,
      name: club.name,
      slug: club.slug,
      theme: club.theme,
      locale: club.locale,
      currency: club.currency
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      return res.status(500).json({ message: 'Server configuration error: JWT_SECRET not set' })
    }
    const decoded = jwt.verify(token, jwtSecret) as any
    if (decoded.role !== 'super') {
      return res.status(403).json({ message: 'Only super admins can delete clubs' })
    }
    
    const clubId = Number(req.params.id)
    if (!clubId) {
      return res.status(400).json({ message: 'Invalid club id' })
    }
    
    // Prevent deleting clubs with id <= 3 (seed clubs)
    if (clubId <= 3) {
      return res.status(400).json({ message: 'Seed clubs cannot be deleted' })
    }
    
    const club = await Club.findOneAndDelete({ id: clubId })
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }
    
    return res.json({ message: 'Club deleted' })
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to delete club' })
  }
}

export const updateCurrentClub = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const club = await Club.findOne({ id: clubId })
    
    if (!club) {
      return res.status(404).json({ message: 'Club not found' })
    }
    
    const payload = req.body || {}
    
    if (payload.name) club.name = payload.name
    if (payload.slug) club.slug = payload.slug
    if (payload.theme) {
      club.theme = {
        ...club.theme,
        ...payload.theme
      }
    }
    if (payload.locale) club.locale = payload.locale
    if (payload.currency) club.currency = payload.currency
    
    await club.save()
    
    res.json({
      id: club.id,
      name: club.name,
      slug: club.slug,
      theme: club.theme,
      locale: club.locale,
      currency: club.currency
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
