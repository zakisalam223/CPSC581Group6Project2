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

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

camera.position.z = 5;

const infoButton = document.querySelector('.infoButton');
const infoBox = document.querySelector('.infoBox');
let showInfo = false;

function animate(time) {
    renderer.render(scene, camera);
    cube.rotation.x = time / 2000;
    cube.rotation.y = time / 1000;
}
renderer.setAnimationLoop(animate);

infoButton.addEventListener("click", toggleInfoBox);

function toggleInfoBox() {
    showInfo = !showInfo;
    infoBox.style.display = showInfo ? 'block' : 'none';

    if (showInfo) {
        Object.assign(infoBox.style, infoBoxStyles);
    }
}