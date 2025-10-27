import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "lil-gui";

/**
 * Base
 */
// Debug
const gui = new dat.GUI();

// Texture
const textureLoader = new THREE.TextureLoader();

const parameters = {
  materialColor: "#4a5f7a", // Shark color
  backgroundColor: "#262837", // Background color
  ambientLightColor: "#ffffff",
  ambientLightIntensity: 0.5,
  directionalLightColor: "#ffffff",
  directionalLightIntensity: 0.8,
  pointLightColor: "#ffffff",
  pointLightIntensity: 1,
};

// Shark color control
gui.addColor(parameters, "materialColor").onChange(() => {
  bodyMaterial.color.set(parameters.materialColor);
});

// Background color control
gui.addColor(parameters, "backgroundColor").onChange(() => {
  renderer.setClearColor(parameters.backgroundColor);
});

// Ambient Light controls
const ambientFolder = gui.addFolder("Ambient Light");
ambientFolder.addColor(parameters, "ambientLightColor").onChange(() => {
  ambientLight.color.set(parameters.ambientLightColor);
});
ambientFolder
  .add(parameters, "ambientLightIntensity", 0, 2, 0.01)
  .onChange(() => {
    ambientLight.intensity = parameters.ambientLightIntensity;
  });

// Directional Light controls
const directionalFolder = gui.addFolder("Directional Light");
directionalFolder.addColor(parameters, "directionalLightColor").onChange(() => {
  directionalLight.color.set(parameters.directionalLightColor);
});
directionalFolder
  .add(parameters, "directionalLightIntensity", 0, 3, 0.01)
  .onChange(() => {
    directionalLight.intensity = parameters.directionalLightIntensity;
  });

// Point Light controls
const pointFolder = gui.addFolder("Point Light");
pointFolder.addColor(parameters, "pointLightColor").onChange(() => {
  pointLight.color.set(parameters.pointLightColor);
});
pointFolder.add(parameters, "pointLightIntensity", 0, 3, 0.01).onChange(() => {
  pointLight.intensity = parameters.pointLightIntensity;
});

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Shark
 */
const shark = new THREE.Group();
scene.add(shark);

const bodyGeometry = new THREE.SphereGeometry(1, 32, 32);
bodyGeometry.scale(2, 0.8, 0.8);
const bodyMaterial = new THREE.MeshStandardMaterial({
  color: parameters.materialColor,
  roughness: 0.5,
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
shark.add(body);

// Head (cone for snout)
const headGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
headGeometry.rotateZ(Math.PI / 2);
const head = new THREE.Mesh(headGeometry, bodyMaterial);
head.position.set(2, 0, 0);
shark.add(head);

// Dorsal fin (top fin)
const dorsalFinGeometry = new THREE.ConeGeometry(0.4, 1.2, 4);
dorsalFinGeometry.rotateZ(Math.PI);
const dorsalFin = new THREE.Mesh(dorsalFinGeometry, bodyMaterial);
dorsalFin.position.set(0, 1.2, 0);
shark.add(dorsalFin);

// Tail
const tailGeometry = new THREE.ConeGeometry(0.8, 1.5, 4);
tailGeometry.rotateZ(-Math.PI / 2);
const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
tail.position.set(-2.5, 0.3, 0);
shark.add(tail);

// Side fins (pectoral fins)
const finGeometry = new THREE.ConeGeometry(0.3, 1, 4);
finGeometry.rotateZ(Math.PI / 2);
finGeometry.rotateY(Math.PI / 4);

const leftFin = new THREE.Mesh(finGeometry, bodyMaterial);
leftFin.position.set(0.5, -0.5, 0.8);
shark.add(leftFin);

const rightFin = new THREE.Mesh(finGeometry.clone(), bodyMaterial);
rightFin.position.set(0.5, -0.5, -0.8);
rightFin.rotation.y *= -1;
shark.add(rightFin);

// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(1.8, 0.3, 0.3);
shark.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(1.8, 0.3, -0.3);
shark.add(rightEye);

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight(
  parameters.ambientLightColor,
  parameters.ambientLightIntensity
);
scene.add(ambientLight);

// Directional Light
const directionalLight = new THREE.DirectionalLight(
  parameters.directionalLightColor,
  parameters.directionalLightIntensity
);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Point Light
const pointLight = new THREE.PointLight(
  parameters.pointLightColor,
  parameters.pointLightIntensity,
  100
);
pointLight.position.set(-3, 3, 3);
scene.add(pointLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.x = 4;
camera.position.y = 2;
camera.position.z = 5;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setClearColor(parameters.backgroundColor);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

  controls.update();

  renderer.render(scene, camera);

  window.requestAnimationFrame(tick);
};

tick();
