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
const grassColorTexture = textureLoader.load("/textures/grass/color.jpg");
const grassAmbientOcclusionTexture = textureLoader.load(
  "/textures/grass/ambientOcclusion.jpg"
);
const grassNormalTexture = textureLoader.load("/textures/grass/normal.jpg");
const grassRoughnessTexture = textureLoader.load(
  "/textures/grass/roughness.jpg"
);

const parameters = {
  materialColor: "#4a5f7a", // Shark color
  backgroundColor: "#262837", // Background color
  ambientLightColor: "#ffffff",
  ambientLightIntensity: 0.5,
  directionalLightColor: "#ffffff",
  directionalLightIntensity: 0.8,
  pointLightColor: "#ffffff",
  pointLightIntensity: 1,

  // Animation parameters
  sharkSwimSpeed: 1,
  sharkRotationSpeed: 0.5,
  backgroundAnimationSpeed: 0.5,
  enableSharkAnimation: true,
  enableTailWag: true,
  enableFinMovement: true,
  fogDensity: 0.05,
  enableBackgroundAnimation: true,
};

// Shark color control
gui.addColor(parameters, "materialColor").onChange(() => {
  bodyMaterial.color.set(parameters.materialColor);
});

// Background color control
gui.addColor(parameters, "backgroundColor").onChange(() => {
  if (!parameters.enableBackgroundAnimation) {
    renderer.setClearColor(parameters.backgroundColor);
    scene.fog.color.set(parameters.backgroundColor);
  }
});

// Background animation toggle
gui.add(parameters, "enableBackgroundAnimation").name("Animate Background");

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

// Animation controls
const animationFolder = gui.addFolder("Animations");
animationFolder.add(parameters, "enableSharkAnimation").name("Shark Swimming");
animationFolder.add(parameters, "enableTailWag").name("Tail Wagging");
animationFolder.add(parameters, "enableFinMovement").name("Fin Movement");
animationFolder.add(parameters, "sharkSwimSpeed", 0, 3, 0.1).name("Swim Speed");
animationFolder
  .add(parameters, "sharkRotationSpeed", 0, 2, 0.1)
  .name("Rotation Speed");
animationFolder
  .add(parameters, "backgroundAnimationSpeed", 0, 2, 0.1)
  .name("Background Speed");

// Fog controls
const fogFolder = gui.addFolder("Underwater Fog");
fogFolder
  .add(parameters, "fogDensity", 0, 0.2, 0.001)
  .name("Fog Density")
  .onChange(() => {
    scene.fog.density = parameters.fogDensity;
  });

// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

// Add fog for underwater effect
scene.fog = new THREE.FogExp2(0x1a3a52, parameters.fogDensity);

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
  metalness: 0.2,
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.castShadow = true;
body.receiveShadow = true;
shark.add(body);

// Head (cone for snout)
const headGeometry = new THREE.ConeGeometry(0.5, 1.5, 32);
headGeometry.rotateZ(Math.PI / 2);
const head = new THREE.Mesh(headGeometry, bodyMaterial);
head.position.set(2, 0, 0);
head.castShadow = true;
head.receiveShadow = true;
shark.add(head);

// Dorsal fin (top fin)
const dorsalFinGeometry = new THREE.ConeGeometry(0.4, 1.2, 4);
dorsalFinGeometry.rotateZ(Math.PI);
const dorsalFin = new THREE.Mesh(dorsalFinGeometry, bodyMaterial);
dorsalFin.position.set(0, 1.2, 0);
dorsalFin.castShadow = true;
dorsalFin.receiveShadow = true;
shark.add(dorsalFin);

// Tail
const tailGeometry = new THREE.ConeGeometry(0.8, 1.5, 4);
tailGeometry.rotateZ(-Math.PI / 2);
const tail = new THREE.Mesh(tailGeometry, bodyMaterial);
tail.position.set(-2.5, 0.3, 0);
tail.castShadow = true;
tail.receiveShadow = true;
shark.add(tail);

// Side fins (pectoral fins)
const finGeometry = new THREE.ConeGeometry(0.3, 1, 4);
finGeometry.rotateZ(Math.PI / 2);
finGeometry.rotateY(Math.PI / 4);

const leftFin = new THREE.Mesh(finGeometry, bodyMaterial);
leftFin.position.set(0.5, -0.5, 0.8);
leftFin.castShadow = true;
leftFin.receiveShadow = true;
shark.add(leftFin);

const rightFin = new THREE.Mesh(finGeometry.clone(), bodyMaterial);
rightFin.position.set(0.5, -0.5, -0.8);
rightFin.rotation.y *= -1;
rightFin.castShadow = true;
rightFin.receiveShadow = true;
shark.add(rightFin);

// Eyes
const eyeGeometry = new THREE.SphereGeometry(0.1, 16, 16);
const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
leftEye.position.set(1.8, 0.3, 0.3);
leftEye.castShadow = true;
shark.add(leftEye);

const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
rightEye.position.set(1.8, 0.3, -0.3);
rightEye.castShadow = true;
shark.add(rightEye);

/**
 * Ocean floor (simple plane)
 */
const floorGeometry = new THREE.PlaneGeometry(50, 50);
const floorMaterial = new THREE.MeshStandardMaterial({
  map: grassColorTexture,
  aoMap: grassAmbientOcclusionTexture,
  normalMap: grassNormalTexture,
  roughnessMap: grassRoughnessTexture,
});
grassColorTexture.repeat.set(8, 8);
grassAmbientOcclusionTexture.repeat.set(8, 8);
grassNormalTexture.repeat.set(8, 8);
grassRoughnessTexture.repeat.set(8, 8);
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -5;
floor.receiveShadow = true;
floor.geometry.setAttribute(
  "uv2",
  new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2)
);
grassColorTexture.wrapS = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping;
grassNormalTexture.wrapS = THREE.RepeatWrapping;
grassRoughnessTexture.wrapS = THREE.RepeatWrapping;
grassColorTexture.wrapT = THREE.RepeatWrapping;
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping;
grassNormalTexture.wrapT = THREE.RepeatWrapping;
grassRoughnessTexture.wrapT = THREE.RepeatWrapping;
scene.add(floor);

/**
 * Lights
 */
// Ambient Light
const ambientLight = new THREE.AmbientLight(
  parameters.ambientLightColor,
  parameters.ambientLightIntensity
);
scene.add(ambientLight);

// Directional Light (simulating sunlight from above water)
const directionalLight = new THREE.DirectionalLight(
  parameters.directionalLightColor,
  parameters.directionalLightIntensity
);
directionalLight.position.set(5, 10, 5);
directionalLight.castShadow = true;
scene.add(directionalLight);

// Point Light
const pointLight = new THREE.PointLight(
  parameters.pointLightColor,
  parameters.pointLightIntensity,
  100
);
pointLight.position.set(-3, 3, 3);
scene.add(pointLight);

// Additional underwater light (bluish)
const underwaterLight = new THREE.PointLight(0x4da6ff, 0.5, 20);
underwaterLight.position.set(0, -2, 5);
scene.add(underwaterLight);

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
  antialias: true,
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

  // Ocean wave background animation - only if enabled
  if (parameters.enableBackgroundAnimation) {
    const blue =
      Math.sin(elapsedTime * parameters.backgroundAnimationSpeed) * 0.5 + 0.5;
    const bgColor = new THREE.Color(0.1, 0.3 + blue * 0.2, 0.4 + blue * 0.3);
    renderer.setClearColor(bgColor);
    scene.fog.color = bgColor;
  } else {
    // Use static background color when animation is disabled
    renderer.setClearColor(parameters.backgroundColor);
    scene.fog.color.set(parameters.backgroundColor);
  }

  // Shark swimming animation
  if (parameters.enableSharkAnimation) {
    // Circular swimming motion
    shark.position.x =
      Math.cos(elapsedTime * parameters.sharkSwimSpeed * 0.3) * 5;
    shark.position.z =
      Math.sin(elapsedTime * parameters.sharkSwimSpeed * 0.3) * 5;
    shark.position.y =
      Math.sin(elapsedTime * parameters.sharkSwimSpeed * 0.5) * 0.5;

    // Shark rotation to follow path
    shark.rotation.y = elapsedTime * parameters.sharkRotationSpeed * 0.3;
  }

  // Tail wagging animation
  if (parameters.enableTailWag) {
    tail.rotation.y = Math.sin(elapsedTime * 5) * 0.3;
  }

  // Fin movement
  if (parameters.enableFinMovement) {
    leftFin.rotation.z = Math.sin(elapsedTime * 4) * 0.2;
    rightFin.rotation.z = Math.sin(elapsedTime * 4) * 0.2;
    dorsalFin.rotation.x = Math.sin(elapsedTime * 3) * 0.1;
  }

  // Animate underwater light
  underwaterLight.intensity = 0.5 + Math.sin(elapsedTime * 2) * 0.3;

  controls.update();
  renderer.render(scene, camera);
  window.requestAnimationFrame(tick);
};

tick();
