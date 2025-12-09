import { Request, Response } from 'express'
import { mockClubs } from '../data/mockData'
import { mergedClubs, updateRuntimeClub, removeRuntimeClub } from '../data/runtimeStore'
import { getClubId } from '../utils/club'
import jwt from 'jsonwebtoken'

export const listClubs = async (_req: Request, res: Response) => {
  res.json(mergedClubs(mockClubs))
}

export const getCurrentClub = async (req: Request, res: Response) => {
  const clubId = getClubId(req)
  const club = mergedClubs(mockClubs).find(c => c.id === clubId)

  if (!club) {
    return res.status(404).json({ message: 'Club not found' })
  }

  res.json(club)
}

export const deleteClub = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '')
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' })
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    if (decoded.role !== 'super') {
      return res.status(403).json({ message: 'Only super admins can delete clubs' })
    }

    const clubId = Number(req.params.id)
    if (!clubId) {
      return res.status(400).json({ message: 'Invalid club id' })
    }

    // Prevent deleting seeded/mock clubs
    if (mockClubs.some(c => c.id === clubId)) {
      return res.status(400).json({ message: 'Seed clubs cannot be deleted' })
    }

    const before = mergedClubs(mockClubs)
    if (!before.some(c => c.id === clubId)) {
      return res.status(404).json({ message: 'Club not found' })
    }

    removeRuntimeClub(clubId)
    return res.json({ message: 'Club deleted' })
  } catch (e: any) {
    return res.status(500).json({ message: e?.message || 'Failed to delete club' })
  }
}

export const updateCurrentClub = async (req: Request, res: Response) => {
  const clubId = getClubId(req)
  const clubs = mergedClubs(mockClubs)
  const existing = clubs.find(c => c.id === clubId)

  if (!existing) {
    return res.status(404).json({ message: 'Club not found' })
  }

  const payload = req.body || {}
  const updated = {
    ...existing,
    name: payload.name ?? existing.name,
    slug: payload.slug ?? existing.slug,
    theme: {
      ...existing.theme,
      ...(payload.theme || {})
    },
    locale: payload.locale ?? existing.locale,
    currency: payload.currency ?? existing.currency
  }

  updateRuntimeClub(updated)
  return res.json(updated)
}


