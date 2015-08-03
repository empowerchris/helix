'use strict';

angular.module('helix.controllers')
  .controller('NewDoneCtrl', function ($scope, $rootScope, $state) {
    $scope.title = 'Order Placed';

    $rootScope.$broadcast('incrementBadge', 1);

    $scope.restart = function() {
      $state.go('tab.new');
    };
  });
