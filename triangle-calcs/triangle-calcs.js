/**
 * Created by gabriel.rohden on 24/10/2016.
 */
const canvas = document.getElementById("angle");
const ctx = canvas.getContext("2d");
const {PI, abs} = Math;
const fontSize = 15;

canvas.width = document.body.offsetWidth;
canvas.height = window.innerHeight*0.95;

let lastClick = [];
let lastAngle = 0;

/**
 * Calcules the angle, width, height, hypotenuse and others.
 * @param {Number} xi - initial x position
 * @param {Number} yi - initial y position
 * @param {Number} xf - final x position
 * @param {Number} yf - final Y position
 * */
function triangleMaths(xi, yi, xf, yf){
    const width = xf - xi;
    const height = yi - yf;
    const hypotenuse = Math.sqrt((height**2)+(width**2));
    const angle = Math.atan(height/width);

    return {width, height, hypotenuse, angle};
}

let shouldDrawTriangle = false;

canvas.onmousemove = function onmove(e){
    if(shouldDrawTriangle) {
        drawTriangle(e);
    }
};
//Onclick will register the start point
canvas.onmousedown = function ondown ({clientX, clientY}) {
    lastClick = [clientX, clientY];
    shouldDrawTriangle = true;
};
//On drag end will register last point
canvas.onmouseup = function onup () {
    shouldDrawTriangle = false;    
};

canvas.addEventListener('touchstart', function (event) {
  event.preventDefault();
  canvas.onmousedown(event.touches[0]);
}, false);

canvas.addEventListener('touchmove', function (event) {
  event.preventDefault();
  canvas.onmousemove(event.touches[0]);
}, false);

canvas.addEventListener('touchend', function (event) {
  event.preventDefault();
  canvas.onmouseup(event.touches[0]);
}, false);


function drawTriangle(event){
  const [lastX, lastY] = lastClick;
  const {clientX: currentX, clientY: currentY} = event;
  
  const triangle = triangleMaths(lastX, lastY, currentX, currentY);
  const angleDiff = lastAngle - triangle.angle;


  ctx.beginPath();
  //Init the canvas
  ctx.rect(0, 0, canvas.width, canvas.height);
  //Paint bg
  ctx.fillStyle = "white";
  ctx.fill();
  
  /*--------------*\
      Lines draw.
  \*--------------*/
  //width
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, lastY);

  //height
  ctx.moveTo(currentX, event.clientY);
  ctx.lineTo(currentX, lastY);

  //hypotenuse TODO: maybe call close path.
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(currentX, currentY);
  
  //Make the lines appear
  ctx.stroke();

  //Radius is just my choice, i should get a better calc for this.
  const circleRadius = abs(triangle.width/2);
  let text;

  ctx.beginPath();

  /*-----------------*\
    Four circle parts
  \*-----------------*/
  const drawAngleCircleArc = (x, y) => ctx.arc(lastX, lastY, circleRadius, x, y);
  
  // 0 to 90
  if(triangle.width > 0 && triangle.height > 0){
      text = triangle.angle * (180/PI);
      drawAngleCircleArc(-triangle.angle, 0);
  }
  // 90 to 180
  if (triangle.width > 0 && triangle.height < 0){
      text = 360 + triangle.angle * (180/PI);
      drawAngleCircleArc(0, -triangle.angle);
  }
  //180 to 270
  if (triangle.width < 0 && triangle.height < 0){
      text = 180 + triangle.angle * (180/PI);
      drawAngleCircleArc(PI - triangle.angle, -PI);   
  }
  //270 to 360
  if (triangle.width < 0 && triangle.height > 0){
      text = 270 - triangle.angle * (180/PI);
      drawAngleCircleArc(PI, PI - triangle.angle);
  }
  
  //Finish the circle.
  ctx.lineTo(lastX, lastY);
  
  /*------------*\
      Text Draw
  \*------------*/

  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = "black";
  //Width
  ctx.fillText(`Width: ${abs(triangle.width)}`, lastX + (triangle.width/2), lastY + fontSize);
  //Height
  ctx.fillText(`Height: ${abs(triangle.height)}`, event.clientX, lastY - (triangle.height/2));
  
  //Angle and others
  ctx.fillText("Angle diff:" + angleDiff * (180/PI), 0, 20);
  ctx.fillText("Last angle was:" + lastAngle*(180/PI), 0, 20 + fontSize);
  lastAngle =  triangle.angle;
  
  //To rotate the text we need to rotate the whole context/canvas
  ctx.save(); //We save the unrotated canvas.
  //Hypotenuse
  //set the 0,0 coordenates to the point we want
  ctx.translate(lastX + (triangle.width/2) - fontSize, currentY + (triangle.height/2) - fontSize); 
  ctx.textAlign = 'center';
  //rotate
  ctx.rotate(-triangle.angle);
  //draw the text on "0,0" (wich was translated to x,y)
  ctx.fillText("Hypotenuse :" + triangle.hypotenuse.toFixed(2), 0, 0);

  //Restore to unrotated canvas at real 0,0
  ctx.restore();
  
  //Angle text
  ctx.fillText(text.toFixed(2), lastX + fontSize + fontSize, lastY - fontSize);
  ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
  ctx.fill();
  ctx.stroke();
}
