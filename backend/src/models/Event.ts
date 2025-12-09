import mongoose, { Schema, Document } from 'mongoose'

export interface IEvent extends Document {
  title: string
  date: Date
  time: string
  location: string
  maxCapacity?: number
  price?: number
  description: string
  image?: string
  targetInterests: mongoose.Types.ObjectId[]
  targetCities: string[]
  targetStatus?: string[]
  rsvps: {
    yes: mongoose.Types.ObjectId[]
    no: mongoose.Types.ObjectId[]
    maybe: mongoose.Types.ObjectId[]
  }
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    maxCapacity: {
      type: Number
    },
    price: {
      type: Number
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String
    },
    targetInterests: [{
      type: Schema.Types.ObjectId,
      ref: 'Interest'
    }],
    targetCities: [{
      type: String
    }],
    targetStatus: [{
      type: String,
      enum: ['active', 'inactive', 'invited']
    }],
    rsvps: {
      yes: [{
        type: Schema.Types.ObjectId,
        ref: 'Member'
      }],
      no: [{
        type: Schema.Types.ObjectId,
        ref: 'Member'
      }],
      maybe: [{
        type: Schema.Types.ObjectId,
        ref: 'Member'
      }]
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model<IEvent>('Event', EventSchema)

