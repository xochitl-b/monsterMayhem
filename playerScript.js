// document.addEventListener('DOMContentLoaded', function() {
//     const urlParams = new URLSearchParams(window.location.search);
//     const playerIndex = parseInt(urlParams.get('index'), 10);

//     if (isNaN(playerIndex) || playerIndex < 0 || playerIndex >= 4) {
//         console.error('Invalid player index:', playerIndex);
//         return; // Exit if playerIndex is not valid
//     }

//     let masterBoard = JSON.parse(localStorage.getItem('masterBoard')) || {
//         board: Array.from({ length: 10 }, () => Array(10).fill(null)),
//         currentTurn: 0,
//         playerNames: ["Player 1", "Player 2", "Player 3", "Player 4"],
//         eliminatedPieces: [0, 0, 0, 0] // Track eliminated pieces for each player
//     };

//     const playerNames = masterBoard.playerNames;
//     document.getElementById('playerName').textContent = playerNames[playerIndex];

//     let currentPlayerIndex = masterBoard.currentTurn;
//     document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];

//     const pieces = {
//         "a": 3,
//         "b": 3,
//         "c": 4 // Updated to 4 pieces of "c"
//     };

//     let selectedPiece = null;
//     let selectedCell = null;

//     // Player edge mapping
//     const playerEdges = [
//         (i, j) => i === 0,      // Player 1: Top
//         (i, j) => i === 9,      // Player 2: Bottom
//         (i, j) => j === 0,      // Player 3: Left
//         (i, j) => j === 9       // Player 4: Right
//     ];

//     function isValidPlacement(i, j) {
//         return playerEdges[playerIndex](i, j);
//     }

//     // Show pieces to player
//     function updatePieces() {
//         const piecesContainer = document.getElementById('piecesContainer');
//         piecesContainer.innerHTML = '<h3>Your Monsters:</h3>';
//         for (let type in pieces) {
//             for (let i = 0; i < pieces[type]; i++) {
//                 const button = document.createElement('button');
//                 button.textContent = type;
//                 button.className = 'piece-button';
//                 button.addEventListener('click', function() {
//                     selectedPiece = type; // After they click the piece button it gets selected
//                 });
//                 piecesContainer.appendChild(button);
//             }
//         }
//     }

//     window.addEventListener('storage', function(event) {
//         if (event.key === 'masterBoard') {
//             const updatedMasterBoard = JSON.parse(event.newValue);
//             masterBoard = updatedMasterBoard; // Update the local masterBoard variable
//             updateBoard(updatedMasterBoard.board);
//             currentPlayerIndex = updatedMasterBoard.currentTurn;
//             updateCurrentPlayerIndicator();
//             updateEliminatedPieces(); // Update the eliminated pieces count
//         }
//     });

//     createBoard(masterBoard.board);
//     updatePieces();
//     updateEliminatedPieces(); // Initialize eliminated pieces count

//     // Create local Board and listen for changes
//     function createBoard(boardData) {
//         const board = document.getElementById('board');
//         board.innerHTML = ''; // Clear existing cells
//         for (let i = 0; i < 10; i++) {
//             for (let j = 0; j < 10; j++) {
//                 const cell = document.createElement('button'); // Changed to button
//                 cell.className = 'cell';
//                 if (boardData[i][j]) {
//                     cell.textContent = `${boardData[i][j].player}-${boardData[i][j].type}`;
//                 }
//                 // After player selects a piece, it clicks on the board and piece is placed on the board
//                 cell.addEventListener('click', function() {
//                     if (currentPlayerIndex === playerIndex) {
//                         if (selectedPiece && !boardData[i][j] && isValidPlacement(i, j)) {
//                             boardData[i][j] = { player: playerNames[playerIndex], type: selectedPiece };
//                             pieces[selectedPiece]--;
//                             selectedPiece = null;
//                             updatePieces();
//                             updateMasterBoard(boardData);
//                             updateBoard(boardData); // Update the local board immediately
//                         } else if (!selectedPiece && boardData[i][j] && boardData[i][j].player === playerNames[playerIndex]) {
//                             selectedCell = { i, j, type: boardData[i][j].type };
//                         } else if (selectedCell) {
//                             const dx = Math.abs(selectedCell.i - i);
//                             const dy = Math.abs(selectedCell.j - j);
//                             if ((dx === 0 || dy === 0) || (dx === 2 && dy === 2)) {
//                                 if (!boardData[i][j] || canMoveOver(boardData[i][j])) {
//                                     if (boardData[i][j]) {
//                                         resolveConflict(selectedCell, { i, j, type: boardData[i][j].type });
//                                     } else {
//                                         boardData[selectedCell.i][selectedCell.j] = null;
//                                         boardData[i][j] = { player: playerNames[playerIndex], type: selectedCell.type };
//                                     }
//                                     selectedCell = null;
//                                     updateMasterBoard(boardData);
//                                     updateBoard(boardData);
//                                 }
//                             }
//                         }
//                     }
//                 });
//                 board.appendChild(cell);
//             }
//         }
//     }

//     // Determine if a piece can move over another piece
//     function canMoveOver(targetCell) {
//         return targetCell.player === playerNames[playerIndex];
//     }

//     // Resolve conflict when moving over another player's piece
//     function resolveConflict(sourceCell, targetCell) {
//         const sourcePiece = sourceCell.type;
//         const targetPiece = targetCell.type;
//         const targetPlayerIndex = playerNames.indexOf(masterBoard.board[targetCell.i][targetCell.j].player);

//         if ((sourcePiece === "a" && targetPiece === "b") ||
//             (sourcePiece === "b" && targetPiece === "c") ||
//             (sourcePiece === "c" && targetPiece === "a")) {
//             masterBoard.board[targetCell.i][targetCell.j] = { player: playerNames[playerIndex], type: sourcePiece };
//             masterBoard.board[sourceCell.i][sourceCell.j] = null;
//             masterBoard.eliminatedPieces[targetPlayerIndex]++;
//         } else {
//             masterBoard.board[sourceCell.i][sourceCell.j] = null;
//             masterBoard.eliminatedPieces[playerIndex]++;
//         }

//         updateEliminatedPieces();
//         updateMasterBoard(masterBoard.board);
//         updateBoard(masterBoard.board);
//     }

//     // Update the board UI
//     function updateBoard(boardData) {
//         const cells = document.querySelectorAll('.cell');
//         cells.forEach((cell, index) => {
//             const i = Math.floor(index / 10);
//             const j = index % 10;
//             cell.textContent = boardData[i][j] ? `${boardData[i][j].player}-${boardData[i][j].type}` : '';
//         });
//     }

//     // Updates master board in localStorage 
//     function updateMasterBoard(boardData) {
//         masterBoard.board = boardData;
//         localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
//     }

//     // Updates the current player turn indicator
//     function updateCurrentPlayerIndicator() {
//         document.getElementById('currentPlayer').textContent = playerNames[currentPlayerIndex];
//     }

//     // Update the eliminated pieces count for the current player
//     function updateEliminatedPieces() {
//         if (Array.isArray(masterBoard.eliminatedPieces) && typeof playerIndex === 'number' && playerIndex >= 0 && playerIndex < masterBoard.eliminatedPieces.length) {
//             document.getElementById('eliminatedPieces').textContent = `Eliminated Pieces: ${masterBoard.eliminatedPieces[playerIndex]}`;
//         } else {
//             console.error('Invalid eliminatedPieces data or playerIndex:', masterBoard.eliminatedPieces, playerIndex);
//         }
//     }

//     // Checks if it is the current player's turn, increments the turn, and updates the master board.
//     document.getElementById('endTurnButton').addEventListener('click', function() {
//         if (currentPlayerIndex === playerIndex) {
//             currentPlayerIndex = (currentPlayerIndex + 1) % 4;
//             masterBoard.currentTurn = currentPlayerIndex;
//             localStorage.setItem('masterBoard', JSON.stringify(masterBoard));
//             updateCurrentPlayerIndicator(); // Update the local turn indicator immediately
//         }
//     });
// });
