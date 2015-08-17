'use strict';

angular.module('helix.controllers')
  .controller('LoginCtrl', function ($scope, Auth, $location, $ionicLoading) {
    $scope.user = {};
    $scope.errors = {};

    $scope.login = function (form) {
      $scope.submitted = true;

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Signing in..."
      });

      //if (form.$valid) {
      Auth.login({
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function () {
        $ionicLoading.hide();
        // Logged in, redirect to home
        $location.path('/tab/new');
      }).catch(function (err) {
        $ionicLoading.hide();
        $scope.errors.other = err.message;
      });
      //}
    };

    $scope.loginOauth = function (provider) {
      $window.location.href = '/auth/' + provider;
    };
  });
