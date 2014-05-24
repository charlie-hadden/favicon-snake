;(function(window) {
    /**
     * Enumeration of the different directions the snake can travel.
     * @type {Direction}
     */
    var Direction = {
        UP: [0, -1],
        DOWN: [0, 1],
        LEFT: [-1, 0],
        RIGHT: [1, 0]
    };

    /**
     * Pre-HTML5 compatible version of document.head.
     * @type {Element}
     */
    var head = document.head || document.getElementsByTagName('head')[0];

    /**
     * Constructor for a new game of snake.
     * @param {Element}        [element]
     * @param {Array.<number>} [code]
     */
    function Snake(element, code) {
        // Create and set up the canvas
        this.canvas = document.createElement('canvas');
        this.canvas.width = 16;
        this.canvas.height = 16;
        this.canvas.style.display = 'none';
        document.body.appendChild(this.canvas);

        // 2D context for drawing
        this.ctx = this.canvas.getContext('2d');

        // Initial snake
        this.positions = [[5, 5], [4, 5], [3, 5]];
        this.dir = Direction.RIGHT;
        this.lastDir = Direction.RIGHT;

        // Timer and position of food
        this.foodTimer = 3;
        this.foodPos = false;

        // The code for activating the game
        this.code = code || [38, 38, 40, 40, 37, 39, 37, 39, 66, 65];
        this.codeProgress = 0;

        // Register the keydown event
        var self = this;
        element = element || document;
        element.addEventListener('keydown', function(evnt) {
            self.input.call(self, evnt);
        });
    }

    /**
     * Sets the interval to keep the game running.
     * @param {integer} [speed] - The time between updates in milliseconds.
     */
    Snake.prototype.start = function(speed) {
        // Make sure we have a speed to use
        speed = speed || 500;

        // The interval that keeps the main loop ticking
        var self = this;
        this.interval = window.setInterval(function() {
            self.tick.call(self);
        }, speed);
    };

    /**
     * Clears the interval to stop the game from updating.
     */
    Snake.prototype.gameOver = function() {
        window.clearInterval(this.interval);
    };

    /**
     * Handles keydown events sent to the element given when creating the game.
     * @param {KeyboardEvent} evnt
     */
    Snake.prototype.input = function(evnt) {
        // Progress through the code with each correct keypress
        if (event.keyCode == this.code[this.codeProgress]) {
            ++this.codeProgress;
        } else {
            this.codeProgress = 0;
        }

        // Start the game when the whole code has been entered
        if (this.codeProgress === this.code.length && !this.interval) {
            this.start();
        }

        if (this.interval) {
            if (evnt.keyCode === 38 && this.lastDir !== Direction.DOWN) {
                this.dir = Direction.UP;
            }
            if (evnt.keyCode === 40 && this.lastDir !== Direction.UP) {
                this.dir = Direction.DOWN;
            }
            if (evnt.keyCode === 37 && this.lastDir !== Direction.RIGHT) {
                this.dir = Direction.LEFT;
            }
            if (evnt.keyCode === 39 && this.lastDir !== Direction.LEFT) {
                this.dir = Direction.RIGHT;
            }
        }
    };

    /**
     * Handles a single cycle of the game (update, draw, present).
     */
    Snake.prototype.tick = function() {
        this.update();
        this.draw();
        this.present();
    };

    /**
     * Runs the logic to update the game state.
     */
    Snake.prototype.update = function() {
        // Save the last position - used for making sure we can't turn back
        this.lastDir = this.dir;

        // Place the new head
        var head = [
            this.positions[0][0] + this.dir[0],
            this.positions[0][1] + this.dir[1]
        ];
        this.positions.unshift(head);

        // Check the head is in bounds
        if (head[0] < 0 || head[0] >= 16 || head[1] < 0 || head[1] >= 16) {
            this.gameOver();
        }

        // Check if we're eating
        if (this.foodPos && head[0] === this.foodPos[0]
                && head[1] === this.foodPos[1]) {
            this.foodTimer = 5;
            this.foodPos = false;
        } else {
            // Remove the last part of the tail
            this.positions.pop();
        }

        // Check if we've hit ourselves
        for (var i = 1; i < this.positions.length; ++i) {
            if (head[0] === this.positions[i][0]
                    && head[1] === this.positions[i][1]) {
                this.gameOver();
            }
        }

        // Check if we can spawn any food yet
        if (this.foodTimer-- === 0) {
            // Count up the clear squares
            var clear = 16 * 16 - this.positions.length;

            // Get a random position
            var index = Math.floor(Math.random() * (clear - 1));

            // Convert index to (x, y) coords
            this.foodPos = [index % 16, (index / 16) >> 0];
        }
    };

    /**
     * Draws the game to a canvas which can later be copied to the favicon.
     */
    Snake.prototype.draw = function() {
        // Clear the background
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, 16, 16);

        // Draw any food we may have
        if (this.foodPos) {
            this.ctx.fillStyle = '#F00';
            this.ctx.fillRect(this.foodPos[0], this.foodPos[1], 1, 1);
        }

        // Draw each section of the snake
        this.ctx.fillStyle = '#FFF';
        for (var i = 0; i < this.positions.length; ++i) {
            this.ctx.fillRect(this.positions[i][0], this.positions[i][1], 1, 1);
        }
    };

    /**
     * Displays the canvas as a favicon.
     */
    Snake.prototype.present = function() {
        // Remove an exisiting favicon (if added by this instance)
        if (this.favicon) {
            head.removeChild(this.favicon);
        }

        // Create and add the new favicon
        this.favicon = document.createElement('link');
        this.favicon.rel = 'shortcut icon';
        this.favicon.href = this.canvas.toDataURL();
        head.appendChild(this.favicon);
    };

    window.Snake = Snake;
})(window);

var snake = new Snake();