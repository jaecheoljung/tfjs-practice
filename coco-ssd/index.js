const root = document.documentElement;
const status = document.getElementById('status');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const founds = document.getElementById('founds');
const file = document.getElementById('file');
const on = document.getElementById('on');
const off = document.getElementById('off');
const video = document.createElement('video');
video.autoplay = true;

let cocossd;
status.innerText = 'Loading model....';
cocoSsd.load().then(model => {
	cocossd = model;
	status.innerText = 'Ready to play';
	file.disabled = false;
	on.disabled = false;
	off.disabled = false;
})


function drawCanvas () {
	canvas.width = 400;
	canvas.height = 400 * (this.height / this.width);
	ctx.drawImage(this, 0, 0, canvas.width, canvas.height);
}

function clearCanvas () {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	canvas.width = 400;
	canvas.height = 300;
	founds.innerText = "";
}


file.addEventListener('change', function () {
	const reader = new FileReader();
	reader.addEventListener('load', (e) => {
		const img = new Image;
		img.onload = drawCanvas;
		img.src = e.target.result;
	});
	reader.readAsDataURL(file.files[0]);
})


let timerId;
on.addEventListener('click', function() {
	navigator.mediaDevices.getUserMedia({ video: true })
			 .then(function (stream) {
			 	video.srcObject = stream;
			 });
 	canvas.width = 600;
	canvas.height = 400
	timerId = setInterval(function () {
		ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		inference();
	}, 50);
});

off.addEventListener('click', function() {
	clearInterval(timerId);
	clearCanvas();
	const stream = video.srcObject;
	const tracks = stream.getTracks();
	tracks[0].stop();
});

let colorDict = {};

function getColor(str) {
	if (str in colorDict == false){
		colorDict[str] = "#" + Math.random().toString(16).substr(2,6);
	}
	return colorDict[str];
}

function draw(pred) {
	label = pred["class"];
	bbox = pred["bbox"];
	ctx.strokeStyle = getColor(label);
	ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3]);
	
	x = bbox[0];
	y = bbox[1] - 30;
	w = 150;
	h = 30;
	ctx.fillStyle = getColor(label);
	ctx.fillRect(x, y, w, h);

	ctx.fillStyle = 'white';
	ctx.font = '25px MuseoModerno';
	ctx.fillText(label, x, y + 25);
}

function inference() {
	status.innerText = 'Finding objects......';
	cocossd.detect(canvas).then(predictions => {
		founds.innerText = "";
		predictions.forEach(pred => {
			bbox = pred["bbox"];
			bbox = bbox.map(x => x.toFixed(2));
			label = pred["class"];
			score = pred["score"].toFixed(2);
			founds.innerText += `${label}, (x,y,w,h)=${bbox}, score=${score}\n`;
			draw(pred);
		});
		status.innerText = 'Ready to play';
	});
}

canvas.addEventListener('mouseup', inference);