(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
/*global module*/

module.exports = {

    /**
     * Create a new cookie
     */
    create : function (name, value, days) {
      var d = new Date();
      d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
      var expires = "expires=" + d.toGMTString();
      //'secure', subdomain '.'?
      document.cookie = name + "=" + value + "; " + expires;
    },
  
    /**
     * Read an existing cookie
     * @param name
     * @returns {*}
     */
    read : function (name) {
      name = name + "=";
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].trim();
        if (cookie.indexOf(name) === 0) {
          return cookie.substring(name.length, cookie.length);
        }
      }
      return false;
    },
  
    /**
     * Remove an existing cookie
     * @param name
     */
    remove : function(name) {
      this.create(name,"",-1);
    }
  };
},{}],2:[function(require,module,exports){
var cookie = require('./cookie');

/**
 * game Object
 */
var game = function (options) {
    this.started = false;
    this.disabled = false;
    this.score = 0;
    this.settings = $.extend({ inst: false }, options);
    this.inst = this.settings.inst;

    if (!this.inst) {
        throw new Error("A Game Instance Must Be Supplied");
    }

    this.ui = {
        canvas: $('#canvas'),
        currentScore: $('#score'),
        userScore: $('#highScore')
    };

    this.key = {
        user: this.inst.name + '_user'
    };

    this.$canvas = this.inst.$canvas;
    this.updateScore();
    this.bindEvents();
};

/**
 * Initialize game
 */
game.prototype.start = function () {
    this.started = true;
    this.inst.start();
};

/**
 * Bind Events
 */
game.prototype.bindEvents = function () {
    $(document).on('keydown', this.onKeydown.bind(this));
    $(window).on('resize', this.onResize.bind(this));

    this.inst.onRestart = this.onGameRestart.bind(this);
    this.inst.onScore = this.onGameScore.bind(this);
};

/**
 * Play game
 */
game.prototype.play = function () {
    this.started = true;
    this.inst.play();
};

/**
 * Pause game
 */
game.prototype.pause = function () {
    this.started = false;
    this.inst.pause();
};

/**
 * Display canvas and start game
 */
game.prototype.enableGame = function () {
    this.disabled = false;
    this.$canvas.show();
    this.play();
};

/**
 * Hide canvas and pause Game
 */
game.prototype.disableGame = function () {
    this.disabled = true;
    this.$canvas.hide();
    this.pause();
};

/**
 *  Save score in cookie
 */
game.prototype.saveGame = function (score) {
    var highScore = cookie.read(this.key.user) || 0;
    if (!highScore || (highScore && score > highScore)) {
        try{
        cookie.create(this.key.user, score);
        }catch(error){
            console.log(error);
        }
    }
};

/**
 * Update scoreboard
 */
game.prototype.updateScore = function (score) {
    this.updateScoreUI(score || 0);
    this.ui.userScore.text(cookie.read(this.key.user) || '000');
};

/**
 * Update score on screen
 */
game.prototype.updateScoreUI = function (score) {
    this.ui.currentScore.text(score.toString().padStart(3, '0'));
};

/**
 * On Game Score
 */
game.prototype.onGameScore = function (score) {
    this.updateScoreUI(score);
};

/**
 * Restart Current Game
 */
game.prototype.onGameRestart = function (score) {
    this.saveGame(score);
    this.updateScore();
};

/**
 * Toggle Game Session
 */
game.prototype.toggleGame = function () {
    if (this.disabled) {
        this.enableGame();
    } else {
        this.disableGame();
    }
};

/**
 * Handle Window Resize
 */
game.prototype.onResize = function () {
    if (typeof this.inst.onResize === 'function') {
        this.inst.onResize(window.innerHeight, window.innerWidth);
    }
};

/**
 * Handle KeyDown Events
 * @param event
 */
game.prototype.onKeydown = function (event) {
    switch (event.keyCode) {
        case 38:
            this.inst.queueDirection(this.inst.DIRECTIONS.UP);
            break;
        case 40:
            this.inst.queueDirection(this.inst.DIRECTIONS.DOWN);
            break;
        case 37:
            this.inst.queueDirection(this.inst.DIRECTIONS.LEFT);
            break;
        case 39:
            this.inst.queueDirection(this.inst.DIRECTIONS.RIGHT);
            break;
        case 82: //r
            this.inst.restart();
            break;
        case 32: //space
            if (!this.disabled) {
                if (this.started) {
                    this.pause();
                } else {
                    this.play();
                }
            }
            break;
    }
};

module.exports = game;
},{"./cookie":1}],3:[function(require,module,exports){
//Game Container
var game = require('./game');
//Snake Game
var snake = require('./snake');

var snakeGame= {
  /**
   * Initialize a new Game
   */
  currentGame : new game({
    inst : new snake()
  }),

  /**
   * Start Game and Bind Window Events
   */
   start : function (options) {
    if (options) {
      snakeGame.currentGame.inst.setOptions(options);
    }

    snakeGame.currentGame.start();
    snakeGame.bindEvents();
  },

  /**
   * Bind Window Events
   */
   bindEvents : function () {
    if (this.currentGame.started) {
      //Pause Game on Window Blur
      $(window)
        .focus(function() {
          if (this.currentGame.started) {
            this.currentGame.play.bind(this.currentGame);
          }
        }.bind(this))
        .blur(function() {
          if (this.currentGame.started) {
            this.currentGame.pause.bind(this.currentGame);
          }
        }.bind(this));
    }
  }
};

//Handle Module Exports
if (typeof module !== 'undefined' && !window) {
  //Export to NODE
  module.exports = ResponsiveSnake;
} else if (typeof window !== 'undefined') {
  //Export To Browser
  window.snakeGame = snakeGame;
}
},{"./game":2,"./snake":4}],4:[function(require,module,exports){
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
},{}]},{},[3]);
