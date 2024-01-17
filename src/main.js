import { Point, PointCloud, Result, PDollarRecognizer } from "./pdollar.js";
import getImgPath from "./utils.js";

let isDrawing = false;
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

const recognizeBtn = document.querySelector(".recognize-btn");
const clearBtn = document.querySelector(".clear-btn");
const resultBox = document.querySelector(".result");

window.addEventListener("load", () => {
	canvas.addEventListener("mousedown", startStroke);
	canvas.addEventListener("mousemove", recordStroke);
	canvas.addEventListener("mouseup", endStroke);
	canvas.addEventListener("touchstart", startStroke);
	canvas.addEventListener("touchmove", recordStroke);
	// TODO
	canvas.addEventListener("touchend", endStroke);
	clearBtn.addEventListener("click", clearCanvas);
	recognizeBtn.addEventListener("click", recognizeStroke);
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

function startStroke(event) {
	let x = event.clientX || event.touches[0].clientX;
	let y = event.clientY || event.touches[0].clientY;
	// Disable drag-select
	document.onselectstart = function () { return false; };
	document.onmousedown = function () { return false; };
	isDrawing = true;
	x -= canvasRect.x - (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
	y -= canvasRect.y - (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
	// starting a new gesture
	if (strokeID == 0) {
		currentStrokePts.length = 0;
		ctx.clearRect(0, 0, canvasRect.width, canvasRect.height);
	}
	currentStrokePts[currentStrokePts.length] = new Point(x, y, ++strokeID);
}

function recordStroke(event) {
	if (isDrawing) {
		let x = event.clientX || event.touches[0].clientX;
		let y = event.clientY || event.touches[0].clientY;
		x -= canvasRect.x - (document.documentElement && document.documentElement.scrollLeft) || document.body.scrollLeft;
		y -= canvasRect.y - (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
		// Push the points into array
		currentStrokePts.push(new Point(x, y, strokeID));
		drawConnectedPoint(currentStrokePts.length - 2, currentStrokePts.length - 1);
	} else {
		return;
	}
}

function endStroke(event) {
	// Enable drag-select
	document.onselectstart = function () { return true; };
	document.onmousedown = function () { return true; };
	isDrawing = isDrawing ? false : true;
}

function recognizeStroke(points) {
	points = currentStrokePts;
	if (points.length >= 10) {
		let result = recognizer.Recognize(points);
		console.log("Result: " + result.Name + " (" + round(result.Score, 2) + ") in " + result.Time + " ms.");
		loadResultImg(result.Name);
	}
	else {
		console.log("Too little input made. Please try again.");
	}
	// Signal to begin new gesture on next mouse/touchdown
	strokeID = 0;
}

// Round 'n' to 'd' decimals
function round(n, d)
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
