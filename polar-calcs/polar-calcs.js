/**
 * Created by gabriel.rohden on 28/11/2016.
 */
const canvas = document.getElementById("polarCanvas");
const ctx = canvas.getContext("2d");
const { PI } = Math;
const fontSize = 15;
const seconds = 1;

let radius = 200;
let angle = PI/3;
let resetRadius = false;
let autoradius = true;
let circleExpansionRate = 1;
let autoangle = true;
let fillStyleBg = 'white';
let coords = [0, 0];
let rippleRadius = 0;
let isCurrentDrawning = false;

function updateCanvasDimensions(canvasElement){
  canvasElement.width = document.body.offsetWidth;
  canvasElement.height = window.innerHeight * 0.8;
}

function drawPolarAxys(yLocation){
    //Polar axys
    ctx.moveTo(0, yLocation);
    ctx.lineTo(canvas.width, yLocation);
}


function draw(){
    updateCanvasDimensions(canvas);
    const halfX = canvas.width/2;
    const halfY = canvas.height/2;

    ctx.beginPath();
    //Init the canvas
    ctx.rect(0, 0, canvas.width, canvas.height);
    //Paint bg
    ctx.fillStyle = fillStyleBg;
    ctx.fill();
  
    /*--------------*\
        Lines draw.
    \*--------------*/
    drawPolarAxys(halfY);
    ctx.moveTo(halfX, halfY);
    const cart = convertPolarToCartesian(radius, angle);
    ctx.lineTo(halfX + cart.x, halfY + cart.y);
  
    //Make the lines appear
    ctx.stroke();
    ctx.closePath();
  
    //Circle
    ctx.beginPath();
    ctx.strokeStyle = "#78909C";
    ctx.arc(halfX, halfY, Math.abs(radius), 0, 2 * PI); 
    ctx.closePath();
    ctx.stroke();
    ctx.strokeStyle = "black";
    
    /*------------*\
        Text Draw
    \*------------*/

    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    //Width
    ctx.fillText("0", halfX, halfY + fontSize);
    //Height
    ripple();
}


function ripple(evt){
    if(!evt){
      if(rippleRadius > 1000 || !isCurrentDrawning){
        isCurrentDrawning = false;
        return rippleRadius = 0;
      }
      
      //Circle
      ctx.beginPath();
      ctx.strokeStyle = "#78909C";
      ctx.arc(coords[0], coords[1], Math.abs(rippleRadius), 0, 2 * Math.PI); 
      ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = "black";
      rippleRadius += 1.5;
    } else {
      coords = [evt.offsetX, evt.offsetY];
      rippleRadius = 0;
      isCurrentDrawning = true;
    }
}

setInterval(function(){
  if (autoangle) {
    angle -= .01 + (PI/180);
  
    if (angle < -360) {
      angle = 0;
    }

    $('#angle').val(angle);
  }
  
  if (autoradius) {
    radius -= (circleExpansionRate + (PI/180)).toFixed(1);
  
    if (radius < -360 || radius > 360) {
      if (resetRadius) {
        radius = 0;        
      } else {
        circleExpansionRate = circleExpansionRate * -1;
      }
    }
    $('#radius').val(radius);
  }
  
  //if(!autoangle && !autoradius) return;
  draw();
},10)

function convertPolarToCartesian(r, angle){
  return {
    x: r * Math.cos(angle),
    y: r * Math.sin(angle)
  }
}

function convertCartesianToPolar(x, y) {
  return {
    r: Math.sqrt(x*x+y*y),
    angle: Math.atan(y/x)
  };
}

function testCalcs () {
  const precision = 10; //already a good precision for js.
  const x = 1;
  const y = Math.sqrt(3);
  const polar = convertCartesianToPolar(x, y);
  const cartesian = convertPolarToCartesian(polar.r, polar.angle)
  if(   cartesian.x.toFixed(precision) === x.toFixed(precision)
     && cartesian.y.toFixed(precision) === y.toFixed(precision) ){
    console.debug("All calcs passing");    
  } else {
    console.error("Some calculations are wrong");
  }
};

testCalcs();

//TODO: to jquery.
document.getElementById("autoradius").onclick = function () {
  autoradius ^= true;
}

document.getElementById("autoangle").onclick = function () {
  autoangle ^= true;
}

$('#polarCanvas').on('click', ripple);

$('#radius').bind('input', function () { 
   radius = $('#radius').val();
   $('#textradius').text = `Radius ${radius}`;
   draw();
});

$('#angle').bind('input', function () {                   
   auto = false;
  
   const val = $('#angle').val();
   angle = -(val) * (PI/180);
   $('#textangle').val(`Angle ${angle}`);
   draw();
});

$("#trace").on('click', function() {
  fillStyleBg = this.checked ?  'rgba(255, 255, 255, .1)' : 'white'
})

$("#resetRadius").on('click',function () {
  resetRadius = this.checked;
})
