'use strict';

angular.module('helix.controllers')
  .controller('SignupCtrl', function ($scope, Auth, $location, $ionicLoading, Api) {
    $scope.user = {};
    $scope.errors = {};

    $scope.register = function (form) {
      $scope.submitted = true;

      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Signing up..."
      });

      //if(form.$valid) {
      Auth.createUser({
        name: $scope.user.name,
        phone: $scope.user.phone,
        email: $scope.user.email,
        password: $scope.user.password
      }).then(function () {
        $ionicLoading.hide();
        // Account created, redirect to home
        $location.path('/tab/new');
      }).catch(function (err) {
        $ionicLoading.hide();
        err = err.data;
        $scope.errors = {};

        // Update validity of form fields that match the mongoose errors
        angular.forEach(err.errors, function (error, field) {
          form[field].$setValidity('mongoose', false);
          $scope.errors[field] = error.message;
        });
      });
      //}
    };

    $scope.loginOauth = function (provider) {
      $window.location.href = Api.endpoint + '/auth/' + provider;
    };
  });
