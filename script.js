document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const playerIndex = parseInt(urlParams.get('index'), 10);

    let masterBoard = JSON.parse(localStorage.getItem('masterBoard')) || {
        board: Array.from({ length: 10 }, () => Array(10).fill(null)),
        currentTurn: 0,
        playerNames: [],
        eliminatedPieces: [0, 0, 0, 0] // Track eliminated pieces for each player
    };

    if (isNaN(playerIndex)) {
        // This is the initial setup page
        document.getElementById('playerForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const player1 = document.getElementById('player1').value;
            const player2 = document.getElementById('player2').value;
            const player3 = document.getElementById('player3').value;
            const player4 = document.getElementById('player4').value;

            const playerNames = [player1, player2, player3, player4];
            masterBoard.playerNames = playerNames;
            localStorage.setItem('masterBoard', JSON.stringify(masterBoard));

            // Open new windows for each player
            for (let i = 0; i < 4; i++) {
                window.open('player.html?index=' + i, '_blank', 'width=600,height=600');
            }
        });

        document.getElementById('restartButton').addEventListener('click', function() {
            localStorage.removeItem('masterBoard');
            location.reload();
        });

    } else {
        // This is the player page
        const playerNames = masterBoard.playerNames;
        document.getElementById('playerName').textContent = playerNames[playerIndex];

        let currentPlayerIndex = masterBoard.currentTurn;
        document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];

        const pieces = {
            "a": 3,
            "b": 3,
            "c": 4 // Updated to 4 pieces of "c"
        };

        let selectedPiece = null;
        let selectedCell = null;

        const playerEdges = [
            (i, j) => i === 0,      // Player 1: Top
            (i, j) => i === 9,      // Player 2: Bottom
            (i, j) => j === 0,      // Player 3: Left
            (i, j) => j === 9       // Player 4: Right
        ];

        function isValidPlacement(i, j) {
            return playerEdges[playerIndex](i, j);
        }

        function updatePieces() {
            const piecesContainer = document.getElementById('piecesContainer');
            piecesContainer.innerHTML = '<h3>Your Monsters:</h3>';
            for (let type in pieces) {
                for (let i = 0; i < pieces[type]; i++) {
                    const button = document.createElement('button');
                    button.textContent = type;
                    button.className = 'piece-button';
                    button.addEventListener('click', function() {
                        selectedPiece = type;
                    });
                    piecesContainer.appendChild(button);
                }
            }
        }

        window.addEventListener('storage', function(event) {
            if (event.key === 'masterBoard') {
                const updatedMasterBoard = JSON.parse(event.newValue);
                masterBoard = updatedMasterBoard; // Update the local masterBoard variable
                updateBoard(updatedMasterBoard.board);
                currentPlayerIndex = updatedMasterBoard.currentTurn;
                updateCurrentPlayerIndicator();
                updateEliminatedPieces(); // Update the eliminated pieces count
            }
        });

        createBoard(masterBoard.board);
        updatePieces();
        updateEliminatedPieces(); // Initialize eliminated pieces count

        function createBoard(boardData) {
            const board = document.getElementById('board');
            board.innerHTML = ''; // Clear existing cells
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    const cell = document.createElement('button'); // Changed to button
                    cell.className = 'cell';
                    if (boardData[i][j]) {
                        cell.textContent = `${boardData[i][j].player}-${boardData[i][j].type}`;
                    }
                    cell.addEventListener('click', function() {
                        if (currentPlayerIndex === playerIndex) {
                            if (selectedPiece && !boardData[i][j] && isValidPlacement(i, j)) {
                                boardData[i][j] = { player: playerNames[playerIndex], type: selectedPiece };
                                pieces[selectedPiece]--;
                                selectedPiece = null;
                                updatePieces();
                                updateMasterBoard(boardData);
                                updateBoard(boardData); // Update the local board immediately
                            } else if (!selectedPiece && boardData[i][j] && boardData[i][j].player === playerNames[playerIndex]) {
                                selectedCell = { i, j, type: boardData[i][j].type };
                            } else if (selectedCell) {
                                const dx = Math.abs(selectedCell.i - i);
                                const dy = Math.abs(selectedCell.j - j);
                                if ((dx === 0 || dy === 0) || (dx === 2 && dy === 2)) {
                                    if (!boardData[i][j] || canMoveOver(boardData[i][j])) {
                                        if (boardData[i][j]) {
                                            resolveConflict(selectedCell, { i, j, type: boardData[i][j].type });
                                        } else {
                                            boardData[selectedCell.i][selectedCell.j] = null;
                                            boardData[i][j] = { player: playerNames[playerIndex], type: selectedCell.type };
                                        }
                                        selectedCell = null;
                                        updateMasterBoard(boardData);
                                        updateBoard(boardData);
                                    }
                                }
                            }
                        }
                    });
                    board.appendChild(cell);
                }
            }
        }

        function canMoveOver(targetCell) {
            return targetCell.player === playerNames[playerIndex];
        }

        function resolveConflict(sourceCell, targetCell) {
            const sourcePiece = sourceCell.type;
            const targetPiece = targetCell.type;
            const targetPlayerIndex = playerNames.indexOf(masterBoard.board[targetCell.i][targetCell.j].player);

            if ((sourcePiece === "a" && targetPiece === "b") ||
                (sourcePiece === "b" && targetPiece === "c") ||
                (sourcePiece === "c" && targetPiece === "a")) {
                masterBoard.board[targetCell.i][targetCell.j] = { player: playerNames[playerIndex], type: sourcePiece };
                masterBoard.board[sourceCell.i][sourceCell.j] = null;
                masterBoard.eliminatedPieces[targetPlayerIndex]++;
            } else {
                masterBoard.board[sourceCell.i][sourceCell.j] = null;
                masterBoard.eliminatedPieces[playerIndex]++;
            }

            updateEliminatedPieces();
            updateMasterBoard(masterBoard.board);
            updateBoard(masterBoard.board);
        }

        function updateBoard(boardData) {
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell, index) => {
                const i = Math.floor(index / 10);
                const j = index % 10;
                cell.textContent = boardData[i][j] ? `${boardData[i][j].player}-${boardData[i][j].type}` : '';
            });
        }

        function updateMasterBoard(boardData) {
            masterBoard.board = boardData;
            localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
        }

        function updateCurrentPlayerIndicator() {
            document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];
        }

        function updateEliminatedPieces() {
            if (Array.isArray(masterBoard.eliminatedPieces) && typeof playerIndex === 'number' && playerIndex >= 0 && playerIndex < masterBoard.eliminatedPieces.length) {
                document.getElementById('eliminatedPieces').textContent = `Eliminated Pieces: ${masterBoard.eliminatedPieces[playerIndex]}`;
            } else {
                console.error('Invalid eliminatedPieces data or playerIndex:', masterBoard.eliminatedPieces, playerIndex);
            }
        }

        document.getElementById('endTurnButton').addEventListener('click', function() {
            if (currentPlayerIndex === playerIndex) {
                currentPlayerIndex = (currentPlayerIndex + 1) % 4;
                masterBoard.currentTurn = currentPlayerIndex;
                localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
                updateCurrentPlayerIndicator(); // Update the local turn indicator immediately
            }
        });
    }
});
