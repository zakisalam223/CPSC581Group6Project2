import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
 
const AXIS_COLORS = { x: 0xff4d4d, y: 0x86d338, z: 0x4d8dff };
 
const toDegrees = (rad) => {
    // wrap into (-180, 180] so the readout never grows without bound
    let deg = THREE.MathUtils.radToDeg(rad) % 360;
    if (deg > 180) deg -= 360;
    if (deg <= -180) deg += 360;
    return Math.round(deg);
};
 
/**
 * Renders a small phone surrounded by a three-ring gyroscope.
 * The phone copies the rotation of `target` (the cube) exactly.
 *
 * @param {HTMLElement} container  element the phone canvas is appended to
 * @param {THREE.Object3D} target  object whose rotation the phone follows
 * @returns {{ update: (elapsedSeconds: number) => void }}
 */
export function createPhoneView(container, target) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0, 7.5);
 
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
 
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const key = new THREE.DirectionalLight(0xffffff, 1.2);
    key.position.set(3, 4, 5);
    scene.add(key);
 
    // ---- gyroscope: three nested rings --------------------------------
    // Nesting order X > Y > Z matches three.js's default Euler order ('XYZ'),
    // so the innermost group ends up with exactly the cube's orientation.
    const ringSpecs = [
        { axis: 'x', radius: 2.05, orient: (m) => m },                        // plane XY
        { axis: 'y', radius: 1.8, orient: (m) => (m.rotateY(Math.PI / 2), m) }, // plane YZ
        { axis: 'z', radius: 1.55, orient: (m) => (m.rotateX(Math.PI / 2), m) }, // plane XZ
    ];
 
    const gimbals = {};
    const orbiters = [];
    let parent = scene;
 
    for (const spec of ringSpecs) {
        const pivot = new THREE.Group();
        parent.add(pivot);
 
        const torusGeo = new THREE.TorusGeometry(spec.radius, 0.02, 10, 120);
        const torusMat = new THREE.MeshBasicMaterial({ color: AXIS_COLORS[spec.axis] });
        const ring = spec.orient(new THREE.Mesh(torusGeo, torusMat));
        pivot.add(ring);
 
        // a dot that loops around the ring (the ring's local plane is XY)
        const dot = new THREE.Mesh(
            new THREE.SphereGeometry(0.075, 16, 16),
            new THREE.MeshBasicMaterial({ color: 0xffffff })
        );
        ring.add(dot);
        orbiters.push({ dot, radius: spec.radius, offset: orbiters.length * 2.1 });
 
        gimbals[spec.axis] = pivot;
        parent = pivot;
    }
 
    // ---- phone ---------------------------------------------------------
    const phone = new THREE.Group();
    parent.add(phone); // inside the innermost (Z) ring
 
    const body = new THREE.Mesh(
        new RoundedBoxGeometry(1, 2, 0.14, 5, 0.12),
        new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 80 })
    );
    phone.add(body);
 
    const screen = new THREE.Mesh(
        new THREE.PlaneGeometry(0.86, 1.8),
        new THREE.MeshBasicMaterial({ color: 0x0f1a0a })
    );
    screen.position.z = 0.072;
    phone.add(screen);
 
    // lighter back so you can tell which side you are looking at
    const back = new THREE.Mesh(
        new THREE.PlaneGeometry(0.86, 1.8),
        new THREE.MeshPhongMaterial({ color: 0x86d338 })
    );
    back.position.z = -0.072;
    back.rotation.y = Math.PI;
    phone.add(back);
 
    const speaker = new THREE.Mesh(
        new THREE.PlaneGeometry(0.28, 0.035),
        new THREE.MeshBasicMaterial({ color: 0x555555 })
    );
    speaker.position.set(0, 0.84, 0.075);
    phone.add(speaker);
 
    // looping circles on the screen: three rings expanding and fading
    const pulses = [0, 1, 2].map((i) => {
        const mesh = new THREE.Mesh(
            new THREE.RingGeometry(0.97, 1, 64),
            new THREE.MeshBasicMaterial({ color: 0x86d338, transparent: true, depthWrite: false })
        );
        mesh.position.z = 0.08;
        phone.add(mesh);
        return { mesh, phase: i / 3 };
    });
 
    // ---- readout elements ---------------------------------------------
    const readout = {
        x: document.getElementById('phoneX'),
        y: document.getElementById('phoneY'),
        z: document.getElementById('phoneZ'),
    };
 
    // ---- sizing ---------------------------------------------------------
    function resize() {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        renderer.setSize(w, h, false);
        renderer.domElement.style.width = '100%';
        renderer.domElement.style.height = '100%';
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
    }
    new ResizeObserver(resize).observe(container);
    resize();
 
    // ---- per-frame update ---------------------------------------------
    function update(t) {
        const e = target.rotation;
        gimbals.x.rotation.x = e.x;
        gimbals.y.rotation.y = e.y;
        gimbals.z.rotation.z = e.z;
 
        for (const o of orbiters) {
            const a = t * 1.2 + o.offset;
            o.dot.position.set(Math.cos(a) * o.radius, Math.sin(a) * o.radius, 0);
        }
 
        for (const p of pulses) {
            const k = (t * 0.35 + p.phase) % 1; // 0 -> 1, then loops
            const s = 0.08 + k * 0.34;
            p.mesh.scale.set(s, s, 1);
            p.mesh.material.opacity = (1 - k) * 0.9;
        }
 
        if (readout.x) readout.x.textContent = `${toDegrees(e.x)}°`;
        if (readout.y) readout.y.textContent = `${toDegrees(e.y)}°`;
        if (readout.z) readout.z.textContent = `${toDegrees(e.z)}°`;
 
        renderer.render(scene, camera);
    }
 
    return { update };
}