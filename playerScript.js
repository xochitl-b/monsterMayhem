document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerIndex = parseInt(urlParams.get('index'), 10);

    const masterBoard = JSON.parse(localStorage.getItem('masterBoard'));
    const playerNames = masterBoard.playerNames;
    document.getElementById('playerName').textContent = playerNames[playerIndex];

    let currentPlayerIndex = masterBoard.currentTurn;
    document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];

    const pieces = {
        "a": 3,
        "b": 3,
        "c": 3
    };

    let selectedPiece = null;

    // Show pieces to player
    function updatePieces() {
        const piecesContainer = document.getElementById('piecesContainer');
        piecesContainer.innerHTML = '<h3>Your Monsters:</h3>';
        for (let type in pieces) {
            for (let i = 0; i < pieces[type]; i++) {
                const button = document.createElement('button');
                button.textContent = type;
                button.className = 'piece-button';
                button.addEventListener('click', function() {
                    selectedPiece = type; // After they click the piece button it gets selected
                });
                piecesContainer.appendChild(button);
            }
        }
    }

    window.addEventListener('storage', function(event) {
        if (event.key === 'masterBoard') {
            const updatedMasterBoard = JSON.parse(event.newValue);
            updateBoard(updatedMasterBoard.board);
            currentPlayerIndex = updatedMasterBoard.currentTurn;
            document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];
        }
    });

    createBoard(masterBoard.board);
    updatePieces();

    // Create local Board and listen for changes
    function createBoard(boardData) {
        const board = document.getElementById('board');
        board.innerHTML = ''; // Clear existing cells
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                if (boardData[i][j]) {
                    cell.textContent = `${boardData[i][j].player}-${boardData[i][j].type}`;
                }
                // After player selects a piece, it clicks on the board and piece is placed on the board
                cell.addEventListener('click', function() {
                    if (currentPlayerIndex === playerIndex) {
                        if (!boardData[i][j] && selectedPiece) {
                            boardData[i][j] = { player: playerNames[playerIndex], type: selectedPiece }; // Example piece
                            pieces[selectedPiece]--;
                            selectedPiece = null;
                            updatePieces();
                            updateMasterBoard(boardData);
                        }
                    }
                });
                board.appendChild(cell);
            }
        }
    }

    // Update
    function updateBoard(boardData) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const i = Math.floor(index / 10);
            const j = index % 10;
            cell.textContent = boardData[i][j] ? `${boardData[i][j].player}-${boardData[i][j].type}` : '';
        });
    }

    // Updates master board in localStorage 
    function updateMasterBoard(boardData) {
        const updatedMasterBoard = {
            board: boardData,
            currentTurn: currentPlayerIndex,
            playerNames: playerNames
        };
        localStorage.setItem('masterBoard', JSON.stringify(updatedMasterBoard));
    }

    // Checks if it is the current player's turn, increments the turn, and updates the master board.
    document.getElementById('endTurnButton').addEventListener('click', function() {
        if (currentPlayerIndex === playerIndex) {
            currentPlayerIndex = (currentPlayerIndex + 1) % 4;
            const masterBoard = JSON.parse(localStorage.getItem('masterBoard'));
            masterBoard.currentTurn = currentPlayerIndex;
            localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
        }
    });
});