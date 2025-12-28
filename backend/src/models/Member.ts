import mongoose, { Schema, Document } from 'mongoose'

export interface IMember extends Document {
  name: string
  email: string
  phone?: string
  city?: string
  interests: mongoose.Types.ObjectId[]
  status: 'active' | 'inactive' | 'invited'
  invitationCode: mongoose.Types.ObjectId
  joinedDate: Date
  profilePhoto?: string
  clubId: number
  createdAt: Date
  updatedAt: Date
}

const MemberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    city: {
      type: String,
      trim: true
    },
    interests: [{
      type: Schema.Types.ObjectId,
      ref: 'Interest'
    }],
    status: {
      type: String,
      enum: ['active', 'inactive', 'invited'],
      default: 'invited'
    },
    invitationCode: {
      type: Schema.Types.ObjectId,
      ref: 'InvitationCode',
      required: true
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    profilePhoto: {
      type: String
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

// Add indexes for performance
// Email should be unique per club (compound index)
MemberSchema.index({ clubId: 1, email: 1 }, { unique: true })
MemberSchema.index({ clubId: 1, status: 1 })
MemberSchema.index({ clubId: 1, city: 1 })

export default mongoose.model<IMember>('Member', MemberSchema)

