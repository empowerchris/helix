'use strict';

angular.module('helix.controllers')
  .controller('NewDoneCtrl', function ($scope, $rootScope) {
    $scope.title = 'Order Placed';

    $rootScope.$broadcast('incrementBadge', 1);
  });
