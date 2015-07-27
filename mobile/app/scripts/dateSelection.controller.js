angular.module('helix.controllers')
  .controller('DateSelectionCtrl', function ($scope) {
    $scope.date = Date.now();

    $scope.cancel = function () {
      $scope.modal.hide();
    };
  });
