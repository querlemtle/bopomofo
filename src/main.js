import { Point, PointCloud, Result, PDollarRecognizer } from "./pdollar.js";
import { zhuyin } from "./charList.js";
import * as PIXI from "pixi.js";
import * as Matter from "matter-js";

let recognizer = new PDollarRecognizer();
// store current stroke data
let drawData = {
	currentPoints: [],
	strokeId: 0,
	coord: {x: 0, y: 0},
	isDrawing: false
};

const app = new PIXI.Application({
	resizeTo: window,
	background: "#fee9f6",
	antialias: true,
});

document.body.appendChild(app.view);
// Set interactivity
app.stage.eventMode = "static";
app.stage.hitArea = app.screen;

// Load game assets
const sheet = await PIXI.Assets.load("assets/sheet.json");
const deer = PIXI.Sprite.from("assets/deer.svg");
deer.x = 150;
deer.y = 400;
deer.anchor.set(0.5);
deer.eventMode = "static";
deer.cursor = "pointer";
app.stage.addChild(deer);

const charsContainer = new PIXI.Container();
charsContainer.width = app.screen.width / 2;
charsContainer.height = app.screen.height / 2;
charsContainer.pivot.x = charsContainer.width / 2;
charsContainer.pivot.y = charsContainer.height / 2;
app.stage.addChild(charsContainer);

const handDrawnArea = new PIXI.Graphics();
charsContainer.addChild(handDrawnArea);

app.stage.addEventListener("pointerdown", startStroke);
app.stage.addEventListener("pointermove", recordStroke);
app.stage.addEventListener("pointerup", endStroke);
deer.addEventListener("pointertap", () => {
	if (drawData.currentPoints.length < 10) {
		alert("輸入資料不足");
		return;
	}
	const resultChar = recognizeStroke(drawData.currentPoints);
	loadTargetChar(zhuyin, charsContainer, resultChar);
});

function startStroke(event) {
	drawData.isDrawing = true;
	drawData.coord.x = event.globalX;
	drawData.coord.y = event.globalY;
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
	return result.Name;
}

async function loadTargetChar(framesArr, container, target) {
	const foundChar = framesArr.find((char) => {
		return char.slice(0, char.length - 4) === target;
	});
	const charSprite = PIXI.Sprite.from(foundChar);
	charSprite.x = Math.floor(Math.random() * (window.innerWidth)) + 1;
	charSprite.y = Math.floor(Math.random() * (window.innerHeight)) + 1;
	container.addChild(charSprite);
	handDrawnArea.clear();
}
