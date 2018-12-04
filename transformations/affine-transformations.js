/**
 * Created by gabriel.rohden on 06/11/2018.
 */
const canvas = document.getElementById("cartesianCanvas");
const ctx = canvas.getContext("2d");
const DEFAULT_ZOOM = 10;
const { PI } = Math;
const canvasConfig = {
  background: 'white'
}

let mousePos =  [0, -5];

function updateCanvasDimensions(canvasElement) {
    const minor = window.innerHeight > window.innerWidth ?  window.innerWidth : window.innerHeight;
    canvasElement.width = minor * 0.95;
    canvasElement.height = minor * 0.95;
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
  const [fX, fY] = pointOne;
  const [sX, sY] = pointTwo;

  const yMiddle = canvas.height / 2;
  const xMiddle = canvas.width / 2;
  
  context.beginPath();
  context.fillStyle = 'green'
  context.moveTo(xMiddle+(fX*DEFAULT_ZOOM), yMiddle-(fY*DEFAULT_ZOOM));
  context.lineTo(xMiddle+(sX*DEFAULT_ZOOM), yMiddle-(sY*DEFAULT_ZOOM));
  context.stroke();
  context.closePath();
}

function drawPointMatrix(context, canvas, list){
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

function getMousePos(canvas, evt) {
  var rect = canvas.getBoundingClientRect();
  const yMiddle = canvas.height / 2;
  const xMiddle = canvas.width / 2;
  return [
    (evt.clientX - rect.left - xMiddle - 10)/10,
    (yMiddle - evt.clientY - rect.top + 25)/10
  ];
}

function draw(drawables = []){
    updateCanvasDimensions(canvas);
    const halfX = canvas.width/2;
    const halfY = canvas.height/2;

    fillCanvas(ctx, canvas, canvasConfig);
    drawXAxis(ctx, canvas);
    drawYAxis(ctx, canvas);
  
    drawables.forEach((d) => d.draw(ctx, canvas))  
    window.requestAnimationFrame(() => draw(drawables))
}

const cubeDefinition = [
  [-5, -5, 1],[-5, 5, 1],
  [-5, -5, 1],[ 5,-5, 1],
  [ 5, -5, 1],[ 5, 5, 1],
  [ 5,  5, 1],[-5, 5, 1]
];

//Too lazy to write this, too from:
//https://stackoverflow.com/a/48694670/4777865
function multiplyMatrix (A, B) {
    var result = new Array(A.length).fill(0).map(row => new Array(B[0].length).fill(0));

    return result.map((row, i) => {
        return row.map((val, j) => {
            return A[i].reduce((sum, elm, k) => sum + (elm*B[k][j]) ,0)
        })
    })
}

//Could use destructuring, but codepen complains about it
const scale = R.curry((coords, matrix) => {
  const {x, y} = R.merge({x:1, y:1}, coords);
  const scaleMatrix = [
    [x,0,0],
    [0,y,0],
    [0,0,1]
  ];
  
  return multiplyMatrix(matrix, scaleMatrix);
});

//Could use destructuring, but codepen complains about it
const translate = R.curry((coords, matrix) => {
  const {x, y} = R.merge({x:1, y:1}, coords);
  const translateMatrix = [
    [1, 0, 0],
    [0, 1, 0],
    [x, y, 1]
  ];
  
  return multiplyMatrix(matrix, translateMatrix);
});

//Could use destructuring, but codepen complains about it
const shear = R.curry((coords, matrix) => {
  const {x, y} = R.merge({x:0, y:0}, coords);
  const shearMatrix = [
    [1, x, 0],
    [y, 1, 0],
    [0, 0, 1]
  ];
  
  return multiplyMatrix(matrix, shearMatrix);
});

//Could use destructuring, but codepen complains about it
const rotate = R.curry((degrees, matrix) => {
  const O = degrees/PI;
  const rotateMatrix = [
    [ Math.cos(O), Math.sin(O), 0],
    [-Math.sin(O), Math.cos(O), 0],
    [           0,           0, 1]
  ];
  
  return multiplyMatrix(matrix, rotateMatrix);
});


canvas.addEventListener('mousemove', function(evt) {
    mousePos = getMousePos(canvas, evt); 
}, false);


window.requestAnimationFrame(() => draw([
  {
    rotation: 0,
    currentScale: 1,
    currentShear: 0,
    translationX: 1,
    translationY: 1,
    //Directions
    shearGrow: 1,
    scaleGrow: 1,
    translationDirectionX: 1,
    translationDirectionY: 1,
    draw(ctx, canvas){
      if(this.rotation > 360 || this.rotation < 0){
        this.rotation = 0
      }

      if(this.currentScale >= 2 || this.currentScale <= 1){
        this.scaleGrow *= -1;        
      }
      
      if(this.currentShear >= 0.5 || this.currentShear <= -0.5){
        this.shearGrow *= -1;
      }
      
      this.currentScale +=  0.01 *this.scaleGrow;
      this.rotation     +=  0.01;
      this.currentShear += (0.005 * this.shearGrow);
      this.translationX += (0.01 * this.translationDirectionX);
      this.translationY += (0.01 * this.translationDirectionY);
      
      // original cube
      //drawPointMatrix(ctx, canvas, cubeDefinition);
      
      const scaled = scale({x:this.currentScale, y: this.currentScale});
      const sheared = shear({x: this.currentShear, y: this.currentShear});
      const rotated = rotate(this.rotation);
      //I do think that this is just perspective and not translation
      const translated = translate({x: mousePos[0], y:mousePos[1]});

      const allAtOnce = R.pipe(
        scaled, rotated, sheared, translated
      )(cubeDefinition);
      
      drawPointMatrix(ctx, canvas, allAtOnce);
      //drawPointMatrix(ctx, canvas, translated(cubeDefinition));
      //drawPointMatrix(ctx, canvas, scaled(cubeDefinition));
      //drawPointMatrix(ctx, canvas, sheared(cubeDefinition));
      //drawPointMatrix(ctx, canvas, rotated(cubeDefinition));
    }
  },
]))