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
      unique: true,
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
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IMember>('Member', MemberSchema)

