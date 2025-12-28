import mongoose, { Schema, Document } from 'mongoose'

export interface IInvitationCode extends Document {
  code: string
  status: 'unused' | 'used'
  assignedMember?: mongoose.Types.ObjectId
  clubId: number
  createdAt: Date
  usedAt?: Date
  expiresAt?: Date
}

const InvitationCodeSchema = new Schema<IInvitationCode>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['unused', 'used'],
      default: 'unused'
    },
    assignedMember: {
      type: Schema.Types.ObjectId,
      ref: 'Member'
    },
    usedAt: {
      type: Date
    },
    expiresAt: {
      type: Date
    },
    clubId: {
      type: Number,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// Index for faster lookups (code already indexed by unique: true)
InvitationCodeSchema.index({ status: 1 })
InvitationCodeSchema.index({ clubId: 1, status: 1 })

export default mongoose.model<IInvitationCode>('InvitationCode', InvitationCodeSchema)

