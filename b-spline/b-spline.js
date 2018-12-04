const canvas = document.getElementById("cartesianCanvas");
const ctx = canvas.getContext("2d");
const PI = Math.PI;

// The calcs comes from here https://github.com/Cleveroad/DroidArt/blob/bcca64e1e683bbd2e060bbdc0789a7173876bd19/library/src/main/java/com/cleveroad/droidart/ChangeViewTextSettings.kt

const DEFAULT_STEP = 0.0008;
const START_POSITION_CURVE = 0;
const END_POSITION_CURVE = 1;
const DEFAULT_ARRAY_VALUE = 0;
const DEFAULT_NUMBER_VERTEX = 0;
const INDEX_COOR_X = 0;
const INDEX_COOR_Y = 1;
const DEFAULT_ZOOM = 10;
let mousePos;
let userPositions = [];
let drawLineBox = true;

const canvasConfig = {
    background: 'white' 
};

function updateCanvasDimensions(canvasElement) {
    canvasElement.width = window.innerHeight * 0.95 //document.body.offsetWidth;
    canvasElement.height = window.innerHeight * 0.95;
}

function drawXAxis(context, canvas) {
    R.map(
      x => drawPoint(context, canvas, [x, 0], {color: 'black'})
    )(R.range(-canvas.width, canvas.width))
}

function drawYAxis(context, canvas) {
    R.map(
      y => drawPoint(context, canvas, [0, y], {color: 'black'})
    )(R.range(-canvas.height, canvas.height))
}

function drawVector(context, canvas, pointOne, pointTwo){
  const [fY, fX] = pointOne;
  const [sY, sX] = pointTwo;

  const yMiddle = canvas.height / 2;
  const xMiddle = canvas.width / 2;
  
  context.beginPath();
  context.fillStyle = 'green'
  context.moveTo(yMiddle+(fY*DEFAULT_ZOOM), xMiddle-(fX*DEFAULT_ZOOM));
  context.lineTo(yMiddle+(sY*DEFAULT_ZOOM), xMiddle-(sX*DEFAULT_ZOOM));
  context.stroke();
  context.closePath();
}

function drawPointList(context, canvas, list){
  let lastPoint = null
  list.forEach((point) => {
    if(lastPoint !== null){
      drawVector(context, canvas, lastPoint, point);
    } 
    
    lastPoint = point
  })
}

function drawPoint(context, canvas, [rX, rY], configs = {}) { 
    const { distance, color, magnify } = R.merge(
      {distance: DEFAULT_ZOOM, color: 'red', magnify: 2},
      configs
    );
    const yMiddle = canvas.height / 2;
    const xMiddle = canvas.width / 2;
    const x = (rX * distance);
    const y = (rY * distance);

    context.beginPath();
    context.fillStyle = color;
    context.rect(xMiddle+x, yMiddle-y, 1*magnify, 1*magnify);
    context.fill();
    context.closePath();
}

function fillCanvas(context, canvas, canvasConfiguration) {
    context.beginPath();
    context.rect(0, 0, canvas.width, canvas.height);
    context.fillStyle = canvasConfiguration.background;
    context.fill();
    context.closePath();
}



function draw() {
    updateCanvasDimensions(canvas);
    var halfX = canvas.width / 2;
    var halfY = canvas.height / 2;

    fillCanvas(ctx, canvas, canvasConfig);
    drawXAxis(ctx, canvas);
    drawYAxis(ctx, canvas);
    mousePos && drawPoint(ctx, canvas, mousePos, {magnify:5, color: 'grey'});
    // If you want to give more weight to the point, just repeat it
    const points = [
      [-15, 20],
      [-15, -20],
      ...(userPositions.length ? userPositions : []),
      mousePos || [0, -5]
    ];
    const curvePoints = getBezierCurve(points);
  
    if(drawLineBox){
      // Draw the vectors from point x to y
      drawPointList(ctx, canvas, points);

      // Draw the main points dots
      points.forEach(point => drawPoint(ctx, canvas, point, {color: 'blue', magnify:5}));
    }
    
    // Draw the bezier curve dots
    curvePoints.forEach(point => drawPoint(ctx, canvas, point));

    window.requestAnimationFrame(draw);
}

function fact(num) {
    var rval = 1;
    for (var i = 2; i <= num; i++)
        rval = rval * i;
    return rval;
}

function getBezierBasis(numberVertex, numberVertices, positionCurve) {
    return (
        fact(numberVertices) / (fact(numberVertex) * fact(numberVertices - numberVertex))
    ) * Math.pow(positionCurve, numberVertex) * Math.pow(1 - positionCurve, (numberVertices - numberVertex))

}

function getBezierCurve(arr, step = DEFAULT_STEP) {

    const coordinateCurve = []

    let positionCurve = START_POSITION_CURVE
    while (positionCurve < END_POSITION_CURVE + step) {
        if (positionCurve > END_POSITION_CURVE) {
            positionCurve = END_POSITION_CURVE
        }

        const index = coordinateCurve.length

        coordinateCurve.splice(index, 0, [DEFAULT_ARRAY_VALUE, DEFAULT_ARRAY_VALUE])

        let numberVertex = DEFAULT_NUMBER_VERTEX
        while (numberVertex < arr.length) {
            const b = getBezierBasis(numberVertex, arr.length - 1, positionCurve)

            coordinateCurve[index][INDEX_COOR_X] += (arr[numberVertex][INDEX_COOR_X] * b)
            coordinateCurve[index][INDEX_COOR_Y] += (arr[numberVertex][INDEX_COOR_Y] * b)
            numberVertex++
        }
        positionCurve += step
    }

    return coordinateCurve
}

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  const yMiddle = canvas.height / 2;
  const xMiddle = canvas.width / 2;
  return [
    (evt.clientX - rect.left - xMiddle - 10)/10,
    (yMiddle - evt.clientY - rect.top + 25)/10
  ];
}


let shouldTrackmove = false;

canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(canvas, evt); 
}, false);

canvas.addEventListener('click', function(evt) {
  userPositions = [...userPositions, getMousePos(canvas, evt)]
}, false);

document
  .getElementById("clear")
  .addEventListener('click', () => userPositions = []);

document
  .getElementById("toggleBox")
  .addEventListener('click', () => drawLineBox = !drawLineBox);

window.requestAnimationFrame(draw);
