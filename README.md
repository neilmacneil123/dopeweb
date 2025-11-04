# DopeWeb

A modern web-based multiplayer clone of the classic Drug Wars game.

## Features

- Real-time multiplayer trading
- City-based market system
- User authentication and persistence
- Market price fluctuations
- Random events
- Leaderboard system

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- MongoDB
- Socket.IO
- JWT Authentication
- Zustand for state management

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Create a `.env.local` file with your MongoDB connection string

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
```

## Game Rules

1. Start with $2,000 cash and $5,500 debt
2. Travel between cities to buy and sell drugs at different prices
3. Watch out for random events (police busts, found stashes)
4. Pay off your debt before the loan shark comes looking
5. Compete with other players for the highest score

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT

## Disclaimer

This is a game remake for educational purposes only. No real drugs or illegal substances are involved.
