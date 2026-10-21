import * as THREE from 'three';
import '../css/mainstyle.css';
import skyUrl from '/assets/sky.png';
import { createPhoneView } from './phone.js';

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
    phoneView.update(timer.getElapsed());
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