angular.module('helix.controllers')
  .controller('LocationSearchCtrl', function ($scope, ngGPlacesAPI) {
    $scope.placeholder = 'Enter pickup location';

    $scope.searchQuery = '';

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    $scope.$watch('searchQuery', function (val) {
      $scope.suggestions = [];

      ngGPlacesAPI
        .textSearch({
          query: val
        }).then(
        function (data) {
          console.log(data);
          $scope.suggestions = data;
        });
    })
  });
