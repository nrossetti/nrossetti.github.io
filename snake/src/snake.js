/**
 * food object
 */
function food(options) {
  this.options = options || {};
  this.width = this.options.width ? this.options.width : 10;
  this.x = this.options.x ? this.options.x : 0;
  this.y = this.options.y ? this.options.y : 0;
}

/**
 * Draw food on canvas
 */
food.prototype.draw = function (context) {
  context.fillStyle = "#445948";
  context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
};

/**
 * piece object
 */
 function piece(options) {
    this.options = options || {};
    this.width = this.options.width ? this.options.width : 10;
    this.x = this.options.x ? this.options.x : 0;
    this.y = this.options.y ? this.options.y : 0;
  }
  
  /**
   * Update position
   */
  piece.prototype.updatePosition = function (x, y) {
    this.x = x;
    this.y = y;
  };
  
  /**
   * Draw piece on canvas
   */
  piece.prototype.draw = function (context) {
    context.fillStyle = "#445948";
    context.fillRect(this.x * this.width, this.y * this.width, this.width, this.width);
  };

/**
* Snake Game
*/
var snake = function(options) {

 this.score = 0;
 this.started = false;
 this.fps = 10;

 this.$canvas = $("canvas");
 this.canvas = this.$canvas[0];
 this.context = this.canvas.getContext('2d');

 if (this.$canvas.data('full-screen')) {
   this.canvas.width = window.innerWidth;
   this.canvas.height = window.innerHeight;
 }

 this.pieces = [];
 this.food = [];

 this.settings = $.extend({
   snakePixels    : 14,
   snakeSize      : 3,
   timeout        : 4000,
 }, options);

 this.DIRECTIONS = {
   UP   : 0,
   DOWN : 2,
   LEFT  : 1,
   RIGHT : 3
 };

 this.direction = this.DIRECTIONS.RIGHT;
 this.directionQueue = [];

}

snake.prototype.setOptions = function(options) {
    $.extend(this.settings, options);
  };

/**
* Start Snake Game
*/
snake.prototype.start = function() {
 this.started = true;
 this.create();
 this.createFood();
 this.play();
};

/**
* Reset Game Session Variables
*/
snake.prototype.reset = function() {
 this.started = false;
 this.score = 0;
 this.directionQueue = [];
 this.direction = this.DIRECTIONS.RIGHT;
 this.pieces = [];
 this.food = [];
 this.fps = 10;

 if (this.animationTimeout) {
   clearTimeout(this.animationTimeout);
 }
};

/**
* Restart Game
*/
snake.prototype.restart = function () {
 if (typeof this.onRestart === 'function') {
   this.onRestart(this.score);
 }
 this.reset();
 this.start();
};

/**
* Resume/Play Game
*/
snake.prototype.play = function() {
 this.started = true;
 if (typeof this.animationLoop === 'function') {
   this.animationLoop();
 }
};

/**
* Pause Current Game
*/
snake.prototype.pause = function() {
 this.started = false;
};

/**
* Lose Current Game
*/
snake.prototype.lose = function() {
 this.pause();
 this.context.clearRect(0, 0,  this.canvas.width,  this.canvas.height);
 this.context.font = "30px nokiafc22";
 this.context.fillStyle = "#445948";
 this.context.textAlign = "center";
 this.context.fillText("GAME OVER!",  this.canvas.width/2,  this.canvas.height/2);
 setTimeout(this.restart.bind(this), this.settings.timeout);
};

/**
* Add Direction To The Direction Queue
*/
snake.prototype.queueDirection = function(direction) {
 //Don't Allow The Same Moves To Stack Up
 if (this.started && this.directionQueue[this.directionQueue.length - 1] !== direction) {
   this.directionQueue.push(direction);
 }
};

/**
* Handle Resize
*/
snake.prototype.onResize = function(height, width) {
 this.canvas.width = width;
 this.canvas.height = height;
};

/**
* Create Snake
*/
snake.prototype.create = function() {
 for (var x = 0; x < this.settings.snakeSize; x++) {
   this.pieces.push(new piece({
     x : 1,
     y : 1,
     width : this.settings.snakePixels
   }));
 }
};

/**
* Create a piece of food
*/
snake.prototype.createFood = function() {
 this.food.push(new food({
   x : Math.round(Math.random() * (this.canvas.width - this.settings.snakePixels) / this.settings.snakePixels),
   y : Math.round(Math.random() * (this.canvas.height - this.settings.snakePixels) / this.settings.snakePixels),
   width : this.settings.snakePixels,
   color : '#fff'
 }));
};

/**
* Get Snake Direction
*/
snake.prototype.getDirection = function () {
 var direction;
 while (typeof direction === 'undefined' || (this.direction - direction + 4) % 4 === 2) {
   if (this.directionQueue.length > 0) {
     //Shift through the Queue
     direction = this.directionQueue.shift();
   }
   else {
     direction = this.direction;
   }
 }
 return direction;
};

/**
* Check if Coordinates Cause Collision
*/
snake.prototype.isWallCollision = function(x,y) {
 var isTopCollision = y === -1,
   isRightCollision = x >= this.canvas.width / this.settings.snakePixels,
   isBottomCollision = y >= this.canvas.height / this.settings.snakePixels,
   isLeftCollision = x === -1;

 return isTopCollision || isRightCollision  || isBottomCollision || isLeftCollision;
};

/**
* Check If "Safe" Collision
*/
snake.prototype.isSelfCollision = function(x,y) {
 for (var i = 0; i < this.pieces.length; i++) {
   if (this.pieces[i].x == x && this.pieces[i].y == y) {
     return true;
   }
 }
 return false;
};

/**
* Check if Food Collision
*/
snake.prototype.isFoodCollision = function(x,y) {
 var found = false;
 this.food.forEach(function(food) {
   if ((x == food.x && y == food.y)) {
     found = true;
   }
 });
 return found;
};

/**
* Remove Piece Of Food
*/
snake.prototype.removeFood = function(x,y) {
 var self = this;
 this.food.forEach(function(food,ix) {
   if ((x == food.x && y == food.y)) {
     self.food.splice(ix);
   }
 });
};

/**
* Score a point and call onScore
*/
snake.prototype.scorePoint = function() {
 this.score++;
 if (this.onScore && typeof this.onScore === 'function') {
   this.onScore(this.score);
 }
};

/**
* Snake Draw Loop
*/
snake.prototype.drawLoop = function() {
 var self = this;

 //Clear Canvas Context Before Redraw
 this.context.setTransform(1, 0, 0, 1, 0, 0);
 this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

 var headX = this.pieces[0].x;
 var headY = this.pieces[0].y;

 //reset direction
 this.direction = this.getDirection();

 switch(this.direction) {
   case this.DIRECTIONS.LEFT:
     headX--;
     break;
   case this.DIRECTIONS.RIGHT:
     headX++;
     break;
   case this.DIRECTIONS.UP:
     headY--;
     break;
   case this.DIRECTIONS.DOWN:
     headY++;
     break;
 }

 if (this.isWallCollision(headX, headY) || this.isSelfCollision(headX, headY)) {
   this.lose();
 }

 if (this.started) {
   var headShift = null;
   var food = this.isFoodCollision(headX, headY);

   if (food) {
     this.scorePoint();
     //Increase Frames Per Second
     if (this.score % 2) {
       this.fps += 0.5;
     }

     if (this.settings.explosion) {
       this.createExplosion(headX, headY, [food.color,food.border]);
     }

     this.removeFood(headX, headY);
     this.createFood();

     //create new snake head
     headShift = new piece({
       x : headX,
       y : headY,
       width : this.settings.snakePixels
     });

   } else {
     //Pop head tail to become new  head
     headShift = this.pieces.pop();
     headShift.updatePosition(headX, headY);
   }
   //move snakeTail to snakeHead
   this.pieces.unshift(headShift);
 }

 //Draw Snake
 this.pieces.forEach(function(piece) {
   piece.draw(self.context);
 });

 //Draw Food
 this.food.forEach(function(food) {
   food.draw(self.context);
 });
};

/**
* Snake Animation Loop
*/
snake.prototype.animationLoop = function() {
 if (this.started) {
   var self = this;
   if (this.animationTimeout) {
     clearTimeout(this.animationTimeout);
   }
   //Ensure FPS
   this.animationTimeout = setTimeout(function() {
     self.drawLoop.call(self);
     window.requestAnimationFrame(self.animationLoop.bind(self));
   }, 1000 / this.fps);
 }
};

module.exports = snake;