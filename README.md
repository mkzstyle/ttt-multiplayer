# 🎮 Multiplayer Tic Tac Toe

A real-time multiplayer Tic Tac Toe game built with Node.js, Express, and Socket.IO. Play with friends or get matched with random opponents online!

## ✨ Features

### 🎯 Game Modes
- **Create Room**: Create a private room and share the room ID with friends
- **Join Room**: Join a friend's game using their room ID
- **Random Match**: Get instantly matched with random online players

### 🎮 Gameplay
- Real-time multiplayer gameplay
- Automatic win detection (horizontal, vertical, diagonal)
- Draw/tie detection
- Turn-based system with visual indicators
- Game reset functionality
- Player disconnect handling

### 🎨 User Interface
- Modern, responsive design
- Smooth animations and transitions
- Visual feedback for moves and game states
- Toast notifications for errors and updates
- Mobile-friendly interface

### 🔧 Technical Features
- Real-time communication with Socket.IO
- Room-based game management
- Automatic room cleanup
- Player reconnection handling
- Input validation and error handling

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd multiplayer-tic-tac-toe
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Development Mode
For development with auto-restart:
```bash
npm run dev
```

## 🏗️ Project Structure

```
multiplayer-tic-tac-toe/
├── server.js              # Main server file with Socket.IO setup
├── src/
│   └── game-logic.js      # Game logic and room management (integrated in server.js)
├── public/
│   ├── index.html         # Main HTML file
│   ├── styles.css         # CSS styles and animations
│   └── game.js           # Client-side JavaScript
├── package.json          # Project dependencies and scripts
└── README.md            # Project documentation
```

## 🎯 How to Play

1. **Enter Your Name**: Start by entering your display name
2. **Choose Game Mode**:
   - **Create Room**: Generate a room ID to share with friends
   - **Join Room**: Enter a friend's room ID to join their game
   - **Random Match**: Get matched with a random online player
3. **Play**: Take turns placing X's and O's on the 3x3 grid
4. **Win**: Get three in a row (horizontal, vertical, or diagonal) to win!

## 🔧 Technical Implementation

### Backend (Node.js + Express + Socket.IO)
- **Room Management**: Dynamic room creation and player matching
- **Game State**: Server-side game state management and validation
- **Real-time Communication**: Socket.IO for instant updates
- **Player Management**: Handle connections, disconnections, and reconnections

### Frontend (HTML + CSS + JavaScript)
- **Responsive Design**: Mobile-first approach with CSS Grid and Flexbox
- **State Management**: Client-side game state synchronization
- **User Interface**: Modern design with smooth animations
- **Socket Integration**: Real-time communication with the server

### Key Components

#### GameRoom Class
- Manages individual game sessions
- Handles player moves and validation
- Implements win/draw detection logic
- Tracks game state and player information

#### Socket Events
- `setPlayerName`: Set player display name
- `createRoom`: Create a new game room
- `joinRoom`: Join existing room by ID
- `findRandomGame`: Random matchmaking
- `makeMove`: Make a move on the board
- `resetGame`: Start a new game in the same room

## 🌐 Deployment

The application can be deployed to various platforms:

### Heroku
1. Create a Heroku app
2. Set the PORT environment variable
3. Deploy using Git or GitHub integration

### Railway/Render
1. Connect your repository
2. Set build and start commands
3. Deploy automatically

### VPS/Cloud Server
1. Install Node.js on your server
2. Clone the repository
3. Install dependencies and start with PM2 or similar

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🎉 Acknowledgments

- Built with Node.js and Socket.IO
- Inspired by the classic Tic Tac Toe game
- Modern UI design principles
- Real-time multiplayer gaming concepts

---

**Enjoy playing Multiplayer Tic Tac Toe! 🎮**