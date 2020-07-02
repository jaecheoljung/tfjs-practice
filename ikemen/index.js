
const status = document.getElementById('status');
status.innerText = 'Loading Model....';

const modelURL = "https://raw.githubusercontent.com/tsu-nera/tfjs-moteone/master/model/model.json";
tf.loadLayersModel(modelURL)
  .then(pretrainedModel => {
    model = pretrainedModel;
    status.innerText = 'Ready to score';
});

const file = document.getElementById('file');
const uploadCanvas = document.getElementById('uploadCanvas');
uploadCanvas.width = uploadCanvas.height = 300;

file.addEventListener('change', () => {
	const reader = new FileReader();
	reader.addEventListener('load', (e) => {
		const img = new Image;
		img.onload = function () {
			uploadCanvas.getContext('2d').drawImage(img, 0, 0, 300, 300);
		}
		img.src = e.target.result;
	});
	reader.readAsDataURL(file.files[0]);
})


const webcam = document.getElementById('webcam');
const webcamOnButton = document.getElementById('webcamOnButton');
const webcamOffButton = document.getElementById('webcamOffButton');


webcamOnButton.addEventListener('click', function() {
	webcam.style.display = 'block';
	webcam.width = 300;
	webcam.height = 300;
	
	navigator.mediaDevices.getUserMedia({ video: true })
			 .then(function (stream) {
			 	webcam.srcObject = stream;
			 });
});

webcamOffButton.addEventListener('click', function() {
	webcam.style.display = 'none';
	clearInterval(timer);
	const stream = webcam.srcObject;
	const tracks = stream.getTracks();
	tracks[0].stop();
});

const webcamCanvas = document.getElementById('webcamCanvas');
webcamCanvas.width = webcamCanvas.height = 300;

const timer = setInterval(function () {
	webcamCanvas.getContext('2d').drawImage(webcam, 0, 0, 300, 300);
}, 1000);




function inference(canvas) {

	const smallCanvas = document.createElement('canvas');
	smallCanvas.height = 160;
	smallCanvas.width = 160;
	smallCanvas.getContext('2d').drawImage(canvas, 0, 0, 160, 160);

	let input = tf.browser.fromPixels(smallCanvas);
	input = tf.cast(input, 'float32').div(tf.scalar(255));
	input = input.expandDims();
	return model.predict(input);
}



const scoreButton = document.getElementById('scoreButton');
const scoreLabel = document.getElementById('scoreLabel');

scoreButton.onclick = function(e) {
		function scoring(canvas) {
			let score = inference(canvas);
			score = score.dataSync();
			score = score[0] * 100;
			score = score.toFixed(3);
			return score;
		}

	scoreLabel.innerText = "사진 " + scoring(uploadCanvas) + "점, 웹캠 " + scoring(webcamCanvas) +"점";
}
