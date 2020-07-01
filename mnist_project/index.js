
const status = document.getElementById('status');
status.innerText = 'Loading model...';

tf.loadLayersModel('https://raw.githubusercontent.com/tsu-nera/tfjs-mnist-study/master/model/model.json')
  .then(pretrainedModel => {
    model = pretrainedModel;
});

status.innerText = 'Ready to draw'

function inference(canvas) {
	const smallCanvas = document.createElement('canvas');
	smallCanvas.width = 28;
	smallCanvas.height = 28;
	smallCanvas.getContext('2d').drawImage(canvas, 0, 0, 28, 28);

	let input = tf.browser.fromPixels(smallCanvas, 1);
	input = tf.cast(input, 'float32').div(tf.scalar(255));
	input = input.expandDims();

	let output = model.predict(input).dataSync();
	argMax = output.indexOf(Math.max(...output));

	output = Array.from(output).map(num => num.toFixed(4) + " ");
	console.log(output);

	return [argMax, output];
}

const pads = new Array();
const canvases = new Array();

for (let i=1; i<=4; i++){
	const canvasName = 'canvas' + i;
	const canvas = document.getElementById(canvasName);
	canvas.width = canvas.height = 280;
	canvases.push(canvas);
}

canvases.forEach(canvas => {
	const pad = new SignaturePad(canvas, {
		minWidth: 9,
		penColor: "white",
		backgroundColor: "black",
	});
	pads.push(pad);
})

const drawButton = document.getElementById('drawButton');
const resetButton = document.getElementById('resetButton');

const predict = document.getElementById('predict');
const prob = document.getElementById('prob');

drawButton.addEventListener('click', () => {
	let predicts = "";
	let probs = "";
	canvases.forEach(canvas => {
		let output = inference(canvas);
		predicts += output[0];
		probs += output[1] + "\n";
	});
	predict.innerText = predicts;
	prob.innerText = probs;
});

resetButton.addEventListener('click', () => {
	pads.forEach(pad => pad.clear());
})