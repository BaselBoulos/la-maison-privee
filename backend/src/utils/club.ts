import { Request } from 'express'
import jwt from 'jsonwebtoken'

const DEFAULT_CLUB_ID = 1

export const getClubId = (req: Request): number => {
  // Try to get role and clubId from JWT token
  let tokenRole: string | undefined
  let tokenClubId: number | undefined
  let tokenAllowedClubIds: number[] | undefined
  
  try {
    const token = (req.headers.authorization as string | undefined)?.replace('Bearer ', '')
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
      tokenRole = decoded.role
      tokenClubId = decoded.clubId ? Number(decoded.clubId) : undefined
      tokenAllowedClubIds = decoded.allowedClubIds ? decoded.allowedClubIds.map((id: any) => Number(id)) : undefined
    }
  } catch (error) {
    // Token invalid or missing, continue with header/query logic
  }

  // If user is a club admin, lock them to their assigned clubId from token
  if (tokenRole === 'club') {
    // If multiple allowed clubs, honor requested club if within allowed list
    const allowed = tokenAllowedClubIds && tokenAllowedClubIds.length > 0 ? tokenAllowedClubIds : tokenClubId ? [tokenClubId] : []
    const headerValue = req.headers['x-club-id'] ? Number(req.headers['x-club-id']) : undefined
    const queryValue = req.query.clubId ? Number(req.query.clubId) : undefined
    const requested = headerValue || queryValue

    if (allowed.length > 0) {
      if (requested && allowed.includes(requested)) {
        return requested
      }
      return allowed[0]
    }

    if (tokenClubId) {
      return tokenClubId
    }
  }

  // For super admins or if no token, allow header/query override
  const headerValue = req.headers['x-club-id'] ? Number(req.headers['x-club-id']) : undefined
  const queryValue = req.query.clubId ? Number(req.query.clubId) : undefined

  return headerValue || queryValue || tokenClubId || DEFAULT_CLUB_ID
}


