'use strict';

angular.module('helix.controllers')
  .controller('TripsDetailCtrl', function ($scope, $stateParams, $cordovaDialogs, $http, Api, utils) {
    $scope.formatAddress = function(address) {
      return utils.formattedAddressFromEasypostObject(address);
    };

    $scope.$on('$ionicView.enter', function () {
      $scope.loading = true;
      $http.get(Api.endpoint + '/api/trips/' + $stateParams.id)
        .then(function (response) {
          $scope.loading = false;
          $scope.trip = response.data;
        }, function (err) {
          console.error(err);
          $scope.loading = false;
          $cordovaDialogs.alert(err.data.message || err.data || 'Something went wrong. Please try again.', 'Error', 'OK');
        });
    });
  });
