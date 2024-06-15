import { OrbitControls } from "./OrbitControls.js";

// Scene Declartion
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
// This defines the initial distance of the camera, you may ignore this as the camera is expected to be dynamic
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(-5, 3, 110));
camera.lookAt(0, -4, 1);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Here we load the cubemap and pitch images, you may change it

const loader = new THREE.CubeTextureLoader();
const texture = loader.load([
  "src/pitch/right.jpg",
  "src/pitch/left.jpg",
  "src/pitch/top.jpg",
  "src/pitch/bottom.jpg",
  "src/pitch/front.jpg",
  "src/pitch/back.jpg",
]);
scene.background = texture;

// TODO: Texture Loading
// We usually do the texture loading before we start everything else, as it might take processing time

// TODO: Add Lighting

// TODO: Goal
// You should copy-paste the goal from the previous exercise here
const goal = generateGoal();
scene.add(goal);

// TODO: Ball
// You should add the ball with the soccer.jpg texture here

// TODO: Bezier Curves

// TODO: Camera Settings
// Set the camera following the ball here

// TODO: Add collectible cards with textures

renderer.render(scene, camera);
const controls = new OrbitControls(camera, renderer.domElement);

// TODO: Add keyboard event
// We wrote some of the function for you
const handle_keydown = (e) => {
  if (e.code == "ArrowLeft") {
    // TODO
  } else if (e.code == "ArrowRight") {
    // TODO
  }
};
document.addEventListener("keydown", handle_keydown);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  // TODO: Animation for the ball's position

  // TODO: Test for card-ball collision

  renderer.render(scene, camera);
}
animate();

// ====================== Generate Goal =============================

function generateGoal() {
  const goal = new THREE.Group();

  let material = new THREE.MeshBasicMaterial({ color: 0xffffff });
  let goalpostGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 32);
  let crossbarGeometry = new THREE.CylinderGeometry(0.1, 0.1, 6, 32);
  let goalPostRingGeometry = new THREE.SphereGeometry(0.2, 32, 32);
  let backSupportGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2.3, 32);
  let netGeometry = new THREE.PlaneGeometry(6, 2.3);

  let leftPostRing = new THREE.Mesh(goalPostRingGeometry, material);
  scaleObject(leftPostRing, 1, 0.2, 1);
  translateObject(leftPostRing, -3, 0, 0);

  let leftPost = new THREE.Mesh(goalpostGeometry, material);
  translateObject(leftPost, -3, 1, 0);

  let rightPostRing = new THREE.Mesh(goalPostRingGeometry, material);
  scaleObject(rightPostRing, 1, 0.2, 1);
  translateObject(rightPostRing, 3, 0, 0);

  let rightPost = new THREE.Mesh(goalpostGeometry, material);
  translateObject(rightPost, 3, 1, 0);

  let crossbar = new THREE.Mesh(crossbarGeometry, material);
  rotateObject(crossbar, new THREE.Vector3(0, 0, 1), 90);
  translateObject(crossbar, 0, 2, 0);

  let leftBackSupportRing = new THREE.Mesh(goalPostRingGeometry, material);
  scaleObject(leftBackSupportRing, 1, 0.2, 1);
  translateObject(leftBackSupportRing, -3, 0, -1.2);

  let leftBackSupport = new THREE.Mesh(backSupportGeometry, material);
  rotateObject(leftBackSupport, new THREE.Vector3(1, 0, 0), 30);
  translateObject(leftBackSupport, -3, 1, -0.6);

  let rightBackSupportRing = new THREE.Mesh(goalPostRingGeometry, material);
  scaleObject(rightBackSupportRing, 1, 0.2, 1);
  translateObject(rightBackSupportRing, 3, 0, -1.2);

  let rightBackSupport = new THREE.Mesh(backSupportGeometry, material);
  rotateObject(rightBackSupport, new THREE.Vector3(1, 0, 0), 30);
  translateObject(rightBackSupport, 3, 1, -0.6);

  let netMaterial = new THREE.MeshBasicMaterial({
    color: 0xd3d3d3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8,
  });

  let backNet = new THREE.Mesh(netGeometry, netMaterial);
  rotateObject(backNet, new THREE.Vector3(1, 0, 0), 30);
  translateObject(backNet, 0, 0.95, -0.6);

  const vertices = new Float32Array([
    0,
    0,
    0, // Vertex 1
    0,
    2,
    0, // Vertex 2
    0,
    0,
    -1.2, // Vertex 3
  ]);
  let triangleGeometry = new THREE.BufferGeometry();
  triangleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(vertices, 3)
  );

  let leftNet = new THREE.Mesh(triangleGeometry, netMaterial);
  translateObject(leftNet, -3, 0, 0);

  let rightNet = new THREE.Mesh(triangleGeometry, netMaterial);
  translateObject(rightNet, 3, 0, 0);

  return goal.add(
    leftPost,
    leftPostRing,
    rightPost,
    rightPostRing,
    crossbar,
    leftBackSupportRing,
    leftBackSupport,
    rightBackSupportRing,
    rightBackSupport,
    backNet,
    leftNet,
    rightNet
  );
}

// ====================== Generate Ball =============================

function generateBall() {
  let ballGeometry = new THREE.SphereGeometry(0.125, 32, 32);
  let ballMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
  let ball = new THREE.Mesh(ballGeometry, ballMaterial);
  translateObject(ball, 0, 1.5, 2.5);

  return ball;
}

// ====================== Utils =============================

function translateObject(object, x, y, z) {
  const translateMatrix = new THREE.Matrix4();
  translateMatrix.makeTranslation(x, y, z);
  object.applyMatrix4(translateMatrix);
}

function rotateObject(object, axis, angle) {
  const rotationMatrix = new THREE.Matrix4();
  rotationMatrix.makeRotationAxis(axis, degrees_to_radians(angle));
  object.applyMatrix4(rotationMatrix);
}

function degrees_to_radians(degrees) {
  var pi = Math.PI;
  return degrees * (pi / 180);
}

function toggleWireframe(scene) {
  scene.traverse((object) => {
    if (object.isMesh) {
      object.material.wireframe = !object.material.wireframe;
    }
  });
}

function scaleObject(object, xFactor, yFactor, zFactor) {
  const scaleMatrix = new THREE.Matrix4();
  scaleMatrix.makeScale(xFactor, yFactor, zFactor);
  object.applyMatrix4(scaleMatrix);
}
