'use strict';

angular.module('cakeApp')
  .controller('PlayCtrl', function ($scope) {

    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    $scope.foes = [];

    var drawSprite = function(s) {
        context.beginPath();
        context.arc(100, 200, 10, 0, 2*Math.PI, false);
        context.fillStyle = "#ccddff";
        context.fill();
        context.lineWidth = 1;
        context.strokeStyle = "#666666";
        context.stroke();
    };

    // setup
    canvas.width = 640;
    canvas.height = 480;
    context.globalAlpha = 1.0;
    context.beginPath();
    drawSprite(true);
});
