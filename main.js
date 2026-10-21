const screen = document.getElementById('screen');
const readyButtons = [...document.querySelectorAll('[data-ready]')];
const titleScreen = document.getElementById('titleScreen');
const loadingScreen = document.getElementById('loadingScreen');

readyButtons.forEach((button) => {
    button.addEventListener('click', () => {
        const ready = button.getAttribute('aria-pressed') !== 'true';

        button.setAttribute('aria-pressed', String(ready));
        button.textContent = ready ? 'Ready' : 'Not ready';

        const everyoneReady = readyButtons.every(
            (playerButton) => playerButton.getAttribute('aria-pressed') === 'true'
        );

        screen.dataset.state = everyoneReady ? 'loading' : 'title';
        titleScreen.hidden = everyoneReady;
        loadingScreen.hidden = !everyoneReady;

        if (everyoneReady) {
            window.setTimeout(() => {
                window.location.href = './level-select.html';
            }, 2000);
        }
    });
});