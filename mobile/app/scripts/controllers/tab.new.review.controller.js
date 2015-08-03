'use strict';

angular.module('helix.controllers')
  .controller('NewReviewCtrl', function ($scope, $localStorage, $state) {
    $scope.title = 'Review Order';

    $scope.storage = $localStorage;

    var pickupDate = new Date($scope.storage.arrivalDate);
    pickupDate.setDate(pickupDate.getDate() - $scope.storage.shippingMethod.days);
    $scope.pickupDate = pickupDate;

    $scope.formatHour = function(n) {
      if (n < 12) {
        return n + ' AM';
      } if (n === 12) {
        return n + ' PM';
      } else {
        return n - 12 + ' PM';
      }
    };

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
      $state.go('tab.new-done');
    }
  });
