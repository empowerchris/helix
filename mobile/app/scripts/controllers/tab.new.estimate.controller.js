'use strict';

angular.module('helix.controllers')
  .controller('NewEstimateCtrl', function ($scope, $state, $localStorage, $ionicLoading, $timeout) {
    $scope.title = 'Your Order';
    $scope.storage = $localStorage;

    $scope.cards = [{
      id: 1,
      type: 'visa',
      last4: '3325',
      name: 'Personal'
    }, {
      id: 2,
      type: 'mastercard',
      last4: '4457',
      name: 'Work'
    }];

    $scope.selectedCard = $scope.cards[0];

    $scope.pay = function() {
      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Processing payment..."
      });
      $timeout(function() {
        $ionicLoading.hide();
        $state.go('tab.new-done');
      }, 3500);
    };

    $scope.next = function() {
      $state.go('tab.new-review');
    };
  });
