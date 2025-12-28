import mongoose, { Schema, Document } from 'mongoose'

export interface IClub extends Document {
  id: number // Custom numeric ID for compatibility
  name: string
  slug: string
  theme: {
    primary: string
    accent: string
    logo?: string
  }
  locale: string
  currency: string
  createdAt: Date
  updatedAt: Date
}

const ClubSchema = new Schema<IClub>(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    theme: {
      primary: {
        type: String,
        required: true
      },
      accent: {
        type: String,
        required: true
      },
      logo: {
        type: String
      }
    },
    locale: {
      type: String,
      required: true,
      default: 'en-IL'
    },
    currency: {
      type: String,
      required: true,
      default: 'ILS'
    }
  },
  {
    timestamps: true
  }
)

// Note: id and slug already have indexes from unique: true
// Additional indexes can be added here if needed

export default mongoose.model<IClub>('Club', ClubSchema)

