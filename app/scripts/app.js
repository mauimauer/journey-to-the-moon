'use strict';

angular.module('journeyToTheMoonApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngRoute',
  'journeyToTheMoonApp.services',
  'journeyToTheMoonApp.directives'
])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
