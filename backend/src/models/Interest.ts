import mongoose, { Schema, Document } from 'mongoose'

export interface IInterest extends Document {
  name: string
  icon?: string
  enabled: boolean
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
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IInterest>('Interest', InterestSchema)

