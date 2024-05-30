//settting up the players to be savved in loal storage
document.getElementById('playerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    const player3 = document.getElementById('player3').value;
    const player4 = document.getElementById('player4').value;

    const playerNames = [player1, player2, player3, player4];
    localStorage.setItem('playerNames', JSON.stringify(playerNames));

    //Setting master board to save progress from players
    const board = Array(100).fill(null)//we start with empty board
    const masterBoard = {
        board: board, //display board
        currentTurn:0, //keep track of teh turns
        playerNames: playerNames 
    };
    localStorage.setItem('masterBoard', JSON.stringify(masterBoard));

    for(let i=0;i<4;i++){
        const playerWindow = window.open('player.html?index=' + i, '_blank', 'width=600,height=600');
    }


});