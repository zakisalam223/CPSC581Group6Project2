import * as THREE from 'three';
import skyUrl from '/assets/sky.png';

const hourContainer = document.getElementById("hour");
const minContainer = document.getElementById("min");
const secContainer = document.getElementById("sec");

const levelCompleteUI = document.getElementById("ui-level-complete");
const mainUI = document.getElementById("ui-main");

const infoButton = document.querySelector('.infoBtn');
const infoBox = document.querySelector('.infoBox');

const exitButton = document.getElementById("exit-button");
const retryButton = document.getElementById("retry-button");
const levelsButton = document.getElementById("levels-button");
const demoButton = document.getElementById("demo-button");

let interval;
// CHANGE TIME AS NEEDED (to go to level complete faster)
let hour = 0;
let min = 0;
let sec = 1;
let showInfo = false;
let timer_set = 0;

const updateTimerUI = () => {
    hourContainer.value = String(hour).padStart(2, '0');
    minContainer.value = String(min).padStart(2, '0');
    secContainer.value = String(sec).padStart(2, '0');
}

const updateHMS = () => {
    sec = timer_set % 60;
    min = Math.floor(timer_set / 60);
    hour = Math.floor(min / 60);
    min = min % 60;
    updateTimerUI();
}

window.addEventListener("load", startTimer);
infoButton.addEventListener("click", toggleInfoBox);

exitButton.addEventListener('click', () => {
    window.location.href = '/';
})

retryButton.addEventListener('click', () => {
    window.location.reload();
})

levelsButton.addEventListener('click', () => {
    window.location.href = '../level-select.html';
})

demoButton.addEventListener('click', () => {
    window.alert("OOPS! Demo in progress...");
})

minContainer.addEventListener("change", () => {
    min = parseInt(minContainer.value)
    if (min >= 60) {
        hour = Math.floor(hour + min / 60);
        min = min % 60;
    }
    updateTimerUI();
})

secContainer.addEventListener("change", () => {
    sec = parseInt(secContainer.value)
    if (sec >= 60) {
        min = Math.floor(min + sec / 60);
        sec = sec % 60;
        if (min > 60) {
            hour = Math.floor(hour + min / 60);
            min = min % 60;
        }
    }
    updateTimerUI();
})

hourContainer.addEventListener("change", () => {
    hour = parseInt(hourContainer.value);
    updateTimerUI();
})

function showLevelCompleteUI() {
    mainUI.style.display = 'none';
    levelCompleteUI.style.display = 'grid';
    // TODO: adjust camera so shape is in the middle of the new view
}

function endTimer() {
    hour = 0
    min = 0
    sec = 0
    timer_set = 0;
    if (interval) {
        clearInterval(interval);
    }
    hourContainer.value = "";
    minContainer.value = "";
    secContainer.value = "";

    // Change overlay to Level Complete UI
    showLevelCompleteUI();
}

function startTimer() {
    updateTimerUI();
    timer_set = hour * 60 * 60 + min * 60 + sec;

    if (timer_set > 0) {
        interval = setInterval(() => {
            timer_set -= 1;

            if (timer_set <= 0) {
                endTimer();
                clearInterval(interval);
            }

            updateHMS();
        }, 1000)
    } else {
        endTimer()
    }
}

function toggleInfoBox() {
    showInfo = !showInfo;
    infoBox.style.display = showInfo ? 'block' : 'none';
}




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0xBBFFAA, emissive: 0x000000, specular: 0x111111, shininess: 100, flatShading: false });

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const hollowGeometry = new THREE.BoxGeometry(0.7, 4, 1);
const hollowMaterial = new THREE.MeshPhongMaterial({ color: 0x555555, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
const hollowObject = new THREE.Mesh(hollowGeometry, hollowMaterial);
hollowObject.position.set(2, 1, -2.5);
hollowObject.rotateX(Math.PI / 4)
scene.add(hollowObject);

const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, 5, 5);

const light2 = new THREE.AmbientLight(0xffffff, 0.85);

scene.add(light1);
scene.add(light2);

const textureLoader = new THREE.TextureLoader();
textureLoader.load(skyUrl, (texture) => {
    texture.mapping = THREE.EquirectangularReflectionMapping;
    texture.colorSpace = THREE.SRGBColorSpace;
    scene.background = texture;
});

camera.position.y = -5;
camera.position.z = 5;
const cameraOrbit = new THREE.Spherical().setFromVector3(camera.position);

cameraOrbit.theta = Math.PI / 4;
cameraOrbit.phi = Math.PI / 3;
camera.position.setFromSpherical(cameraOrbit);
camera.lookAt(0, 0, 0);

// creating world axis lines
const xAxisPoints = [
    new THREE.Vector3(-10000, 0, 0),
    new THREE.Vector3(10000, 0, 0)
];

const yAxisPoints = [
    new THREE.Vector3(0, -10000, 0),
    new THREE.Vector3(0, 10000, 0)
];

const zAxisPoints = [
    new THREE.Vector3(0, 0, -10000),
    new THREE.Vector3(0, 0, 10000)
];

const red = new THREE.LineBasicMaterial({ color: 0xff0000 });
const green = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const blue = new THREE.LineBasicMaterial({ color: 0x0000ff });

const xAxisGeometry = new THREE.BufferGeometry().setFromPoints(xAxisPoints);
const yAxisGeometry = new THREE.BufferGeometry().setFromPoints(yAxisPoints);
const zAxisGeometry = new THREE.BufferGeometry().setFromPoints(zAxisPoints);

const xAxis = new THREE.Line(xAxisGeometry, red);
const yAxis = new THREE.Line(yAxisGeometry, green);
const zAxis = new THREE.Line(zAxisGeometry, blue);

scene.add(xAxis);
scene.add(yAxis);
scene.add(zAxis);


// enum for the transformation states, e.g. translation, rotation or scaling
const TransformationStates = Object.freeze({
    Translation: 'translation',
    Rotation: 'rotation',
    Scaling: 'scaling',
    Camera: 'camera',
});

var currentTransformationState = TransformationStates.Camera;

const timer = new THREE.Timer();
const pressedKeys = new Set();
const transformationSpeed = 2;


function animate(time) {
    timer.update(time);
    const deltaTime = timer.getDelta();
    applyTransformations(currentTransformationState, deltaTime);
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

window.addEventListener("keydown", (event) => {
    switch (event.key) {
        case "t": {
            currentTransformationState = TransformationStates.Translation;
            break;
        }

        case "r": {
            currentTransformationState = TransformationStates.Rotation;
            break;
        }

        case "s": {
            currentTransformationState = TransformationStates.Scaling;
            break;
        }

        case "c": {
            currentTransformationState = TransformationStates.Camera;
            break;
        }

        case "ArrowUp":
        case "ArrowDown":
        case "ArrowLeft":
        case "ArrowRight":
            event.preventDefault();
            pressedKeys.add(event.key);
            break;

        default:
            return;
    }
})

window.addEventListener("keyup", (event) => {
    pressedKeys.delete(event.key);
});

window.addEventListener("blur", () => pressedKeys.clear());


// transforms the cube depending on which transformation state the user is in
function applyTransformations(transState, deltaTime) {

    let x = 0;
    let y = 0;

    if (pressedKeys.has("ArrowRight")) {
        x += 1
    }
    if (pressedKeys.has("ArrowLeft")) {
        x -= 1
    }
    if (pressedKeys.has("ArrowUp")) {
        y += 1
    }
    if (pressedKeys.has("ArrowDown")) {
        y -= 1
    }

    switch (transState) {
        case TransformationStates.Translation: {
            cube.position.x += x * transformationSpeed * deltaTime;
            cube.position.y += y * transformationSpeed * deltaTime;
            break;
        }
        case TransformationStates.Rotation: {
            cube.rotation.x -= y * transformationSpeed * deltaTime;
            cube.rotation.y += x * transformationSpeed * deltaTime;
            break;
        }
        case TransformationStates.Scaling: {
            cube.scale.x = Math.max(0.01, cube.scale.x + (x * transformationSpeed * deltaTime));
            cube.scale.y = Math.max(0.01, cube.scale.y + (y * transformationSpeed * deltaTime));
            break;
        }

        case TransformationStates.Camera: {
            cameraOrbit.theta += x * transformationSpeed * deltaTime;
            cameraOrbit.phi = THREE.MathUtils.clamp(cameraOrbit.phi - y * transformationSpeed * deltaTime, 0.01, Math.PI - 0.01);
            camera.position.setFromSpherical(cameraOrbit);
            camera.lookAt(0, 0, 0);
        }
    }


}