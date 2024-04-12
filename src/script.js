import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/loaders/GLTFLoader.js';
import { AsciiEffect } from 'https://cdn.jsdelivr.net/npm/three@0.163.0/examples/jsm/effects/AsciiEffect.js';
var scene;
var camera;
const renderer = new THREE.WebGLRenderer();
var effect;
var animationid = null;

export function init(containerId, bgcolor, txtcolor, type='atom') {
    const container = document.getElementById(containerId);
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0xf0f0f0);
    effect = new AsciiEffect(renderer)
    effect.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(effect.domElement);
    effect.domElement.style.backgroundColor = bgcolor;
    effect.domElement.style.color = txtcolor;
    container.appendChild(effect.domElement);
    var directionalLight;
    if (type == 'chess') {
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
        directionalLight.position.set(1, 1, 1);
    }
    else if (type == 'torus') {
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(5, -3, 1);
    }
    else {
        directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
        directionalLight.position.set(1, 1, 1);
    }
    scene.add(directionalLight);
    const controls = new OrbitControls(camera, effect.domElement);
    let mixer; // Animation mixer
    const loader = new GLTFLoader();
    loader.load(
        'models/' + type + '.glb',
        (gltf) => {
            const model = gltf.scene;
            scene.add(model);

            // Automatically adjust camera position to fit the model
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
            if (type == 'chess') {
                cameraZ *= 1.4;
            }
            else if (type == 'torus') {
                cameraZ *= 1.4;
            }
            else {
                cameraZ *= 1.25;
            }
            camera.position.set(center.x, center.y, cameraZ);
            controls.target = center; // set OrbitControls

            if (gltf.animations && gltf.animations.length > 0) {
                mixer = new THREE.AnimationMixer(model);
                gltf.animations.forEach((clip) => {
                    mixer.clipAction(clip).play();
                });
            }
        },
        undefined,
        (error) => {
            console.error('Error loading GLB model:', error);
        }
    );

    // Render loop
    function animate() {
        animationid = requestAnimationFrame(animate);
        effect.render(scene, camera);
        controls.update(); // Update OrbitControls
        if (mixer) {
            mixer.update(0.0167); // Update animation
        }
    }
    animate();
}

export function change_type(containerId, bgcolor, txtcolor, newtype) {
    if (animationid != null) {
        cancelAnimationFrame(animationid);
    }
    init(containerId, bgcolor, txtcolor, newtype);
}

const terminalText = `Tomasz Pniewski`;

const textElement = document.getElementById('text1');

let index = 0;

function type() {
    textElement.textContent += terminalText[index];
    index++;

    if (index >= terminalText.length) {
        clearInterval(typingInterval);
    }
}

const typingInterval = setInterval(type, 70);