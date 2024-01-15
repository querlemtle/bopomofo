import { Point, PointCloud, Result, PDollarRecognizer } from "./pdollar.js";
import getImgPath from "./utils.js";

let isPressed = false;
let recognizer = new PDollarRecognizer();
// Store current stroke points
let currentStrokePts = [];
let strokeID = 0;
const canvas = document.querySelector(".canvas");
const ctx = canvas.getContext("2d");
ctx.lineWidth = 3;
ctx.lineCap = "round";
ctx.strokeStyle = "red";
const canvasRect = getCanvasRect(canvas);

const clearBtn = document.querySelector(".clear-btn");
const resultBox = document.querySelector(".result");

window.addEventListener("load", () => {
	canvas.addEventListener("mousedown", startStroke);
	canvas.addEventListener("mouseup", endStroke);
	canvas.addEventListener("mousemove", recordStroke);
	clearBtn.addEventListener("click", clearCanvas);
});

function getCanvasRect(canvas) {
	let w = canvas.width;
	let h = canvas.height;

	let cx = canvas.offsetLeft;
	let cy = canvas.offsetTop;
	while (canvas.offsetParent != null) {
		canvas = canvas.offsetParent;
		cx += canvas.offsetLeft;
		cy += canvas.offsetTop;
	}
	return { x: cx, y: cy, width: w, height: h };
}

function drawConnectedPoint(from, to) {
	ctx.beginPath();
	ctx.moveTo(currentStrokePts[from].X, currentStrokePts[from].Y);
	ctx.lineTo(currentStrokePts[to].X, currentStrokePts[to].Y);
	ctx.closePath();
	ctx.stroke();
}

//
// Mouse Events
//
function startStroke(event) {
	let x = event.clientX;
	let y = event.clientY;
	let button = event.button;
	document.onselectstart = function () { return false; }; // disable drag-select
	document.onmousedown = function () { return false; }; // disable drag-select
	if (button <= 1) {
		isPressed = true;
		x -= canvasRect.x - (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		y -= canvasRect.y - (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		// starting a new gesture
		if (strokeID == 0) {
			currentStrokePts.length = 0;
			ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
		}
		currentStrokePts[currentStrokePts.length] = new Point(x, y, ++strokeID);
	}
}

function recordStroke(event) {
	let x = event.clientX;
	let y = event.clientY;
	if (isPressed) {
		x -= canvasRect.x - (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		y -= canvasRect.y - (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		currentStrokePts.push(new Point(x, y, strokeID)); // append
		drawConnectedPoint(currentStrokePts.length - 2, currentStrokePts.length - 1);
	}
}

function endStroke(event) {
	let button = event.button;
	document.onselectstart = function () { return true; }; // enable drag-select
	document.onmousedown = function () { return true; }; // enable drag-select
	if (button <= 1) {
		if (isPressed) {
			isPressed = false;
		}
	}
	else if (button === 2) // segmentation with right-click
	{
		if (currentStrokePts.length >= 10) {
			let result = recognizer.Recognize(currentStrokePts);
			console.log("Result: " + result.Name + " (" + round(result.Score, 2) + ") in " + result.Time + " ms.");
			loadResultImg(result.Name);
		}
		else {
			console.log("Too little input made. Please try again.");
		}
		strokeID = 0; // signal to begin new gesture on next mouse-down
	}
}

function round(n, d) // round 'n' to 'd' decimals
{
	d = Math.pow(10, d);
	return Math.round(n * d) / d;
}

// Clear canvas and result
function clearCanvas() {
	currentStrokePts.length = 0;
	strokeID = 0;
	ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
	resultBox.style.backgroundImage = "";
}

// Result screen
function loadResultImg(name) {
	// Load image based on result
	const path = getImgPath(name);
	resultBox.style.backgroundImage = `url(${path})`;
}