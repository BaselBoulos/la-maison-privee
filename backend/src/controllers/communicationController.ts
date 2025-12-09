import { Request, Response } from 'express'
import { mockMembers } from '../data/mockData'

// Store email history (in a real app, this would be in a database)
const emailHistory: Array<{
  id: string
  memberId: string
  memberEmail: string
  subject: string
  body: string
  sentAt: string
  status: 'sent' | 'failed'
}> = []

// Send email to single member
export const sendEmailToMember = async (req: Request, res: Response) => {
  try {
    const { memberId, subject, body } = req.body
    
    if (!memberId || !subject || !body) {
      return res.status(400).json({ message: 'memberId, subject, and body are required.' })
    }
    
    const member = mockMembers.find(m => m.id === memberId)
    
    if (!member) {
      return res.status(404).json({ message: 'Member not found' })
    }
    
    // In a real app, you would send an actual email here using nodemailer or similar
    // For now, we'll just log it and store in history
    console.log(`[EMAIL] To: ${member.email}`)
    console.log(`[EMAIL] Subject: ${subject}`)
    console.log(`[EMAIL] Body: ${body}`)
    
    const emailRecord = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      memberId: member.id,
      memberEmail: member.email,
      subject,
      body,
      sentAt: new Date().toISOString(),
      status: 'sent' as const
    }
    
    emailHistory.push(emailRecord)
    
    res.json({
      success: true,
      message: 'Email sent successfully',
      emailRecord
    })
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Send bulk emails
export const sendBulkEmails = async (req: Request, res: Response) => {
  try {
    const { memberIds, subject, body } = req.body
    
    if (!Array.isArray(memberIds) || !subject || !body) {
      return res.status(400).json({ message: 'memberIds must be an array, and subject and body are required.' })
    }
    
    const results = {
      sent: [] as string[],
      failed: [] as string[],
      notFound: [] as string[]
    }
    
    memberIds.forEach((memberId: string) => {
      const member = mockMembers.find(m => m.id === memberId)
      
      if (!member) {
        results.notFound.push(memberId)
        return
      }
      
      try {
        // In a real app, you would send an actual email here
        console.log(`[BULK EMAIL] To: ${member.email}`)
        console.log(`[BULK EMAIL] Subject: ${subject}`)
        console.log(`[BULK EMAIL] Body: ${body}`)
        
        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member.id,
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'sent' as const
        }
        
        emailHistory.push(emailRecord)
        results.sent.push(memberId)
      } catch (error) {
        results.failed.push(memberId)
      }
    })
    
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
    const { subject, body, filters } = req.body
    
    if (!subject || !body) {
      return res.status(400).json({ message: 'subject and body are required.' })
    }
    
    let filteredMembers = [...mockMembers]
    
    // Apply filters
    if (filters) {
      if (filters.interests && Array.isArray(filters.interests)) {
        filteredMembers = filteredMembers.filter(m => 
          m.interests.some(i => filters.interests.includes(i))
        )
      }
      
      if (filters.cities && Array.isArray(filters.cities)) {
        filteredMembers = filteredMembers.filter(m => 
          m.city && filters.cities.includes(m.city)
        )
      }
      
      if (filters.status && Array.isArray(filters.status)) {
        filteredMembers = filteredMembers.filter(m => 
          filters.status.includes(m.status)
        )
      }
      
      if (filters.tiers && Array.isArray(filters.tiers)) {
        // Note: This would require calculating tiers, simplified for now
        // In real implementation, you'd calculate tier for each member
      }
    }
    
    const results = {
      sent: [] as string[],
      failed: [] as string[]
    }
    
    filteredMembers.forEach(member => {
      try {
        console.log(`[FILTERED EMAIL] To: ${member.email}`)
        console.log(`[FILTERED EMAIL] Subject: ${subject}`)
        console.log(`[FILTERED EMAIL] Body: ${body}`)
        
        const emailRecord = {
          id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          memberId: member.id,
          memberEmail: member.email,
          subject,
          body,
          sentAt: new Date().toISOString(),
          status: 'sent' as const
        }
        
        emailHistory.push(emailRecord)
        results.sent.push(member.id)
      } catch (error) {
        results.failed.push(member.id)
      }
    })
    
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
    const { memberId } = req.params
    
    const memberEmails = emailHistory.filter(e => e.memberId === memberId)
    
    res.json(memberEmails)
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

// Get all email history
export const getAllEmailHistory = async (req: Request, res: Response) => {
  try {
    res.json(emailHistory.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()))
  } catch (error: any) {
    res.status(500).json({ message: error.message })
  }
}

