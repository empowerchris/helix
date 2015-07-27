angular.module('helix.controllers')
  .controller('TimeSelectionCtrl', function ($scope) {
    $scope.date = Date.now();

    $scope.cancel = function () {
      $scope.modal.hide();
    };
  });
