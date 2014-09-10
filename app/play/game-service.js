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
    var stateObserver;
    var scale;

    // After loading resources. Transition to a ready state.
    var reset = function() {
      setState('idle');
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
    var start = function (canvas, scale_) {
      reset();
      cvs = canvas;
      scale = scale_;
      setState('running');
      gameLoop();
    };

    var getState = function() {
      return state;
    };

    var setState = function(s) {
      state = s;
      if (stateObserver !== undefined) {
        stateObserver(state);
      }
    };

    var regStateObserver = function(o) {
      stateObserver = o;
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
      var FOE_PADDING = 20 * scale; // px
      var MIN_FOE_TIME = 0.5; // s
      var COLLISION_DIST = Math.max(15, 30 * scale); // px
      var CAT_LIFETIME = 4.0; // s
      var FOE_LIFETIME = 4.0; // s
      var FOE_STRIKE_TIME = 1.0; // s
      var CAKE_LIFETIME = 0.5; // s
      var FOE_CAKED_TIME = 0.5; // s
      var NO_FOE_IMGS = 9;

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

            // Is this the first time we find a collission for this foe?
            if (!foes[fi].collision) {
              if (foes[fi].type === 'foe') {
                score += 1;
              }
              else if (foes[fi].type === 'cat') {
                score = Math.floor(score / 2);
              }
            }

            cakes[ci].collision = true;
            foes[fi].collision = true;
            foes[fi].collisionTime = gameTime;
          }
        }
      }

      // Foe strikes you
      for (var i = 0; i < foes.length; ++i) {
        if (foes[i].type === 'foe' && foes[i].collision !== true && foes[i].strike !== true &&
            (gameTime - foes[i].createdTime) > FOE_LIFETIME) {
          foes[i].strike = true;
          power -= 1;
        }
      }

      // Remove the collided objects
      arrayRemoveIf(foes, function(v) {
        return v.collision === true && (gameTime - v.collisionTime) > FOE_CAKED_TIME;
      });
      arrayRemoveIf(cakes, function(v) { return v.collision === true; });

      // Remove old cakes
      arrayRemoveIf(cakes, function(v) { return (gameTime - v.launchTime) > CAKE_LIFETIME; });

      // Remove surviving (striking) foes
      arrayRemoveIf(foes, function(v) {
        return v.type === 'foe' && (gameTime - v.createdTime) > (FOE_LIFETIME + FOE_STRIKE_TIME);
      });

      // Remove surviving cats
      arrayRemoveIf(foes, function(v) {
        return v.type === 'cat' && (gameTime - v.createdTime) > CAT_LIFETIME;
      });

      // Check termination
      if (power <= 0) {
        setState('game over');
      }

      // Adding enemies. Faster and faster, but not faster than MIN_FOE_TIME
      if((gameTime - lastFoe) > MIN_FOE_TIME && Math.random() < (1 - Math.pow(.995, gameTime + 2))) {

        var ENEMY_POS = [{x: 113, y: 370, z: 1},
                         {x: 215, y: 366, z: 1},
                         {x: 318, y: 365, z: 1},
                         {x: 422, y: 366, z: 1},
                         {x: 524, y: 370, z: 1},

                         {x: 121, y: 323, z: 2},
                         {x: 222, y: 320, z: 2},
                         {x: 318, y: 319, z: 2},
                         {x: 417, y: 320, z: 2},
                         {x: 517, y: 323, z: 2},

                         {x: 130, y: 288, z: 3},
                         {x: 225, y: 286, z: 3},
                         {x: 318, y: 285, z: 3},
                         {x: 413, y: 286, z: 3},
                         {x: 507, y: 288, z: 3}];
        for (var i = 0; i < ENEMY_POS.length; ++i) {
          ENEMY_POS[i].x *= scale;
          ENEMY_POS[i].y *= scale;
        }

        lastFoe = gameTime;
        var i = Math.floor(Math.random() * ENEMY_POS.length);
        var newPos = ENEMY_POS[i];

        var type = Math.random() < 0.1 ? 'cat' : 'foe';

        if (type === 'foe') {
          var foeImg = Math.floor(Math.random() * NO_FOE_IMGS);
        }

        // Don't add in the score text area and don't add on top of another foe
        if (!arrayCollision(foes, newPos, COLLISION_DIST)) {
          foes.push({pos: newPos, createdTime: gameTime, type: type, img: foeImg});
        }
      }
    };

    var drawImg = function(img, x, y) {
      var context = cvs.getContext('2d');
      context.drawImage(img, x, y, img.width * scale, img.height * scale);
    };

    // Render current game state
    var render = function () {
      var FOE_IMG_WIDTH = 64 * scale;
      var FOE_IMG_HEIGHT = 64 * scale;

      var context = cvs.getContext('2d');

      var bgImg = resources.get('play/img/bg.png');
      var catImg = resources.get('play/img/cat.png');
      var cakedImg = resources.get('play/img/caked.png');
      var foeImgs = [resources.get('play/img/foe-borg.png'),
                     resources.get('play/img/foe-fredrik.png'),
                     resources.get('play/img/foe-carl.png'),
                     resources.get('play/img/foe-annie.png'),
                     resources.get('play/img/foe-goran.png'),
                     resources.get('play/img/foe-jan.png'),
                     resources.get('play/img/foe-jimmie.png'),
                     resources.get('play/img/foe-stefan.png'),
                     resources.get('play/img/foe-jonas.png')];
      var strikeImg = resources.get('play/img/strike.png');
      var cakeImg = resources.get('play/img/cake.png');

      // Background (always re-paint everything)
      drawImg(bgImg, 0, 0);

      // Enemies
      for (var z = 3; z > 0; --z) {
        for (var i = 0; i < foes.length; ++i) {
          if (foes[i].pos.z !== z) {
            continue;
          }

          var imgX = foes[i].pos.x - FOE_IMG_WIDTH / 2.0;
          var imgY = foes[i].pos.y - FOE_IMG_HEIGHT / 2.0;

          if (foes[i].type === 'foe') {
            var foeImg = foeImgs[foes[i].img];
            drawImg(foeImg, imgX, imgY);
            if (foes[i].strike === true) {
              drawImg(strikeImg, imgX, imgY);
            }
            else if (foes[i].collision === true) {
              drawImg(cakedImg, imgX, imgY);
            }
          }
          else if (foes[i].type === 'cat') {
            drawImg(catImg, imgX, imgY);
            if (foes[i].collision === true) {
              drawImg(cakedImg, imgX, imgY);
            }
          }
        }
      }


      if (state === 'game over') {
        var gameOverImg = resources.get('play/img/gameover.png');
        drawImg(gameOverImg, 0, 0);

        context.font = 'bold 18pt Copperplate';
        context.fillStyle = 'black';
        context.fillText('Poäng: ' + score.toString(), 260, 460);
        return;
      }

      // Cakes
      for (var i = 0; i < cakes.length; ++i) {
        var imgX = cakes[i].pos.x - cakeImg.width / 2.0;
        var imgY = cakes[i].pos.y - cakeImg.height / 2.0;
        drawImg(cakeImg, imgX, imgY);
      }

      // Score
      var fontSize = Math.round(18 * scale);
      context.font = 'bold ' + fontSize + 'pt Copperplate';
      context.fillStyle = 'black';
      context.fillText('Poäng:', 340 * scale, 460 * scale);
      context.fillText(score.toString(), 440 * scale, 460 * scale);
      context.fillText('Kraft:', 180 * scale, 460 * scale);
      context.fillText(power.toString(), 270 * scale, 460 * scale);
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

    // Load images
    resources.load([
      'play/img/bg.png',
      'play/img/gameover.png',
      'play/img/cake.png',
      'play/img/caked.png',
      'play/img/strike.png',
      'play/img/foe-borg.png',
      'play/img/foe-fredrik.png',
      'play/img/foe-carl.png',
      'play/img/foe-annie.png',
      'play/img/foe-goran.png',
      'play/img/foe-jan.png',
      'play/img/foe-jimmie.png',
      'play/img/foe-stefan.png',
      'play/img/foe-jonas.png',
      'play/img/cat.png'
    ]);
    resources.onReady(function() { reset(); });

    return {
      start: start,
      reset: reset,
      state: getState,
      regStateObserver: regStateObserver,
      click: click
    };
  });
