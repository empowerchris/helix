'use strict';

angular.module('helixApp')
  .controller('MainCtrl', function ($scope, $window) {
    console.log('main');
    $scope.loginOauth = function(provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
