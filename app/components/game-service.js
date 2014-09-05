'use strict';

angular.module('cakeApp')
  .service('game', function game() {

    // Initial state while resources are loading
    // 'loading' -> 'idle' -> 'running' -> 'idle' | 'game over'
    var state = 'loading';
    var foes, lastFoe;
    var cakes;
    var clicks;
    var lastTime, gameTime;
    var score, power;
    var cvs;

    // After loading resources. Transition to a ready state.
    var reset = function() {
        state = 'idle';
        foes = [];
        clicks = []; // unprocessed user input
        cakes = [];
        gameTime = 0;
        lastFoe = 0;
        score = 0;
        power = 3;
        lastTime = Date.now();
    };

    // Start a new game (abandon any ongoing game)
    var start = function (canvas) {
        reset();
        cvs = canvas;
        state = 'running';
        gameLoop();
    };

    var arrayRemoveIf = function(array, pred, onRemoved) {
        var i = array.length;
        while (i--) {
            if (pred(array[i])) {
                if (onRemoved !== undefined) {
                    onRemoved(array[i]);
                }

                array.splice(i, 1);
            }
        }
    };

    var collision = function(pos1, pos2, dist) {
        return Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2) < Math.pow(dist, 2);
    };

    var arrayCollision = function(array, pos, dist) {
        for (var i = 0; i < array.length; ++i) {
            if (collision(array[i].pos, pos, dist)) {
                return true;
            }
        }
        return false;
    };

    // Game logic
    var updateGameState = function (dt) {
        var FOE_PADDING = 20; // px
        var MIN_FOE_TIME = 0.5; // s
        var COLLISION_DIST = 20; // px
        var FOE_LIFETIME = 4.0; // s
        var CAKE_LIFETIME = 0.5; // s
        var FOE_CAKED_TIME = 0.5; // s

        console.log('Update!');
        gameTime += dt;

        // Process user input
        while(clicks.length){
            var pos = clicks.pop();
            cakes.push({pos: pos, launchTime: gameTime, collision: false});
        }

        // Collision detection
        for (var ci = 0; ci < cakes.length; ++ci) {
            for (var fi = 0; fi < foes.length; ++fi) {
                if (collision(cakes[ci].pos, foes[fi].pos, COLLISION_DIST)) {
                    console.log('Collision');
                    cakes[ci].collision = true;
                    foes[fi].collision = true;
                    foes[fi].collisionTime = gameTime;
                    score += 1;
                }
            }
        }

        // Remove the colided objects
        arrayRemoveIf(foes, function(v) { 
            return v.collision === true && (gameTime - v.collisionTime) > FOE_CAKED_TIME; 
        });
        arrayRemoveIf(cakes, function(v) { return v.collision === true; });

        // Remove old cakes
        arrayRemoveIf(cakes, function(v) { return (gameTime - v.launchTime) > CAKE_LIFETIME; });

        // Remove surviving foes
        arrayRemoveIf(foes,
            function(v) { return (gameTime - v.createdTime) > FOE_LIFETIME; },
            function(v) { power -= 1; });

        // Check termination
        if (power <= 0) {
            state = 'game over';
        }

        // Adding enemies. Faster and faster, but not faster than MIN_FOE_TIME
        if((gameTime - lastFoe) > MIN_FOE_TIME && Math.random() < (1 - Math.pow(.995, gameTime + 2))) {
            lastFoe = gameTime;
            console.log("Adding foe");
            var x = Math.random() * (canvas.width - 2.0 * FOE_PADDING) + FOE_PADDING;
            var y = Math.random() * (canvas.height - 2.0 * FOE_PADDING) + FOE_PADDING;
            var newPos = {x: x, y: y};

            // Don't add in the score text area and don't add on top of another foe
            if ((x > 100 || y > 70) && !arrayCollision(foes, newPos, COLLISION_DIST)) {
                foes.push({pos: newPos, createdTime: gameTime});
            }
        }
    };

    // Render current game state
    var render = function () {
        var context = cvs.getContext('2d');

        if (state === 'game over') {
            var gameOverImg = resources.get('play/img/gameover.png');
            context.drawImage(gameOverImg, 0, 0);
            return;
        }

        var bgImg = resources.get('play/img/bg.png');
        var foeImg = resources.get('play/img/foe.png');
        var foeCakedImg = resources.get('play/img/foe-caked.png');
        var cakeImg = resources.get('play/img/cake.png');

        // Background (allways re-paint everything)
        context.drawImage(bgImg, 0, 0);
        
        // Enemies
        for (var i = 0; i < foes.length; ++i) {
            var imgX = foes[i].pos.x - foeImg.width / 2.0;
            var imgY = foes[i].pos.y - foeImg.height / 2.0;
            
            if (foes[i].collision === true) {
                context.drawImage(foeCakedImg, imgX, imgY);
            }
            else {
                context.drawImage(foeImg, imgX, imgY);
            }
        }

        // Cakes
        for (var i = 0; i < cakes.length; ++i) {
            var imgX = cakes[i].pos.x - cakeImg.width / 2.0;
            var imgY = cakes[i].pos.y - cakeImg.height / 2.0;
            context.drawImage(cakeImg, imgX, imgY);
        }

        // Score
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText('Poäng:', 10, 25);
        context.fillText(score.toString(), 90, 25);
        context.fillText('Kraft:', 10, 50);
        context.fillText(power.toString(), 90, 50);
    };

    // The main game loop
    var gameLoop = function () {
        if (state !== 'running') {
            // Short circuit to prevent running the queued loop after reset
            return;
        }

        var now = Date.now();
        var dt = (now - lastTime) / 1000.0;

        updateGameState(dt);
        render();

        lastTime = now;
        if (state === 'running')
            requestAnimationFrame(gameLoop);
        // else, handle game over etc.
    };

    var click = function(x, y) {
        if (state !== 'running')
            return;

        // Enqueue for processing
        clicks.push({x: x, y: y});
    };

    var getState = function() {
        return state;
    };

    // Load images
    resources.load([
        'play/img/bg.png',
        'play/img/gameover.png',
        'play/img/cake.png',
        'play/img/foe-caked.png',
        'play/img/foe.png'
    ]);
    resources.onReady(function() { reset(); });

    return {
        start: start,
        reset: reset,
        state: getState,
        click: click 
    };

  });
