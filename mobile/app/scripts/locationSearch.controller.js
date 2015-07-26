angular.module('helix.controllers')
  .controller('LocationSearchCtrl', function ($scope) {
    $scope.placeholder = 'Enter pickup location';

    $scope.searchQuery = '';

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.$watch('searchQuery', function (val) {
      $scope.suggestions = [];
    })
  });
