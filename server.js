const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.static('public'));
app.use(express.json());

// Game state management
const rooms = new Map();
const waitingPlayers = [];

class GameRoom {
  constructor(id, creator) {
    this.id = id;
    this.players = [creator];
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameStatus = 'waiting'; // waiting, playing, finished
    this.winner = null;
    this.createdAt = new Date();
  }

  addPlayer(player) {
    if (this.players.length < 2) {
      this.players.push(player);
      if (this.players.length === 2) {
        this.gameStatus = 'playing';
      }
      return true;
    }
    return false;
  }

  makeMove(playerId, position) {
    if (this.gameStatus !== 'playing') return false;
    if (this.board[position] !== null) return false;
    
    const playerIndex = this.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;
    
    const expectedSymbol = playerIndex === 0 ? 'X' : 'O';
    if (this.currentPlayer !== expectedSymbol) return false;

    this.board[position] = this.currentPlayer;
    
    // Check for winner
    if (this.checkWinner()) {
      this.winner = this.currentPlayer;
      this.gameStatus = 'finished';
    } else if (this.board.every(cell => cell !== null)) {
      this.gameStatus = 'finished';
      this.winner = 'draw';
    } else {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
    }
    
    return true;
  }

  checkWinner() {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];

    return winPatterns.some(pattern => {
      const [a, b, c] = pattern;
      return this.board[a] && 
             this.board[a] === this.board[b] && 
             this.board[a] === this.board[c];
    });
  }

  reset() {
    this.board = Array(9).fill(null);
    this.currentPlayer = 'X';
    this.gameStatus = 'playing';
    this.winner = null;
  }

  getGameState() {
    return {
      id: this.id,
      board: this.board,
      currentPlayer: this.currentPlayer,
      gameStatus: this.gameStatus,
      winner: this.winner,
      players: this.players.map(p => ({ id: p.id, name: p.name }))
    };
  }
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('setPlayerName', (name) => {
    socket.playerName = name;
    socket.emit('nameSet', { success: true });
  });

  socket.on('createRoom', () => {
    if (!socket.playerName) {
      socket.emit('error', { message: 'Please set your name first' });
      return;
    }

    const roomId = uuidv4().substring(0, 8).toUpperCase();
    const player = { id: socket.id, name: socket.playerName };
    const room = new GameRoom(roomId, player);
    
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.currentRoom = roomId;
    
    socket.emit('roomCreated', { 
      roomId: roomId,
      gameState: room.getGameState()
    });
  });

  socket.on('joinRoom', (roomId) => {
    if (!socket.playerName) {
      socket.emit('error', { message: 'Please set your name first' });
      return;
    }

    const room = rooms.get(roomId);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= 2) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    const player = { id: socket.id, name: socket.playerName };
    room.addPlayer(player);
    
    socket.join(roomId);
    socket.currentRoom = roomId;
    
    io.to(roomId).emit('playerJoined', {
      gameState: room.getGameState()
    });

    if (room.gameStatus === 'playing') {
      io.to(roomId).emit('gameStarted', {
        gameState: room.getGameState()
      });
    }
  });

  socket.on('findRandomGame', () => {
    if (!socket.playerName) {
      socket.emit('error', { message: 'Please set your name first' });
      return;
    }

    // Check if there's a waiting player
    if (waitingPlayers.length > 0) {
      const waitingPlayer = waitingPlayers.shift();
      const room = rooms.get(waitingPlayer.roomId);
      
      if (room && room.players.length === 1) {
        const player = { id: socket.id, name: socket.playerName };
        room.addPlayer(player);
        
        socket.join(waitingPlayer.roomId);
        socket.currentRoom = waitingPlayer.roomId;
        
        io.to(waitingPlayer.roomId).emit('gameStarted', {
          gameState: room.getGameState()
        });
        return;
      }
    }

    // Create new room and wait for opponent
    const roomId = uuidv4().substring(0, 8).toUpperCase();
    const player = { id: socket.id, name: socket.playerName };
    const room = new GameRoom(roomId, player);
    
    rooms.set(roomId, room);
    socket.join(roomId);
    socket.currentRoom = roomId;
    
    waitingPlayers.push({ socketId: socket.id, roomId: roomId });
    
    socket.emit('waitingForOpponent', { 
      roomId: roomId,
      gameState: room.getGameState()
    });
  });

  socket.on('makeMove', (data) => {
    const { position } = data;
    const room = rooms.get(socket.currentRoom);
    
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.makeMove(socket.id, position)) {
      io.to(socket.currentRoom).emit('moveMade', {
        gameState: room.getGameState()
      });
    } else {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  socket.on('resetGame', () => {
    const room = rooms.get(socket.currentRoom);
    if (!room) return;

    room.reset();
    io.to(socket.currentRoom).emit('gameReset', {
      gameState: room.getGameState()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove from waiting players
    const waitingIndex = waitingPlayers.findIndex(p => p.socketId === socket.id);
    if (waitingIndex !== -1) {
      waitingPlayers.splice(waitingIndex, 1);
    }

    // Handle room cleanup
    if (socket.currentRoom) {
      const room = rooms.get(socket.currentRoom);
      if (room) {
        socket.to(socket.currentRoom).emit('playerDisconnected');
        
        // Remove room if empty or mark as abandoned
        room.players = room.players.filter(p => p.id !== socket.id);
        if (room.players.length === 0) {
          rooms.delete(socket.currentRoom);
        }
      }
    }
  });
});

// Clean up old rooms periodically
setInterval(() => {
  const now = new Date();
  for (const [roomId, room] of rooms.entries()) {
    const timeDiff = now - room.createdAt;
    if (timeDiff > 30 * 60 * 1000) { // 30 minutes
      rooms.delete(roomId);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});