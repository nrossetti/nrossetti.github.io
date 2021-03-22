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