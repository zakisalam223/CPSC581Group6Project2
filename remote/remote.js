const wrongBtn = document.querySelector('.wrongBtn');
const rightBtn = document.querySelector('.rightBtn');

const wrongNoise = new Audio('../assets/fail-noise.mp3');
const rightNoise = new Audio('../assets/complete-noise.mp3');

wrongBtn.addEventListener("click", playWrongHaptics);
rightBtn.addEventListener("click", playRightHaptics);

function playWrongHaptics() {
    wrongNoise.play().catch(error => {
        console.log("Playback blocked:", error);
    });
    window.navigator.vibrate([750]);
}

function playRightHaptics() {
    rightNoise.play().catch(error => {
        console.log("Playback blocked:", error);
    });
    window.navigator.vibrate([180, 170, 450]);
}