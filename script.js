document.getElementById('playerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const player1 = document.getElementById('player1').value;
    const player2 = document.getElementById('player2').value;
    const player3 = document.getElementById('player3').value;
    const player4 = document.getElementById('player4').value;

    const playerNames = [player1, player2, player3, player4];
    localStorage.setItem('playerNames', JSON.stringify(playerNames));

    for(let i=0;i<4;i++){
        const playerWindow = window.open('player.html?index=' + i, '_blank', 'width=600,height=600');
    }


});