//listen to changes to the masterBoard in localStorage to keep windows synchronized
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

    //create local board
    function createBoard(boardData) {
        const board = document.getElementById('board');
        board.innerHTML = ''; // Clear existing cells
        for (let i = 0; i < 100; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.textContent = boardData[i] || ''; // Display piece if exists
            cell.addEventListener('click', function() {
                if (currentPlayerIndex === playerIndex) {
                    boardData[i] = 'X'; // test to place a piece
                    currentPlayerIndex = (currentPlayerIndex + 1) % 4;
                    const updatedMasterBoard = {
                        board: boardData,
                        currentTurn: currentPlayerIndex,
                        playerNames: playerNames
                    };
                    localStorage.setItem('masterBoard', JSON.stringify(updatedMasterBoard));
                }
            });
            board.appendChild(cell);
        }
    }

    //update
    function updateBoard(boardData) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = boardData[index] || '';
        });
    }
});