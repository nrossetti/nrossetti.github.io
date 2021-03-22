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