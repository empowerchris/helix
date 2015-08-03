'use strict';

angular.module('helix.controllers')
  .controller('ModalCitySearchCtrl', function ($scope, $rootScope) {
    $rootScope.$broadcast('defaultStatusBar');
    $scope.loading = false;

    var autocompleteService = new google.maps.places.AutocompleteService();

    function getResultsForQuery(query) {
      if (!autocompleteService) return;
      $scope.loading = true;

      autocompleteService.getPlacePredictions({
          input: query,
          types: ['(cities)'],
          componentRestrictions: {country: 'us'}
        },
        function listentoresult(list, status) {
          if (list !== null && list.length > 0) {
            $scope.$apply(function () {
              $scope.results = list;
              $scope.loading = false;
            });
          }
        });
    }

    $scope.cancel = function () {
      $rootScope.$broadcast('blueStatusBar');
      $scope.modal.hide();
    };

    $scope.$watch('searchQuery', function (query) {
      if (!query) return;

      getResultsForQuery(query);
    });

    $scope.selectLocation = function (location) {
      $scope.modal.hide();
      $scope.selectCity(location);
    }
  });

