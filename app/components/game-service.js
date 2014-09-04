'use strict';

angular.module('cakeApp')
  .service('game', function game() {

    // Initial state while resources are loading
    // 'loading' -> 'idle' -> 'running' -> 'idle' | 'game over' | 'win' 
    var state = 'loading';
    var foes, lastTime;
    var cvs;

    // After loading resources. Transition to a ready state.
    var reset = function() {
        state = 'idle';
        foes = [];
        lastTime = Date.now();
    };

    // Start a new game (abandon any ongoing game)
    var start = function (canvas) {
        reset();
        cvs = canvas;
        state = 'running'; 
        gameLoop();
    };

    // Game logic
    var updateGameState = function (dt) {
        console.log('Update!');
    };

    // Render current game state
    var render = function () {
        var bgImg = resources.get('play/img/bg.png');
        var foeImg = resources.get('play/img/foe.png');
        var cakeImg = resources.get('play/img/cake.png');

        var context = cvs.getContext('2d');

        // Allways paint everything (to make things easy)
        context.drawImage(bgImg, 0, 0);
        
        for (var i = 0; i < foes.length; ++i) {
            context.drawImage(foeImg,  foes[i].x - foeImg.width / 2.0,  foes[i].y - foeImg.height / 2.0);
        }

        // Score
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText('State: ' + state, 10, 25);
    };

    // The main game loop
    var gameLoop = function () {
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
        foes.push({'x': x, 'y': y});
    };

    // Load images
    resources.load([
        'play/img/bg.png',
        'play/img/cake.png',
        'play/img/foe.png'
    ]);
    resources.onReady(function() { reset(); });

    return {
        start: start,
        reset: reset,
        state: state,
        click: click 
    };

  });
