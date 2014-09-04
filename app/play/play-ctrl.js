'use strict';

angular.module('cakeApp')
  .controller('PlayCtrl', function ($scope) {

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
        $scope.foes.push(mousePos);
    }, false);

    var newGame = function () {
        $scope.then = Date.now();
        $scope.foes = [];
        $scope.phase = 'running';
        gameLoop();
    };

    var update = function (dt) {
        console.log('Update!');
    };

    var render = function () {
        context.drawImage(resources.get('play/img/bg.png'), 0, 0);

        var foeImg = resources.get('play/img/foe.png');
        for (var i = 0; i < $scope.foes.length; ++i) {
            // TODO: Sub half w/h
            context.drawImage(foeImg, $scope.foes[i].x, $scope.foes[i].y);
        }

        // Score
        context.font = '18pt Calibri';
        context.fillStyle = 'black';
        context.fillText('fubar..', 10, 25);
    };

    // The main game loop
    var gameLoop = function () {
        var now = Date.now();
        var dt = (now - $scope.then) / 1000.0;

        update(dt);
        render();

        $scope.then = now;
        if ($scope.phase === 'running')
            requestAnimationFrame(gameLoop);
        // else, handle game over etc.
    };

    // Configure canvas
    canvas.width = 640;
    canvas.height = 480;
    context.globalAlpha = 1.0;
    context.beginPath();

    // Load images
    resources.load([
        'play/img/bg.png',
        'play/img/cake.png',
        'play/img/foe.png'
    ]);
    resources.onReady(newGame);

});
