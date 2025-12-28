import { Request, Response } from 'express'
import Member from '../models/Member'
import Club from '../models/Club'
import { buildEmailContent, sendEmail } from '../services/emailService'
import { getClubId } from '../utils/club'

// Store email history (in a real app, this would be in a database)
const emailHistory: Array<{
  id: string
  memberId: string
  memberEmail: string
  subject: string
  body: string
  sentAt: string
  status: 'sent' | 'failed'
  clubId: number
  error?: string
}> = []

// Send email to single member
export const sendEmailToMember = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberId, subject, body } = req.body
    
    if (!memberId || !subject || !body) {
      return res.status(400).json({ message: 'memberId, subject, and body are required.' })
    }
    
    const member = await Member.findOne({
      _id: memberId,
      clubId
    }).lean()
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    const club = await Club.findOne({ id: clubId }).lean()
    const { html, text } = buildEmailContent(subject, body, club?.name || 'La Maison Privée')
    const baseRecord = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      memberId: member._id.toString(),
      memberEmail: member.email,
      subject,
      body,
      sentAt: new Date().toISOString(),
      clubId
    }

    try {
      console.log('[EMAIL][SINGLE] Sending', { to: member.email, subject })
      await sendEmail({
        to: member.email,
        subject,
        html,
        text
      })

      const emailRecord = { ...baseRecord, status: 'sent' as const }
      emailHistory.push(emailRecord)

      res.json({
        success: true,
        message: 'Email sent successfully',
        emailRecord
      })
    } catch (error: any) {
      const emailRecord = { ...baseRecord, status: 'failed' as const, error: error?.message }
      emailHistory.push(emailRecord)
      res.status(500).json({ message: 'Failed to send email', error: error?.message })
    }
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Send bulk emails
export const sendBulkEmails = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberIds, subject, body } = req.body
    
    if (!Array.isArray(memberIds) || !subject || !body) {
      return res.status(400).json({ message: 'memberIds must be an array, and subject and body are required.' })
    }
    
    const results = {
      sent: [] as string[],
      failed: [] as string[],
      notFound: [] as string[]
    }
    
    const club = await Club.findOne({ id: clubId }).lean()
    const { html, text } = buildEmailContent(subject, body, club?.name || 'La Maison Privée')

    for (const memberId of memberIds) {
      const member = await Member.findOne({
        _id: memberId,
        clubId
      }).lean()
      
      if (!member) {
        results.notFound.push(memberId)
        continue
      }
      
      try {
        console.log('[EMAIL][BULK] Sending', { to: member.email, subject, memberId })
        await sendEmail({
          to: member.email,
          subject,
          html,
          text
        })

        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member._id.toString(),
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'sent' as const,
          clubId
        }
        
        emailHistory.push(emailRecord)
        results.sent.push(memberId)
      } catch (error) {
        console.error('[EMAIL][BULK] Failed', { to: member.email, subject, memberId, error: (error as Error)?.message })
        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member._id.toString(),
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'failed' as const,
          clubId,
          error: (error as Error)?.message
        }

        emailHistory.push(emailRecord)
        results.failed.push(memberId)
      }
    }
    
    res.json({
      success: true,
      total: memberIds.length,
      sent: results.sent.length,
      failed: results.failed.length,
      notFound: results.notFound.length,
      results
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Send emails with filters
export const sendFilteredEmails = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { subject, body, filters } = req.body
    
    if (!subject || !body) {
      return res.status(400).json({ message: 'subject and body are required.' })
    }
    
    const query: any = { clubId }
    
    // Apply filters
    if (filters) {
      if (filters.cities && Array.isArray(filters.cities)) {
        query.city = { $in: filters.cities }
      }
      
      if (filters.status && Array.isArray(filters.status)) {
        query.status = { $in: filters.status }
      }
      
      // Handle interests filter
      if (filters.interests && Array.isArray(filters.interests)) {
        // This would require Interest model lookup - simplified for now
        // In full implementation, convert interest names to ObjectIds
      }
    }
    
    const filteredMembers = await Member.find(query).lean()
    
    const results = {
      sent: [] as string[],
      failed: [] as string[]
    }
    
    const club = await Club.findOne({ id: clubId }).lean()
    const { html, text } = buildEmailContent(subject, body, club?.name || 'La Maison Privée')

    for (const member of filteredMembers) {
      try {
        console.log('[EMAIL][FILTERED] Sending', { to: member.email, subject, memberId: member._id.toString() })
        await sendEmail({
          to: member.email,
          subject,
          html,
          text
        })

        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member._id.toString(),
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'sent' as const,
          clubId
        }
        
        emailHistory.push(emailRecord)
        results.sent.push(member._id.toString())
      } catch (error) {
        console.error('[EMAIL][FILTERED] Failed', { to: member.email, subject, memberId: member._id.toString(), error: (error as Error)?.message })
        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member._id.toString(),
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'failed' as const,
          clubId,
          error: (error as Error)?.message
        }

        emailHistory.push(emailRecord)
        results.failed.push(member._id.toString())
      }
    }
    
    res.json({
      success: true,
      total: filteredMembers.length,
      sent: results.sent.length,
      failed: results.failed.length,
      results
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get email history for a member
export const getMemberEmailHistory = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    const { memberId } = req.params
    
    const memberEmails = emailHistory.filter(e => e.memberId === memberId && e.clubId === clubId)
    
    res.json(memberEmails)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get all email history
export const getAllEmailHistory = async (req: Request, res: Response) => {
  try {
    const clubId = getClubId(req)
    res.json(
      emailHistory
        .filter(e => e.clubId === clubId)
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
    )
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}
