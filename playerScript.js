document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerIndex = parseInt(urlParams.get('index'), 10);

    const masterBoard = JSON.parse(localStorage.getItem('masterBoard'));
    const playerNames = masterBoard.playerNames;
    document.getElementById('playerName').textContent = playerNames[playerIndex];

    let currentPlayerIndex = masterBoard.currentTurn;
    document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];

    window.addEventListener('storage', function(event) {
        if (event.key === 'masterBoard') {
            const updatedMasterBoard = JSON.parse(event.newValue);
            updateBoard(updatedMasterBoard.board);
            currentPlayerIndex = updatedMasterBoard.currentTurn;
            document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];
        }
    });

    createBoard(masterBoard.board);

    //create local Board and listen for changes
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
                cell.addEventListener('click', function() {
                    if (currentPlayerIndex === playerIndex) {
                        if (!boardData[i][j]) {
                            boardData[i][j] = { player: playerNames[playerIndex], type: 'Piece' }; // Example piece
                            updateMasterBoard(boardData);
                        }
                    }
                });
                board.appendChild(cell);
            }
        }
    }

    //update
    function updateBoard(boardData) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const i = Math.floor(index / 10);
            const j = index % 10;
            cell.textContent = boardData[i][j] ? `${boardData[i][j].player}-${boardData[i][j].type}` : '';
        });
    }

    //updates master board in localStorage 
    function updateMasterBoard(boardData) {
        const updatedMasterBoard = {
            board: boardData,
            currentTurn: currentPlayerIndex,
            playerNames: playerNames
        };
        localStorage.setItem('masterBoard', JSON.stringify(updatedMasterBoard));
    }

    // checks if it is the current player's turn, increments the turn, and updates the master board.
    document.getElementById('endTurnButton').addEventListener('click', function() {
        if (currentPlayerIndex === playerIndex) {
            currentPlayerIndex = (currentPlayerIndex + 1) % 4;
            const masterBoard = JSON.parse(localStorage.getItem('masterBoard'));
            masterBoard.currentTurn = currentPlayerIndex;
            localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
        }
    });
});