import * as THREE from 'three';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1000);
camera.position.set(-20, 15, 50);
camera.lookAt(0, 2, 0);

const renderer = new THREE.WebGLRenderer({
  antialias: true,
  powerPreference: "high-performance",
  alpha: true
});

renderer.setClearColor(0x000000, 0);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.physicallyCorrectLights = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
scene.background = null;

scene.add(new THREE.AmbientLight(0xffcfa0, 0.5));
scene.add(new THREE.HemisphereLight(0xffe6b3, 0x442200, 0.9));

const sun = new THREE.DirectionalLight(0xffffff, 1.2);
sun.position.set(5, 25, 5);
scene.add(sun);

const loader = new THREE.TextureLoader();

function createPixelTexture(src) {
  const tex = loader.load(src, () => {}, undefined, () => {});
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

const skinMat = new THREE.MeshStandardMaterial({
  roughness: 0.6,
  metalness: 0,
  map: createPixelTexture("./assets/images/Bob.png")
});

function setUVs(g, faces, w = 64, h = 64) {
  const u = g.attributes.uv.array;
  const inset = 0.1;

  faces.forEach((r, i) => {
    const x1 = (r.x + inset) / w;
    const x2 = (r.x + r.w - inset) / w;
    const y1 = 1 - (r.y + r.h - inset) / h;
    const y2 = 1 - (r.y + inset) / h;
    const o = i * 8;

    u[o] = x1;
    u[o + 1] = y2;
    u[o + 2] = x2;
    u[o + 3] = y2;
    u[o + 4] = x1;
    u[o + 5] = y1;
    u[o + 6] = x2;
    u[o + 7] = y1;
  });

  g.attributes.uv.needsUpdate = true;
}

const bloxdman = new THREE.Group();
scene.add(bloxdman);

let nametagName = "Player";
let nametagImage = "assets/images/red-trees.webp";

function createNametag(name, imageUrl = "https://georgecr0.github.io/Vortex_Preview_Testing/assets/images/red-trees.webp") {
    const canvas = document.createElement("canvas");
    canvas.width = 500;
    canvas.height = 50;

    const ctx = canvas.getContext("2d");
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    texture.colorSpace = THREE.SRGBColorSpace;

    const image = new Image();

    image.onload = () => {
        ctx.clearRect(0, 0, 500, 50);
        ctx.drawImage(image, 0, 0, 500, 50);
        texture.needsUpdate = true;
    };

    image.src = imageUrl;

    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(name, 250, 25);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true
    });

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(2.5, 0.25),
        material
    );

    mesh.position.y = 2.8;

    return mesh;
}

let nametag = createNametag(nametagName, nametagImage);
bloxdman.add(nametag);

function setCharacterName(name) {
  if (typeof name !== "string" || !name.trim()) return;

  nametagName = name.trim();

  bloxdman.remove(nametag);
  nametag = createNametag(nametagName, nametagImage);
  bloxdman.add(nametag);
}

function setNametagImage(imageUrl) {
  if (typeof imageUrl !== "string" || !imageUrl.trim()) return;

  nametagImage = imageUrl.trim();

  bloxdman.remove(nametag);
  nametag = createNametag(nametagName, nametagImage);
  bloxdman.add(nametag);
}

const torsoGeom = new THREE.BoxGeometry(8, 12, 4);

setUVs(torsoGeom, [
  { x: 28, y: 20, w: 4, h: 12 },
  { x: 16, y: 20, w: 4, h: 12 },
  { x: 20, y: 16, w: 8, h: 4 },
  { x: 28, y: 16, w: 8, h: 4 },
  { x: 20, y: 20, w: 8, h: 12 },
  { x: 32, y: 20, w: 8, h: 12 }
]);

const torso = new THREE.Mesh(torsoGeom, skinMat);
torso.castShadow = true;
torso.receiveShadow = true;
bloxdman.add(torso);

const headGeom = new THREE.BoxGeometry(8, 8, 8);

setUVs(headGeom, [
  { x: 16, y: 8, w: 8, h: 8 },
  { x: 0, y: 8, w: 8, h: 8 },
  { x: 8, y: 0, w: 8, h: 8 },
  { x: 16, y: 0, w: 8, h: 8 },
  { x: 8, y: 8, w: 8, h: 8 },
  { x: 24, y: 8, w: 8, h: 8 }
]);

const head = new THREE.Mesh(headGeom, skinMat);
head.position.y = 10;
head.castShadow = true;
head.receiveShadow = true;
torso.add(head);

function makeArm(x) {
  const g = new THREE.BoxGeometry(4, 12, 4);

  setUVs(g, [
    { x: 48, y: 20, w: 4, h: 12 },
    { x: 40, y: 20, w: 4, h: 12 },
    { x: 44, y: 16, w: 4, h: 4 },
    { x: 48, y: 16, w: 4, h: 4 },
    { x: 44, y: 20, w: 4, h: 12 },
    { x: 52, y: 20, w: 4, h: 12 }
  ]);

  const arm = new THREE.Mesh(g, skinMat);
  arm.position.set(x, 0, 0);
  arm.castShadow = true;
  arm.receiveShadow = true;
  torso.add(arm);
}

makeArm(-6);
makeArm(6);

function makeLeg(x) {
  const g = new THREE.BoxGeometry(4, 12, 4);

  setUVs(g, [
    { x: 8, y: 20, w: 4, h: 12 },
    { x: 0, y: 20, w: 4, h: 12 },
    { x: 4, y: 16, w: 4, h: 4 },
    { x: 8, y: 16, w: 4, h: 4 },
    { x: 4, y: 20, w: 4, h: 12 },
    { x: 12, y: 20, w: 4, h: 12 }
  ]);

  const leg = new THREE.Mesh(g, skinMat);
  leg.position.set(x, -12, 0);
  leg.castShadow = true;
  leg.receiveShadow = true;
  torso.add(leg);
}

makeLeg(-2);
makeLeg(2);

window.addEventListener("message", event => {
  const data = event.data;

  if (!data || data.type !== "character-control") return;

  if (typeof data.name === "string") {
    setCharacterName(data.name);
  }

  if (typeof data.nametagImage === "string") {
    setNametagImage(data.nametagImage);
  }
});

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

let dragging = false;
let lastX = 0;
let targetRotationY = 0;
let currentRotationY = 0;

const rotationSpeed = 0.008;
const smoothness = 0.12;

renderer.domElement.addEventListener("pointerdown", event => {
  dragging = true;
  lastX = event.clientX;
  renderer.domElement.setPointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointermove", event => {
  if (!dragging) return;

  const deltaX = event.clientX - lastX;
  targetRotationY += deltaX * rotationSpeed;
  lastX = event.clientX;
});

renderer.domElement.addEventListener("pointerup", event => {
  dragging = false;
  renderer.domElement.releasePointerCapture(event.pointerId);
});

renderer.domElement.addEventListener("pointercancel", () => {
  dragging = false;
});

function animate() {
  requestAnimationFrame(animate);

  currentRotationY +=
    (targetRotationY - currentRotationY) * smoothness;

  bloxdman.rotation.y = currentRotationY;

  renderer.render(scene, camera);
}

animate();
