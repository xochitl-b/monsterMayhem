document.addEventListener('DOMContentLoaded', function() {
    // Initialize variables
    const urlParams = new URLSearchParams(window.location.search);
    const playerIndex = parseInt(urlParams.get('index'), 10);

    const pieces = { "🧛": 3, "🐺": 3, "👻": 4 };
    let selectedPiece = null;
    let selectedCell = null;

    if (isNaN(playerIndex)) {
        // Initial setup page
        setupInitialPage();
    } else {
        // Player page
        setupPlayerPage(playerIndex);
    }

    function setupInitialPage() {
        document.getElementById('playerForm').addEventListener('submit', function(event) {
            event.preventDefault();
            const playerNames = [
                document.getElementById('player1').value,
                document.getElementById('player2').value,
                document.getElementById('player3').value,
                document.getElementById('player4').value
            ];

            // Json package that keeps the general information.
            const masterBoard = {
                board: Array.from({ length: 10 }, () => Array(10).fill(null)),
                currentTurn: 0,
                playerNames: playerNames,
                eliminatedPieces: [0, 0, 0, 0],
                activePlayers: [true, true, true, true], // Track active players
                wins: [0, 0, 0, 0] // Track wins for each player
            };
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
    }

    function setupPlayerPage(playerIndex) {
        let masterBoard = JSON.parse(localStorage.getItem('masterBoard'));
        if (!masterBoard) {
            alert("Please start a new game.");
            window.close();
            return;
        }

        const playerNames = masterBoard.playerNames;
        document.getElementById('playerName').textContent = playerNames[playerIndex];
        document.getElementById('currentPlayer').textContent = playerNames[masterBoard.currentTurn];

        const playerEdges = [
            (i, j) => i === 0,
            (i, j) => i === 9,
            (i, j) => j === 0,
            (i, j) => j === 9
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
                masterBoard = updatedMasterBoard;
                updateBoard(updatedMasterBoard.board);
                document.getElementById('currentPlayer').textContent = playerNames[masterBoard.currentTurn];
                updateEliminatedPieces();
                updateWinsDisplay(); // Update wins display
                checkForElimination();
            }
        });

        createBoard(masterBoard.board);
        updatePieces();
        updateEliminatedPieces();
        updateWinsDisplay();
        checkForElimination();

        function createBoard(boardData) {
            const board = document.getElementById('board');
            board.innerHTML = '';
            for (let i = 0; i < 10; i++) {
                for (let j = 0; j < 10; j++) {
                    const cell = document.createElement('button');
                    cell.className = 'cell';
                    if (boardData[i][j]) {
                        cell.textContent = `${boardData[i][j].player}-${boardData[i][j].type}`;
                    }
                    cell.addEventListener('click', function() {
                        handleCellClick(i, j);
                    });
                    board.appendChild(cell);
                }
            }
        }

        function handleCellClick(i, j) {
            if (masterBoard.currentTurn === playerIndex) {
                if (selectedPiece && !masterBoard.board[i][j] && isValidPlacement(i, j)) {
                    placePiece(i, j);
                } else if (!selectedPiece && masterBoard.board[i][j] && masterBoard.board[i][j].player === playerNames[playerIndex]) {
                    selectPiece(i, j);
                } else if (selectedCell) {
                    movePiece(i, j);
                }
            }
        }

        function placePiece(i, j) {
            // Place the piece and mark it as first placement
            masterBoard.board[i][j] = { player: playerNames[playerIndex], type: selectedPiece, firstPlacement: true };
            pieces[selectedPiece]--;
            selectedPiece = null;
            updatePieces();
            updateMasterBoard();
        }

        function selectPiece(i, j) {
            if (!masterBoard.board[i][j].firstPlacement) {
                selectedCell = { i, j, type: masterBoard.board[i][j].type };
            }
        }

        function movePiece(i, j) {
            const dx = Math.abs(selectedCell.i - i);
            const dy = Math.abs(selectedCell.j - j);
            if ((dx === 0 || dy === 0) || (dx === 2 && dy === 2)) {
                if (!masterBoard.board[i][j] || canMoveOver(masterBoard.board[i][j])) {
                    if (masterBoard.board[i][j]) {
                        resolveConflict(selectedCell, { i, j, type: masterBoard.board[i][j].type });
                    } else {
                        masterBoard.board[selectedCell.i][selectedCell.j] = null;
                        masterBoard.board[i][j] = { player: playerNames[playerIndex], type: selectedCell.type };
                    }
                    selectedCell = null;
                    updateMasterBoard();
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

            if ((sourcePiece === "🧛" && targetPiece === "🐺") ||
                (sourcePiece === "🐺" && targetPiece === "👻") ||
                (sourcePiece === "👻" && targetPiece === "🧛")) {
                masterBoard.board[targetCell.i][targetCell.j] = { player: playerNames[playerIndex], type: sourcePiece, firstPlacement: false };
                masterBoard.board[sourceCell.i][sourceCell.j] = null;
                masterBoard.eliminatedPieces[targetPlayerIndex]++;
            } else {
                masterBoard.board[sourceCell.i][sourceCell.j] = null;
                masterBoard.eliminatedPieces[playerIndex]++;
            }

            updateEliminatedPieces();
            updateMasterBoard();
            checkForElimination();
        }

        function updateBoard(boardData) {
            const cells = document.querySelectorAll('.cell');
            cells.forEach((cell, index) => {
                const i = Math.floor(index / 10);
                const j = index % 10;
                cell.textContent = boardData[i][j] ? `${boardData[i][j].player}-${boardData[i][j].type}` : '';
            });
        }

        function updateMasterBoard() {
            localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
            updateBoard(masterBoard.board);
        }

        function updateEliminatedPieces() {
            if (Array.isArray(masterBoard.eliminatedPieces) && typeof playerIndex === 'number' && playerIndex >= 0 && playerIndex < masterBoard.eliminatedPieces.length) {
                document.getElementById('eliminatedPieces').textContent = `Eliminated Pieces: ${masterBoard.eliminatedPieces[playerIndex]}`;
            } else {
                console.error('Invalid eliminatedPieces data or playerIndex:', masterBoard.eliminatedPieces, playerIndex);
            }
        }

        function updateWinsDisplay() {
            if (Array.isArray(masterBoard.wins) && typeof playerIndex === 'number' && playerIndex >= 0 && playerIndex < masterBoard.wins.length) {
                document.getElementById('winCount').textContent = `Wins: ${masterBoard.wins[playerIndex]}`;
            } else {
                console.error('Invalid wins data or playerIndex:', masterBoard.wins, playerIndex);
            }
        }

        //count players pieces
        function countPlayerPieces(playerIndex) {
            let count = 0;
            for (let row of masterBoard.board) {
                for (let cell of row) {
                    if (cell && cell.player === masterBoard.playerNames[playerIndex]) {
                        count++;
                    }
                }
            }
            return count;
        }        
        
        //choose next player based on who has the least amount of pieces
        function determineNextPlayer() {
            const activePlayers = masterBoard.activePlayers;
            const pieceCounts = masterBoard.playerNames.map((_, index) => countPlayerPieces(index));
            const minPieces = Math.min(...pieceCounts.filter((_, index) => activePlayers[index])); // Only consider active players
            const candidates = pieceCounts.map((count, index) => activePlayers[index] && count === minPieces ? index : null).filter(index => index !== null);

            return candidates[Math.floor(Math.random() * candidates.length)];
        }


        //checks if a player has no pieces on the board an no pieces to be selected
        function checkForElimination() {
            const activePlayers = masterBoard.playerNames.map((_, index) => {
                const onBoardCount = countPlayerPieces(index);
                const remainingPiecesCount = pieces["🧛"] + pieces["🐺"] + pieces["👻"];
                return onBoardCount > 0 || remainingPiecesCount > 0;
            });
            masterBoard.activePlayers = activePlayers;

            const activeCount = activePlayers.filter(active => active).length;

            if (!activePlayers[playerIndex] && activeCount > 0) {
                alert('You are out of monsters :(');
            } else if (activeCount === 1) {
                const winnerIndex = activePlayers.findIndex(active => active);
                if (winnerIndex === playerIndex) {
                    alert('You have won!');
                    masterBoard.wins[winnerIndex]++;
                    localStorage.setItem('masterBoard', JSON.stringify(masterBoard)); // Update wins count
                }
            }
        }

        document.getElementById('endTurnButton').addEventListener('click', function() {
            if (masterBoard.currentTurn === playerIndex) {
                masterBoard.currentTurn = determineNextPlayer();
                // Mark all pieces placed in this turn as no longer first placement
                masterBoard.board.forEach(row => {
                    row.forEach(cell => {
                        if (cell && cell.player === masterBoard.playerNames[playerIndex] && cell.firstPlacement) {
                            cell.firstPlacement = false;
                        }
                    });
                });
                localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
                document.getElementById('currentPlayer').textContent = playerNames[masterBoard.currentTurn];
                checkForElimination();
            }
        });
    }
});
