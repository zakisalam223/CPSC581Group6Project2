import failNoise from '/assets/fail-noise.mp3';
import completeNoise from '/assets/complete-noise.mp3';

const wrongBtn = document.querySelector('.wrongBtn');
const rightBtn = document.querySelector('.rightBtn');

const wrongNoise = new Audio(failNoise);
const rightNoise = new Audio(completeNoise);

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