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
  invitedMembersIds?: number[] // IDs of members who were actually invited to this event
  rsvps: {
    yes: mongoose.Types.ObjectId[]
    no: mongoose.Types.ObjectId[]
    maybe: mongoose.Types.ObjectId[]
  }
  attendance?: {
    attended: mongoose.Types.ObjectId[]
    noShow: mongoose.Types.ObjectId[]
  }
  clubId: number
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
    invitedMembersIds: [{
      type: Number
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
    },
    clubId: {
      type: Number,
      required: true,
      index: true
    },
    attendance: {
      attended: [{
        type: Schema.Types.ObjectId,
        ref: 'Member'
      }],
      noShow: [{
        type: Schema.Types.ObjectId,
        ref: 'Member'
      }]
    }
  },
  {
    timestamps: true
  }
)

// Add indexes for performance
EventSchema.index({ clubId: 1, date: 1 })
EventSchema.index({ clubId: 1, 'rsvps.yes': 1 })

export default mongoose.model<IEvent>('Event', EventSchema)

