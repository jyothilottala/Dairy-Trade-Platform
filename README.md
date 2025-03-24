# Dairy Connect Platform

A platform to connect potential dairy importers worldwide with major dairy product manufacturers in India.

## Features

- User authentication for importers and manufacturers
- Profile management for both importers and manufacturers
- Product listing and search functionality
- Real-time messaging system
- Dashboard for tracking connections and communications
- Advanced search and filtering options

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: MongoDB
- Authentication: JWT
- UI Framework: Material-UI

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```
4. Start the development servers:

   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd frontend
   npm start
   ```

## Project Structure

```
dairy-connect/
├── frontend/           # React frontend application
├── backend/           # Node.js backend application
└── README.md         # Project documentation
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
