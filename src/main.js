import { Point, PointCloud, Result, PDollarRecognizer } from "./pdollar.js";
import { zhuyin } from "./charList.js";
import * as PIXI from "pixi.js";

let isDrawing = false;
let recognizer = new PDollarRecognizer();
// Store current stroke points
let currentStrokePts = [];
let strokeID = 0;
let coord = {
	x: 0,
	y: 0
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

async function loadChars(framesArr) {
	const sheet = await PIXI.Assets.load("assets/sheet.json");
	framesArr.map((frame) => {
		const sprite = PIXI.Sprite.from(frame);
		sprite.x = Math.floor(Math.random() * (window.innerWidth * 0.9)) + 1;
		sprite.y = Math.floor(Math.random() * (window.innerHeight * 0.9)) + 1;
		app.stage.addChild(sprite);
	});
}

loadChars(zhuyin);
const deer = PIXI.Sprite.from("assets/deer.svg");
deer.x = 150;
deer.y = 400;
deer.anchor.set(0.5);
deer.eventMode = "static";
app.stage.addChild(deer);


const container = new PIXI.Container();
container.width = window.innerWidth;
container.height = window.innerHeight;
const drawArea = new PIXI.Graphics();

container.addChild(drawArea);
app.stage.addChild(container);

app.stage.addEventListener("pointerdown", startStroke);
app.stage.addEventListener("pointermove", recordStroke);
app.stage.addEventListener("pointerup", endStroke);
deer.addEventListener("pointertap", (event) => recognizeStroke(currentStrokePts));

function startStroke(event) {
	// Disable drag-select
	document.onselectstart = function () { return false; };
	document.onmousedown = function () { return false; };
	
	isDrawing = true;
	coord.x = event.globalX;
	coord.y = event.globalY;
	drawArea.lineStyle({ width: 5, color: "blue", cap: "round" });
	// starting a new gesture
	if (strokeID === 0) {
		currentStrokePts.length = 0;
		drawArea.clear();
	}
	currentStrokePts[currentStrokePts.length] = new Point(coord.x, coord.y, ++strokeID);
}

function recordStroke(event) {
	if(!isDrawing) return;
	drawArea.moveTo(coord.x, coord.y);
	drawArea.lineTo(event.globalX, event.globalY);
	[coord.x, coord.y] = [event.globalX, event.globalY];
	// Push the points into array
	currentStrokePts.push(new Point(coord.x, coord.y, strokeID));
}

function endStroke(event) {
	// Enable drag-select
	document.onselectstart = function () { return true; };
	document.onmousedown = function () { return true; };
	isDrawing = !isDrawing;
}

function recognizeStroke(points) {
	if (points.length >= 10) {
		let result = recognizer.Recognize(points);
		console.log("Result: " + result.Name + " (" + round(result.Score, 2) + ") in " + result.Time + " ms.");
	}
	else {
		console.log("Too little input made. Please try again.");
	}
	// Signal to begin new gesture on next mouse/touchdown
	strokeID = 0;
}

// Round 'n' to 'd' decimals
function round(n, d) {
	d = Math.pow(10, d);
	return Math.round(n * d) / d;
}
