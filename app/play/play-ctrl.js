'use strict';

angular.module('cakeApp')
  .controller('PlayCtrl', function ($scope, game) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    $scope.ctrlButton = 'Spela';
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
      var mousePos = getMousePos(canvas, e);
      console.log('Mouse Down! @' + mousePos.x + ';' + mousePos.y);
      game.click(mousePos.x, mousePos.y);
    }, false);

    // Configure canvas
    canvas.width = 640;
    canvas.height = 480;
    context.globalAlpha = 1.0;
    context.beginPath();

    // The idle canvas background
    var img = new Image();
    img.onload = function() { drawStartImg(); };
    img.src = 'play/img/start.png';
    var drawStartImg = function() {
      context.drawImage(img, 0, 0);
    }

    $scope.playCtrl = function() {
      if (game.state() === 'idle') {
        $scope.ctrlButton = 'Tillbaka';
        game.start(canvas);
      }
      else if (game.state() === 'running' || game.state() === 'game over') {
        $scope.ctrlButton = 'Spela';
        game.reset();
        drawStartImg();
      }
    };
  });
