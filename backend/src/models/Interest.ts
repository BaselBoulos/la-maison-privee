import mongoose, { Schema, Document } from 'mongoose'

export interface IInterest extends Document {
  name: string
  icon?: string
  enabled: boolean
  clubId?: number
  createdAt: Date
  updatedAt: Date
}

const InterestSchema = new Schema<IInterest>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    icon: {
      type: String,
      trim: true
    },
    enabled: {
      type: Boolean,
      default: true
    },
    clubId: {
      type: Number,
      index: true
    }
  },
  {
    timestamps: true
  }
)

// Add indexes for performance
InterestSchema.index({ clubId: 1, enabled: 1 })

export default mongoose.model<IInterest>('Interest', InterestSchema)

