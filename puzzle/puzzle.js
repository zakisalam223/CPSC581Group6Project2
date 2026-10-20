import * as THREE from 'three';
import '../css/mainstyle.css';

const infoBoxStyles = {
    padding: '10px',
    backgroundColor: '#1E1E1E',
    border: '2px solid #FFFFFF',
    color: '#86D338',
    width: '225px',
    position: 'relative',
    right: '24px',
    bottom: '20px',
};

const infoButton = document.querySelector('.infoButton');
const infoBox = document.querySelector('.infoBox');
let showInfo = false;

infoButton.addEventListener("click", toggleInfoBox);

function toggleInfoBox() {
    showInfo = !showInfo;
    infoBox.style.display = showInfo ? 'block' : 'none';

    if (showInfo) {
        Object.assign(infoBox.style, infoBoxStyles);
    }
}



const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshPhongMaterial({ color: 0x00ff00, emissive: 0x000000, specular: 0x111111, shininess: 30, flatShading: false});

const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

const light1 = new THREE.DirectionalLight(0xffffff, 1);
light1.position.set(5, 5, 5);

const light2 = new THREE.AmbientLight(0xffffff, 0.4);

scene.add(light1);
scene.add(light2);

camera.position.z = 5;

// enum for the transformation states, e.g. translation, rotation or scaling
const TransformationStates = Object.freeze({
    Translation: 'translation',
    Rotation: 'rotation',
    Scaling: 'scaling',
});

var currentTransformationState = TransformationStates.Translation;

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
    }


}