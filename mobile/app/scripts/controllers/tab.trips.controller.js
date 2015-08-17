'use strict';

angular.module('helix.controllers')
  .controller('TripsCtrl', function ($scope, Auth, Api, $cordovaDialogs, $http) {
    $scope.$on('$ionicView.enter', function () {
      $scope.loading = true;
      $http.get(Api.endpoint + '/api/trips/')
        .then(function (response) {
          $scope.loading = false;
          $scope.trips = response.data;
        }, function (err) {
          console.error(err);
          $scope.loading = false;
          $cordovaDialogs.alert(err.data.message || err.data || 'Something went wrong. Please try again.', 'Error', 'OK');
        });
    });
  });
