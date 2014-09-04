'use strict';

/**
 * @ngdoc overview
 * @name cakeApp
 * @description
 * # cakeApp
 *
 * Main module of the application.
 */
angular
  .module('cakeApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/play', {
        templateUrl: 'play/play.tpl.html',
        controller: 'PlayCtrl'
      })
      .when('/about', {
        templateUrl: 'about/about.tpl.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/play'
      });
  });
