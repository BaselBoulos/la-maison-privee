# La Maison Privée Backend API

Backend API for the La Maison Privée private membership club management system.

## Tech Stack

- **Node.js** with **Express**
- **TypeScript** for type safety
- **MongoDB** with **Mongoose** for database
- **JWT** for authentication
- **bcryptjs** for password hashing

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update the `.env` file with your configuration:
   - Set `MONGODB_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a secure random string
   - Set `FRONTEND_URL` to your frontend URL

4. Start the development server:
```bash
npm run dev
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new admin
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token

### Members
- `GET /api/members` - Get all members (with optional filters)
- `GET /api/members/filtered` - Get filtered members for event targeting
- `GET /api/members/:id` - Get single member
- `PUT /api/members/:id` - Update member
- `DELETE /api/members/:id` - Delete member

### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get single event
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `POST /api/events/:id/rsvp` - Add RSVP to event

### Invitation Codes
- `GET /api/invitation-codes` - Get all invitation codes
- `GET /api/invitation-codes/:id` - Get single invitation code
- `POST /api/invitation-codes/generate` - Generate new invitation codes
- `DELETE /api/invitation-codes/:id` - Revoke invitation code

### Interests
- `GET /api/interests` - Get enabled interests
- `GET /api/interests/all` - Get all interests (including disabled)
- `POST /api/interests` - Create new interest
- `PUT /api/interests/:id` - Update interest
- `DELETE /api/interests/:id` - Delete interest (soft delete)

## Database Models

- **Member** - Club members with profile information
- **Event** - Club events with targeting and RSVP tracking
- **InvitationCode** - One-time invitation codes
- **Interest** - Member interests/categories
- **Admin** - Admin users for dashboard access

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run type-check` - Type check without building

## Environment Variables

- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS

