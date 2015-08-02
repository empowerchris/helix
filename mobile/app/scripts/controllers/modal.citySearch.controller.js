angular.module('starter.controllers')
  .controller('ModalCitySearchCtrl', function ($scope, $rootScope) {
    $rootScope.$broadcast('defaultStatusBar');

    $scope.loading = false;

    $scope.cancel = function () {
      $rootScope.$broadcast('blueStatusBar');
      $scope.modal.hide();
    };

    var autocompleteService = new google.maps.places.AutocompleteService();

    $scope.$watch('searchQuery', function (query) {
      if (!query) return;

      getResultsForQuery(query);
    });

    function getResultsForQuery(query) {
      $scope.loading = true;

      autocompleteService.getPlacePredictions({
          input: query,
          types: ['(cities)'],
          componentRestrictions: {country: 'us'}
        },
        function listentoresult(list, status) {
          if (list !== null && list.length !== 0) {
            $scope.$apply(function () {
              $scope.results = list;
              $scope.loading = false;
            });
          }
        });
    }

    getResultsForQuery('a');

    $scope.selectLocation = function (location) {
      $scope.selectedPlace = location;
    }
  });

