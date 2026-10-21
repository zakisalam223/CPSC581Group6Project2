const puzzleButton = document.getElementById('puzzleBtn');

if (puzzleButton) {
    puzzleButton.addEventListener('click', () => {
        window.location.href = './puzzle/puzzle.html';
    });
}