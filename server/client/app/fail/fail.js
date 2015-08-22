'use strict';

angular.module('helixApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('fail', {
        url: '/fail',
        templateUrl: 'app/fail/fail.html',
        controller: 'FailCtrl'
      });
  });