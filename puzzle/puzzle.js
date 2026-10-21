import * as THREE from 'three';
import skyUrl from '/assets/sky.png';
import hollowUrl from '/assets/hollow.obj';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { createPhoneView } from '../demo/phone.js';

const goals = {
    goal1: "Rotate Shape",
    goal2: "Translate Shape",
    goal3: "Move Shape into Hollow",
}

let popupTimer = null;

const goal1Check = document.getElementById("goal1");
const goal2Check = document.getElementById("goal2");
const goal3Check = document.getElementById("goal3");

const goalPopup = document.querySelector(".goalPopup");
const goalPopupText = document.querySelector(".goalPopupText");

const showCheckPopup = (goalId) => {
    // Clear any existing timer to prevent overlapping loops
    if (popupTimer) {
        clearTimeout(popupTimer);
    }

    goalPopupText.textContent = goals[goalId];
    goalPopup.style.display = 'flex';

    // Store new timer ID
    popupTimer = setTimeout(() => {
        goalPopup.style.display = 'none';
        popupTimer = null; // Clear timer
    }, 4000);
}

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
let min = 2;
let sec = 0;
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
    window.location.href = '../demo/demo.html';
})

goal1Check.addEventListener("change", () => {
    if (goal1Check.checked == true) {
        showCheckPopup("goal1");
    }
})

goal2Check.addEventListener("change", () => {
    if (goal2Check.checked == true) {
        showCheckPopup("goal2");
    }
})

goal3Check.addEventListener("change", () => {
    if (goal3Check.checked == true) {
        showCheckPopup("goal3");
    }
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

// for phone
const phonePanel = document.getElementById('phonePanel');
const phoneToggleButton = document.querySelector('.phoneToggleButton');
const phoneCloseButton = document.querySelector('.phoneCloseButton');
const phoneDragHandle = document.querySelector('.phone-drag-handle');

function setPhonePanelOpen(isOpen) {
    phonePanel.hidden = !isOpen;
    phoneToggleButton.setAttribute('aria-expanded', String(isOpen));
}

phoneToggleButton.addEventListener('click', () => {
    setPhonePanelOpen(phonePanel.hidden);
});
phoneCloseButton.addEventListener('click', () => setPhonePanelOpen(false));

let dragOffsetX = 0;
let dragOffsetY = 0;

phoneDragHandle.addEventListener('pointerdown', (event) => {
    const panelBounds = phonePanel.getBoundingClientRect();
    dragOffsetX = event.clientX - panelBounds.left;
    dragOffsetY = event.clientY - panelBounds.top;
    phonePanel.style.left = `${panelBounds.left}px`;
    phonePanel.style.top = `${panelBounds.top}px`;
    phonePanel.style.right = 'auto';
    phoneDragHandle.setPointerCapture(event.pointerId);
});

phoneDragHandle.addEventListener('pointermove', (event) => {
    if (!phoneDragHandle.hasPointerCapture(event.pointerId)) return;

    const maxLeft = window.innerWidth - phonePanel.offsetWidth;
    const maxTop = window.innerHeight - phonePanel.offsetHeight;
    const left = THREE.MathUtils.clamp(event.clientX - dragOffsetX, 0, maxLeft);
    const top = THREE.MathUtils.clamp(event.clientY - dragOffsetY, 0, maxTop);
    phonePanel.style.left = `${left}px`;
    phonePanel.style.top = `${top}px`;
});




const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0xBBFFAA, emissive: 0x000000, specular: 0x111111, shininess: 100, flatShading: false });

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);
const phoneView = createPhoneView(document.getElementById('phoneCanvas'), cube);

const objLoader = new OBJLoader();
const hollowObj = await objLoader.loadAsync(hollowUrl);
const hollowMaterial = new THREE.MeshPhongMaterial({ color: 0x666666, emissive: 0x000000, specular: 0x111111, shininess: 100, flatShading: false });
hollowObj.traverse((child) => {
    if (child.isMesh) child.material = hollowMaterial;
});
hollowObj.position.set(-2, 1, -4);
hollowObj.scale.set(0.4, 0.4, 0.4)
hollowObj.rotateX(-Math.PI / 6)
hollowObj.rotateY(-Math.PI / 2)
scene.add(hollowObj);

const light1 = new THREE.DirectionalLight(0xffffff, 2.0);
light1.position.set(5, 5, 5);
const light3 = new THREE.DirectionalLight(0xffffff, 1.0);
light3.position.set(-5, 2, -3);
const light4 = new THREE.DirectionalLight(0xffffff, 0.6);
light4.position.set(0, -5, 2);
const light2 = new THREE.AmbientLight(0xffffff, 0.3);
scene.add(light1, light3, light4, light2);

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

// for the modeUI to show which mode the user is in (e.g. rotation, camera)
const modeText = document.getElementById("mode-text");
const modeLabels = {
    [TransformationStates.Translation]: "Translation",
    [TransformationStates.Rotation]: "Rotation",
    [TransformationStates.Scaling]: "Scaling",
    [TransformationStates.Camera]: "Camera",
};

var currentTransformationState = TransformationStates.Camera;
setTransformationState(currentTransformationState);

var isZBeingPressed = false; // for knowing if the obj should be transformed in z axis

const timer = new THREE.Timer();
const pressedKeys = new Set();
const transformationSpeed = 2;


function animate(time) {
    timer.update(time);
    const deltaTime = timer.getDelta();
    applyTransformations(currentTransformationState, deltaTime, isZBeingPressed);
    renderer.render(scene, camera);
    phoneView.update(timer.getElapsed());
}
renderer.setAnimationLoop(animate);

window.addEventListener("keydown", (event) => {

    if (event.key == "z") {
        isZBeingPressed = true;
    }

    switch (event.key) {
        case "t": {
            setTransformationState(TransformationStates.Translation);
            break;
        }

        case "r": {
            setTransformationState(TransformationStates.Rotation);
            break;
        }

        case "s": {
            setTransformationState(TransformationStates.Scaling);
            break;
        }

        case "c": {
            setTransformationState(TransformationStates.Camera);
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

    if (event.key == "z") {
        isZBeingPressed = false
    }
});

window.addEventListener("blur", () => pressedKeys.clear());

function setTransformationState(state) {
    currentTransformationState = state;
    modeText.textContent = modeLabels[state];
}

// transforms the cube depending on which transformation state the user is in
function applyTransformations(transState, deltaTime, isZBeingPressed) {

    let x = 0;
    let y = 0;
    let z = 0;

    if (pressedKeys.has("ArrowRight")) {
        x += 1
    }
    if (pressedKeys.has("ArrowLeft")) {
        x -= 1
    }

    if (isZBeingPressed && currentTransformationState != TransformationStates.Camera) {
        if (pressedKeys.has("ArrowUp")) {
            z -= 1
        }
        if (pressedKeys.has("ArrowDown")) {
            z += 1
        }

    } else {
        if (pressedKeys.has("ArrowUp")) {
            y += 1
        }
        if (pressedKeys.has("ArrowDown")) {
            y -= 1
        }
    }

    switch (transState) {
        case TransformationStates.Translation: {
            cube.position.x += x * transformationSpeed * deltaTime;
            cube.position.y += y * transformationSpeed * deltaTime;
            cube.position.z += z * transformationSpeed * deltaTime;
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
            cube.scale.z = Math.max(0.01, cube.scale.z + (z * transformationSpeed * deltaTime));
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