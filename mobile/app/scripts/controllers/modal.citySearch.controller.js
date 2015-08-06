'use strict';

angular.module('helix.controllers')
  .controller('ModalCitySearchCtrl', function ($scope, $rootScope) {
    $scope.loading = false;

    $scope.suggestions = $scope.data.suggestions;

    var autocompleteService = new google.maps.places.AutocompleteService();

    function getResultsForQuery(query) {
      if (!autocompleteService) return;
      $scope.loading = true;

      autocompleteService.getPlacePredictions({
          input: query,
          types: ['(cities)'],
          componentRestrictions: {
            country: 'us'
          }
        },
        function listentoresult(list, status) {
          if (status === 'OK') {
            $scope.$apply(function () {
              $scope.results = list;
              $scope.loading = false;
            });
          }
        });
    }

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    var unregister = $scope.$watch('searchQuery', function (query) {
      if (!query) return;

      getResultsForQuery(query);
    });

    $scope.selectCity = function (location) {
      unregister();
      $scope.modal.hide();
      $scope.selectCity(location);
    };
  });

