'use strict';

angular.module('cakeApp')
  .controller('PlayCtrl', function ($scope, game) {

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

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

    $scope.start = function() {
        game.start(canvas);
    };
});
