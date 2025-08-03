class MultiplayerTicTacToe {
    constructor() {
        this.socket = io();
        this.currentRoom = null;
        this.playerName = '';
        this.gameState = null;
        this.mySymbol = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    initializeElements() {
        // Screens
        this.nameScreen = document.getElementById('nameScreen');
        this.menuScreen = document.getElementById('menuScreen');
        this.joinScreen = document.getElementById('joinScreen');
        this.waitingScreen = document.getElementById('waitingScreen');
        this.gameScreen = document.getElementById('gameScreen');
        
        // Name setup
        this.playerNameInput = document.getElementById('playerName');
        this.setNameBtn = document.getElementById('setNameBtn');
        this.displayName = document.getElementById('displayName');
        
        // Menu buttons
        this.createRoomBtn = document.getElementById('createRoomBtn');
        this.joinRoomBtn = document.getElementById('joinRoomBtn');
        this.randomGameBtn = document.getElementById('randomGameBtn');
        
        // Join room
        this.roomIdInput = document.getElementById('roomIdInput');
        this.joinBtn = document.getElementById('joinBtn');
        this.backToMenuBtn = document.getElementById('backToMenuBtn');
        
        // Waiting screen
        this.waitingRoomId = document.getElementById('waitingRoomId');
        this.cancelWaitBtn = document.getElementById('cancelWaitBtn');
        
        // Game elements
        this.gameBoard = document.getElementById('gameBoard');
        this.cells = document.querySelectorAll('.cell');
        this.currentTurn = document.getElementById('currentTurn');
        this.gameRoomId = document.getElementById('gameRoomId');
        this.player1 = document.getElementById('player1');
        this.player2 = document.getElementById('player2');
        this.resetBtn = document.getElementById('resetBtn');
        this.leaveGameBtn = document.getElementById('leaveGameBtn');
        
        // Toast
        this.toast = document.getElementById('toast');
    }

    setupEventListeners() {
        // Name setup
        this.setNameBtn.addEventListener('click', () => this.setPlayerName());
        this.playerNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.setPlayerName();
        });

        // Menu actions
        this.createRoomBtn.addEventListener('click', () => this.createRoom());
        this.joinRoomBtn.addEventListener('click', () => this.showJoinScreen());
        this.randomGameBtn.addEventListener('click', () => this.findRandomGame());

        // Join room
        this.joinBtn.addEventListener('click', () => this.joinRoom());
        this.roomIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinRoom();
        });
        this.backToMenuBtn.addEventListener('click', () => this.showMenuScreen());

        // Waiting screen
        this.cancelWaitBtn.addEventListener('click', () => this.cancelWaiting());

        // Game controls
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.leaveGameBtn.addEventListener('click', () => this.leaveGame());

        // Game board
        this.cells.forEach((cell, index) => {
            cell.addEventListener('click', () => this.makeMove(index));
        });
    }

    setupSocketListeners() {
        this.socket.on('nameSet', () => {
            this.showMenuScreen();
        });

        this.socket.on('roomCreated', (data) => {
            this.currentRoom = data.roomId;
            this.gameState = data.gameState;
            this.mySymbol = 'X'; // Room creator is always X
            this.waitingRoomId.textContent = data.roomId;
            this.showWaitingScreen();
        });

        this.socket.on('playerJoined', (data) => {
            this.gameState = data.gameState;
            this.updateGameDisplay();
        });

        this.socket.on('gameStarted', (data) => {
            this.gameState = data.gameState;
            this.determineMySymbol();
            this.showGameScreen();
            this.updateGameDisplay();
        });

        this.socket.on('waitingForOpponent', (data) => {
            this.currentRoom = data.roomId;
            this.gameState = data.gameState;
            this.mySymbol = 'X';
            this.waitingRoomId.textContent = data.roomId;
            this.showWaitingScreen();
        });

        this.socket.on('moveMade', (data) => {
            this.gameState = data.gameState;
            this.updateGameDisplay();
        });

        this.socket.on('gameReset', (data) => {
            this.gameState = data.gameState;
            this.updateGameDisplay();
        });

        this.socket.on('playerDisconnected', () => {
            this.showToast('Opponent disconnected', 'info');
            this.showMenuScreen();
        });

        this.socket.on('error', (data) => {
            this.showToast(data.message, 'error');
        });
    }

    setPlayerName() {
        const name = this.playerNameInput.value.trim();
        if (!name) {
            this.showToast('Please enter your name', 'error');
            return;
        }
        
        this.playerName = name;
        this.displayName.textContent = name;
        this.socket.emit('setPlayerName', name);
    }

    createRoom() {
        this.socket.emit('createRoom');
    }

    showJoinScreen() {
        this.showScreen('joinScreen');
    }

    joinRoom() {
        const roomId = this.roomIdInput.value.trim().toUpperCase();
        if (!roomId) {
            this.showToast('Please enter a room ID', 'error');
            return;
        }
        
        this.socket.emit('joinRoom', roomId);
    }

    findRandomGame() {
        this.socket.emit('findRandomGame');
    }

    cancelWaiting() {
        this.socket.disconnect();
        this.socket.connect();
        this.socket.emit('setPlayerName', this.playerName);
        this.showMenuScreen();
    }

    makeMove(position) {
        if (!this.gameState || this.gameState.gameStatus !== 'playing') return;
        if (this.gameState.board[position] !== null) return;
        if (this.gameState.currentPlayer !== this.mySymbol) return;

        this.socket.emit('makeMove', { position });
    }

    resetGame() {
        this.socket.emit('resetGame');
    }

    leaveGame() {
        this.socket.disconnect();
        this.socket.connect();
        this.socket.emit('setPlayerName', this.playerName);
        this.showMenuScreen();
    }

    determineMySymbol() {
        if (!this.gameState || !this.gameState.players) return;
        
        const myIndex = this.gameState.players.findIndex(p => p.id === this.socket.id);
        this.mySymbol = myIndex === 0 ? 'X' : 'O';
    }

    updateGameDisplay() {
        if (!this.gameState) return;

        // Update room ID
        this.gameRoomId.textContent = this.currentRoom;

        // Update players
        if (this.gameState.players.length >= 1) {
            this.player1.querySelector('.player-name').textContent = this.gameState.players[0].name;
        }
        if (this.gameState.players.length >= 2) {
            this.player2.querySelector('.player-name').textContent = this.gameState.players[1].name;
        }

        // Update current turn indicator
        this.player1.classList.toggle('active', this.gameState.currentPlayer === 'X');
        this.player2.classList.toggle('active', this.gameState.currentPlayer === 'O');

        // Update game status
        if (this.gameState.gameStatus === 'playing') {
            const isMyTurn = this.gameState.currentPlayer === this.mySymbol;
            this.currentTurn.textContent = isMyTurn ? 
                "Your turn!" : 
                `${this.gameState.currentPlayer}'s turn`;
        } else if (this.gameState.gameStatus === 'finished') {
            if (this.gameState.winner === 'draw') {
                this.currentTurn.textContent = "It's a draw!";
            } else {
                const isWinner = this.gameState.winner === this.mySymbol;
                this.currentTurn.textContent = isWinner ? "You won! 🎉" : "You lost 😢";
            }
        }

        // Update board
        this.cells.forEach((cell, index) => {
            const value = this.gameState.board[index];
            cell.textContent = value || '';
            cell.className = 'cell';
            
            if (value) {
                cell.classList.add(value.toLowerCase());
            }
            
            // Disable cells if game is over or not player's turn
            const canPlay = this.gameState.gameStatus === 'playing' && 
                           this.gameState.currentPlayer === this.mySymbol && 
                           !value;
            
            if (!canPlay) {
                cell.classList.add('disabled');
            }
        });

        // Highlight winning combination
        if (this.gameState.gameStatus === 'finished' && this.gameState.winner !== 'draw') {
            this.highlightWinningCells();
        }
    }

    highlightWinningCells() {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];

        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;
            if (this.gameState.board[a] && 
                this.gameState.board[a] === this.gameState.board[b] && 
                this.gameState.board[a] === this.gameState.board[c]) {
                
                pattern.forEach(index => {
                    this.cells[index].classList.add('winning');
                });
                break;
            }
        }
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    showMenuScreen() {
        this.currentRoom = null;
        this.gameState = null;
        this.mySymbol = null;
        this.showScreen('menuScreen');
    }

    showWaitingScreen() {
        this.showScreen('waitingScreen');
    }

    showGameScreen() {
        this.showScreen('gameScreen');
    }

    showToast(message, type = 'info') {
        this.toast.textContent = message;
        this.toast.className = `toast ${type} show`;
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 3000);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MultiplayerTicTacToe();
});