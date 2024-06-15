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
camera.applyMatrix4(new THREE.Matrix4().makeTranslation(0, 3, 110));

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
const textureLoader = new THREE.TextureLoader();
const ballTexture = textureLoader.load("src/textures/soccer_ball.jpg");
const redCardTexture = textureLoader.load("src/textures/red_card.jpg");
const yellowCardTexture = textureLoader.load("src/textures/yellow_card.jpg");

// TODO: Add Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffffff, 1);
translateObject(directionalLight1, 0, 20, 60);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
translateObject(directionalLight1, 0, 20, 30);
scene.add(directionalLight2);

// TODO: Goal
// You should copy-paste the goal from the previous exercise here
const goal = generateGoal();
scene.add(goal);
camera.lookAt(goal.position);

// TODO: Ball
// You should add the ball with the soccer.jpg texture here
const ball = generateBall();
scene.add(ball);

// TODO: Bezier Curves
const rightCurve = createCurve(
  new THREE.Vector3(0, 0, 100),
  new THREE.Vector3(50, 0, 50),
  new THREE.Vector3(0, 0, 0)
);

const centerCurve = createCurve(
  new THREE.Vector3(0, 0, 100),
  new THREE.Vector3(0, 50, 50),
  new THREE.Vector3(0, 0, 0)
);

const leftCurve = createCurve(
  new THREE.Vector3(0, 0, 100),
  new THREE.Vector3(-50, 0, 50),
  new THREE.Vector3(0, 0, 0)
);

const curves = [rightCurve, centerCurve, leftCurve];
class Card {
  constructor(object, curve, t, type) {
    this.object = object;
    this.curve = curve;
    this.t = t;
    this.type = type;
  }

  static generateCardMesh(curve, texture, type) {
    const t = Math.random();
    const point = curve.getPoint(t);
    const cardGeometry = new THREE.PlaneGeometry(1, 1);
    const cardMaterial = new THREE.MeshPhongMaterial({ map: texture });
    const card = new THREE.Mesh(cardGeometry, cardMaterial);
    translateObject(card, point.x, point.y, point.z);

    return new Card(card, curve, t, type);
  }
}

const numCards = 12;
const rightCurveCards = [];
const centreCurveCards = [];
const lefturveCards = [];

for (let i = 0; i < numCards; i++) {
  const curveIndex = Math.floor(i % ((numCards / curves.length) - 1));
  const card = Card.generateCardMesh(
    curves[curveIndex],
    randomSample([redCardTexture, yellowCardTexture], 1)[0],
    randomSample(["red", "yellow"], 1)[0]
  );
  if (curveIndex === 0) {
    rightCurveCards.push(card);
  } else if (curveIndex === 1) {
    centreCurveCards.push(card);
  } else {
    lefturveCards.push(card);
  }
}

const sortFunc = (card1, card2) => card1.t - card2.t;
rightCurveCards.sort(sortFunc);
centreCurveCards.sort(sortFunc);
lefturveCards.sort(sortFunc);

const curvesToCardListMapper = {
  0: rightCurveCards,
  1: centreCurveCards,
  2: lefturveCards,
};

scene.add(
  ...[...rightCurveCards, ...centreCurveCards, ...lefturveCards].map(
    (card) => card.object
  )
);

renderer.render(scene, camera);

// ====================== Controls =============================


let t = 0;
const tIncrementStep = 0.002;
let yellowCardCollisionCounter = 0;
let redCardCollisionCounter = 0;
let currentCurveIndex = 0;

// ====================== Event Listeners =============================

const handle_keydown = (e) => {
  if (e.code == "ArrowLeft") {
    currentCurveIndex = (currentCurveIndex + 1) % curves.length;
  } else if (e.code == "ArrowRight") {
    currentCurveIndex = (currentCurveIndex - 1 + curves.length) % curves.length;
  }
};

document.addEventListener("keydown", handle_keydown);

function animate() {
  setTimeout(function () {
    let animationId = requestAnimationFrame(animate);
    controls.update();
    updateBallPosition(curves[currentCurveIndex], t);
    updateCameraPositionAndDirection(camera, ball);
    testCollision(currentCurveIndex, t);
    t += tIncrementStep;
    renderer.render(scene, camera);
    if (t > 1) {
      alert(`Your score is ${calcScore().toFixed(2)}`);
      cancelAnimationFrame(animationId);
      return;
    }
  }, 1000 / 30);
}
animate();

// ====================== Generate Goal =============================

function generateGoal() {
  const goal = new THREE.Group();

  let material = new THREE.MeshPhongMaterial({ color: 0xffffff });
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

  let netMaterial = new THREE.MeshPhongMaterial({
    color: 0xd3d3d3,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.5,
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
  let ballGeometry = new THREE.SphereGeometry(0.25, 32, 32);
  let ballMaterial = new THREE.MeshPhongMaterial({ map: ballTexture });
  let ball = new THREE.Mesh(ballGeometry, ballMaterial);
  translateObject(ball, 0, 0, 100);

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

function scaleObject(object, xFactor, yFactor, zFactor) {
  const scaleMatrix = new THREE.Matrix4();
  scaleMatrix.makeScale(xFactor, yFactor, zFactor);
  object.applyMatrix4(scaleMatrix);
}

function updateBallPosition(curve, t) {
  if (t >= 1) return;
  const point = curve.getPoint(t);
  ball.position.set(point.x, point.y, point.z);
  translateObject(
    ball,
    point.x - ball.position.x,
    point.y - ball.position.y,
    point.z - ball.position.z
  );
}

function updateCameraPositionAndDirection(camera, ball) {
  const point = centerCurve.getPoint(t);
  translateObject(
    camera,
    point.x - camera.position.x - 5,
    point.y - camera.position.y + 20,
    point.z - camera.position.z + 30
  );
}

function testCollision(curveIndex, tBall) {
  const cardsList = curvesToCardListMapper[curveIndex];
  if (cardsList.length === 0) return;
  const index = cardsList.findIndex(
    (card) => card.t > tBall - tIncrementStep && card.t < tBall + tIncrementStep
  );
  if (index === -1) return;
  const card = cardsList[index];
  card.object.material.visible = false;
  card.type === "red"
    ? redCardCollisionCounter++
    : yellowCardCollisionCounter++;
  cardsList.splice(index, 1);
}

function calcScore() {
  return (
    100 *
    2 *
    (-(yellowCardCollisionCounter + 10 * redCardCollisionCounter) / 10)
  );
}

function randomSample(array, sampleSize) {
  const shuffled = array.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, sampleSize);
}

// ====================== Generate Curves =============================

function createCurve(v0, v1, v2) {
  const curve = new THREE.QuadraticBezierCurve3(v0, v1, v2);
  const geometry = new THREE.BufferGeometry().setFromPoints(
    curve.getPoints(50)
  );
  const material = new THREE.LineBasicMaterial({
    color: 0x000000,
    opacity: 0,
    transparent: true,
  });
  const line = new THREE.Line(geometry, material);
  scene.add(line);

  return curve;
}
