import { Point, PointCloud, Result, PDollarRecognizer } from "./pdollar.js";
import { zhuyin } from "./charList.js";
import { bgm, sfx } from "./sound.js";
import * as PIXI from "pixi.js";
import Matter from "matter-js";

let recognizer = new PDollarRecognizer();
// Store current stroke data
let drawData = {
	currentPoints: [],
	strokeId: 0,
	coord: {x: 0, y: 0},
	isDrawing: false
};

let isMuted = false;

// Init PIXI canvas
const app = new PIXI.Application({
	resizeTo: window,
	background: "#fee9f6",
	antialias: true,
});

document.body.appendChild(app.view);
// Set interactivity
app.stage.eventMode = "static";
app.stage.hitArea = app.screen;

const volumeIcon = PIXI.Sprite.from("assets/volume.svg");
[volumeIcon.x, volumeIcon.y, volumeIcon.width, volumeIcon.height] = [10, 10, 30, 30];
app.stage.addChild(volumeIcon);
volumeIcon.cursor = "pointer";
volumeIcon.eventMode = "static";

const wallTexture = PIXI.Texture.from("/assets/wall.png");
const wallSprite = new PIXI.Sprite(wallTexture);
wallSprite.width = app.screen.width * 2 / 3;
wallSprite.height = app.screen.height;
wallSprite.x = app.screen.width / 3;
wallSprite.y = 0;
wallSprite.alpha = 0.2;
wallSprite.tint = 0x00FF00;
wallSprite.eventMode = "static";
app.stage.addChild(wallSprite);

const hintSprite = PIXI.Sprite.from("assets/hint.svg");
[hintSprite.x, hintSprite.y] = [50, 200];
app.stage.addChild(hintSprite);
hintSprite.cursor = "pointer";
hintSprite.eventMode = "static";
const hintModal = document.querySelector(".hint");
hintSprite.addEventListener("pointertap", () => {
	hintModal.showModal();
});
const hintCloseBtn = document.querySelector(".hint-close-btn");
hintCloseBtn.addEventListener("pointerdown", () => {
	hintModal.close();
});

// Load game assets
const sheet = await PIXI.Assets.load("assets/sheet.json");
const deer = PIXI.Sprite.from("assets/deer.svg");
const ground = PIXI.Sprite.from("assets/ground.png");
[ground.x, ground.y, ground.width, ground.height] = [app.screen.width / 2, app.screen.height, app.screen.width, 200];
ground.anchor.set(0.5);
[deer.x, deer.y, deer.width, deer.height] = [100, 400, 200, 200]; 
deer.anchor.set(0.5);
deer.eventMode = "static";
deer.cursor = "pointer";
app.stage.addChild(deer, ground);

const charsContainer = new PIXI.Container();
charsContainer.width = app.screen.width / 2;
charsContainer.height = app.screen.height / 2;
charsContainer.pivot.x = charsContainer.width / 2;
charsContainer.pivot.y = charsContainer.height / 2;
app.stage.addChild(charsContainer);

const handDrawnArea = new PIXI.Graphics();
charsContainer.addChild(handDrawnArea);

wallSprite.addEventListener("pointerdown", startStroke);
wallSprite.addEventListener("pointermove", recordStroke);
wallSprite.addEventListener("pointerup", endStroke);
deer.addEventListener("pointertap", () => {
	if (drawData.currentPoints.length < 10) {
		alert("輸入資料不足");
		handDrawnArea.clear();
		return;
	}
	const resultChar = recognizeStroke(drawData.currentPoints);
	loadTargetChar(zhuyin, charsContainer, resultChar);
});

// Mute bgm/sfx button
volumeIcon.addEventListener("pointertap", () => {
	isMuted = !isMuted;
	bgm.mute(isMuted);
});

// Play bgm
bgm.play();

const engine = Matter.Engine.create();
const deerBody = Matter.Bodies.rectangle(deer.x, deer.y, deer.width, deer.height);
const groundBody = Matter.Bodies.rectangle(app.screen.width / 2, app.screen.height, app.screen.width, 200, { isStatic: true });
const mouseConstraint = Matter.MouseConstraint.create(engine, {
	element: app.view
});

Matter.Composite.add(engine.world, [deerBody, groundBody, mouseConstraint]);

// Constantly update screen
app.ticker.add((delta) => {
	[deer.x, deer.y] = [deerBody.position.x, deerBody.position.y];
	Matter.Engine.update(engine, delta * 1000 / 60);
});

function startStroke(event) {
	drawData.isDrawing = true;
	[drawData.coord.x, drawData.coord.y] = [event.globalX, event.globalY];
	handDrawnArea.lineStyle({ width: 5, color: "blue", cap: "round" });
	drawData.currentPoints.push(new Point(Math.round(drawData.coord.x), Math.round(drawData.coord.y), ++drawData.strokeId));
}

function recordStroke(event) {
	if(!drawData.isDrawing) return;
	handDrawnArea.moveTo(drawData.coord.x, drawData.coord.y);
	handDrawnArea.lineTo(event.globalX, event.globalY);
	// Update drawData.coord
	[drawData.coord.x, drawData.coord.y] = [event.globalX, event.globalY];
	// Push the points into array
	drawData.currentPoints.push(new Point(Math.round(drawData.coord.x), Math.round(drawData.coord.y), drawData.strokeId));
}

function endStroke() {
	drawData.isDrawing = !drawData.isDrawing;
}

function recognizeStroke(points) {
	let result = recognizer.Recognize(points);
	console.log("Result: " + result.Name + " (" + result.Score + ") in " + result.Time + " ms.");
	// Signal to begin new gesture on next mouse/touchdown
	drawData.strokeId = 0;
	drawData.currentPoints = [];
	if(result.Score < 0.5) {
		alert("無法辨識");
		return;
	}
	return result.Name;
}

async function loadTargetChar(framesArr, container, target) {
	handDrawnArea.clear();
	if (!target) return;
	const foundChar = framesArr.find((char) => {
		return char.slice(0, char.length - 4) === target;
	});
	const charSprite = PIXI.Sprite.from(foundChar);
	charSprite.x = Math.floor(Math.random() * (app.screen.width * 2 / 3)) + app.screen.width / 3;
	charSprite.y = Math.floor(Math.random() * (app.screen.height)) + 1;
	container.addChild(charSprite);
	sfx.play();
	// Create body for char sprite
	const charBody = Matter.Bodies.rectangle(charSprite.x, charSprite.y, charSprite.width, charSprite.height);
	Matter.Composite.add(engine.world, charBody);
	app.ticker.add((delta) => {
		charSprite.x = charBody.position.x;
		charSprite.y = charBody.position.y;
		Matter.Engine.update(engine, delta * 1000 / 60);
	});
}
