//Special thanks to 'https://thoughtbot.com/blog/pong-clone-in-javascript' for the lesson in creating a pong clone!
var animate=window.requestAnimationFrame||window.webkitRequestAnimationFrame/*Chrome (Edge too?)*/||window.mozRequestAnimationFrame/*Firefox*/||function(callback){window.setTimeout(callback, 1000/60)};//60FPS
var canvas=document.createElement('canvas'); //whip up a quick canvas
var width=400;
var height=600;
canvas.width=width;
canvas.height=height;
var context=canvas.getContext('2d'); //it's a two dimensional canvas
window.onload=function(){
  document.body.appendChild(canvas);
  animate(step);
  scoreInit();
};
var step=function() {//this function keeps everything running properly
  update();
  render();
  animate(step);
};
var update=function() {
  player.update();
  computer.update(ball);
  ball.update(player.paddle, computer.paddle);
};
var render = function() {
  context.fillStyle="#d1d0ff";
  context.fillRect(0, 0, width, height);
};
function scoreInit(){//I wrote this one from scratch, turned out ok. Saves to localStorage for persistent scorekeeping.
  var playerOutput="Player Score: ";
  var computerOutput="Computer Score: ";
  var pscore=localStorage.pscore;
  var cscore=localStorage.cscore;
  if((pscore==null || pscore=='') && (cscore==null || cscore=='')){
    pscore = 0;
    cscore = 0;
    playerOutput+=pscore;
    computerOutput+=cscore;
    localStorage.pscore=pscore;
    localStorage.cscore=cscore;
  }
  else{
    playerOutput+=pscore;
    computerOutput+=cscore;
    localStorage.pscore=pscore;
    localStorage.cscore=cscore;
  }
  document.getElementById("player").innerHTML=playerOutput;
  document.getElementById("comp").innerHTML=computerOutput;
}
function playerscore(){
  var score = localStorage.pscore;
  score++;
  document.getElementById("player").innerHTML="Player Score: "+score;
  localStorage.pscore=score;
}
function compscore(){
  var score = localStorage.cscore;
  score++;
  document.getElementById("comp").innerHTML="Computer Score: "+score;
  localStorage.cscore=score;
}
function Paddle(x, y, width, height){ //define paddle as an object
  this.x=x;
  this.y=y;
  this.width=width;
  this.height=height;
  this.x_speed=0;
  this.y_speed=0;
}

Paddle.prototype.render=function(){
  context.fillStyle="#000000";
  context.fillRect(this.x, this.y, this.width, this.height);
}
function Player(){ //Create a paddle for you to use
  this.paddle=new Paddle(175,580,50,10);
}
function Computer(){//And one for the computer
  this.paddle=new Paddle(175,10,50,10);
}
Player.prototype.render=function(){
  this.paddle.render();
};
Computer.prototype.render=function(){
  this.paddle.render();
};
function Ball(x,y){
  this.x=x;
  this.y=y;
  this.x_speed=0;
  this.y_speed=3;
  this.radius=5;
}
Ball.prototype.render=function(){
  context.beginPath();
  context.arc(this.x,this.y,this.radius,2*Math.PI,false);
  context.fillStyle="#FF0000";
  context.fill();
};

var player = new Player();
var computer = new Computer();
var ball=new Ball(200,300);

var render = function(){
  context.fillStyle="#d1d0ff";
  context.fillRect(0, 0, width, height);
  player.render();
  computer.render();
  ball.render();
};

Ball.prototype.update=function(paddle1, paddle2){
  this.x+=this.x_speed;
  this.y+=this.y_speed;
  var top_x=this.x - 5;
  var top_y=this.y - 5;
  var bottom_x=this.x + 5;
  var bottom_y=this.y + 5;
  if(this.x - 5 < 0){ //hits left wall
    this.x = 5;
    this.x_speed = -this.x_speed;
  }
  else if(this.x + 5 > 400){ //hits right wall
    this.x = 395;
    this.x_speed = -this.x_speed;
  }

  if(this.y < 0 || this.y > 600){ //Somebody Scored!
    if(this.y < 0){
      playerscore();//Sweet
    }
    else{
      compscore(); //that damn AI! haha
    }
    this.x_speed=0;
    this.y_speed=3;
    this.x=200;
    this.y=300;
  }
  if(top_y > 300){
    if(top_y < (paddle1.y + paddle1.height) && bottom_y > paddle1.y && top_x < (paddle1.x + paddle1.width) && bottom_x > paddle1.x) { //if it hits the player's paddle logic
      this.y_speed = -3;
      this.x_speed += (paddle1.x_speed / 2);
      this.y += this.y_speed;
    }
  }
  else {
    if(top_y < (paddle2.y + paddle2.height) && bottom_y > paddle2.y && top_x < (paddle2.x + paddle2.width) && bottom_x > paddle2.x) { //Computer paddle logic
      this.y_speed = 3;
      this.x_speed += (paddle2.x_speed / 2);
      this.y += this.y_speed;
    }
  }
};

var keysDown = {};
window.addEventListener("keydown", function(event){
  keysDown[event.keyCode] = true;
});
window.addEventListener("keyup", function(event){
  delete keysDown[event.keyCode];
});

Player.prototype.update = function(){
  for(var key in keysDown){
    var value = Number(key);
    if(value == 37) { //left arrow key
      this.paddle.move(-4, 0);
    }
    else if (value == 39) { //right arrow key
      this.paddle.move(4, 0);
    }
    else{
      this.paddle.move(0, 0);
    }
  }
};

Paddle.prototype.move = function(x, y){
  this.x += x;
  this.y += y;
  this.x_speed = x;
  this.y_speed = y;
  if(this.x < 0) { //at the left edge
    this.x = 0;
    this.x_speed = 0;
  }
  else if (this.x + this.width > 400) { //at the right edge
    this.x = 400 - this.width;
    this.x_speed = 0;
  }
}

Computer.prototype.update = function(ball) {
  var x_pos = ball.x;
  var diff = -((this.paddle.x + (this.paddle.width / 2)) - x_pos);
  if (diff < 0 && diff < -4) { //max speed left --Gotta slow it down somehow
    diff = -5;
  }
  else if (diff > 0 && diff > 4) { //max speed right
    diff = 5;
  }
  this.paddle.move(diff, 0);
  if (this.paddle.x < 0) {
    this.paddle.x = 0;
  }
  else if (this.paddle.x + this.paddle.width > 400){
    this.paddle.x = 400 - this.paddle.width;
  }
};
