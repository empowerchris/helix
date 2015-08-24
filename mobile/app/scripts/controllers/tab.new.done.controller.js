'use strict';

angular.module('helix.controllers')
  .controller('NewDoneCtrl', function ($scope, $rootScope, $state, $localStorage, utils) {
    $scope.title = 'Order Placed';

    $scope.trip = $localStorage.trip;

    $rootScope.$broadcast('incrementBadge', 1);

    $scope.formatAddress = function(address) {
      return utils.formattedAddressFromEasypostObject(address);
    };

    $scope.restart = function() {
      delete $localStorage.trip;
      delete $localStorage.travel;
      delete $localStorage.pickup;
      delete $localStorage.dropoff;
      delete $localStorage.bags;

      $state.go('tab.new');
    };
  });
