'use strict';

angular.module('cakeApp')
  .controller('PlayCtrl', function ($scope, game) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var scale = Math.min(1, window.innerWidth / 640, window.innerHeight / 480);

    var stateObserver = function(state) {
      if (state === 'idle' || state === 'game over') {
        $scope.ctrlButton = 'Spela';
      }
      else if (state === 'running') {
        $scope.ctrlButton = 'Tillbaka';
      }
      $scope.$apply();
    };

    $scope.ctrlButton = 'Loading Game';
    game.regStateObserver(stateObserver);

    if (game.state() !== 'loading') {
      game.reset();
    }

    function getMousePos(canvas, e) {
      var rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    };

    canvas.addEventListener('mousedown', function(e) {
      if (game.state() === 'idle' || game.state() === 'game over') {
        // Click canvas to start game
        game.start(canvas, scale);
      }
      else {
        // In game, forward mouse events
        var mousePos = getMousePos(canvas, e);
        game.click(mousePos.x, mousePos.y);
      }
    }, false);

    // Configure canvas
    canvas.width = 640 * scale;
    canvas.height = 480 * scale;
    context.globalAlpha = 1.0;
    context.beginPath();

    // The idle canvas background
    var img = new Image();
    img.onload = function() { drawStartImg(); };
    img.src = 'play/img/start.png';
    var drawStartImg = function() {
      context.drawImage(img, 0, 0, img.width * scale, img.height * scale);
    }

    $scope.playCtrl = function() {
      if (game.state() === 'idle' || game.state() === 'game over') {
        game.start(canvas, scale);
      }
      else if (game.state() === 'running') {
        game.reset();
        drawStartImg();
      }
    };
  });
