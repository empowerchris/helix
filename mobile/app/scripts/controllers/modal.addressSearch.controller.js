'use strict';

angular.module('helix.controllers')
  .controller('ModalAddressSearchCtrl', function ($scope, $rootScope) {
    $scope.loading = false;
    $scope.searchQ = {
      query: ''
    };

    $scope.suggestions = [{
      title: 'From your history',
      items: [{
        icon: 'ion-ios-clock-outline',
        description: 'Trump International Hotel Las Vegas',
        subtitle: '2000 Fashion Show Dr, Las Vegas, NV 89109, United States',
        place_id: 'ChIJVTPokywQkFQRmtVEaUZlJRA'
      }, {
        icon: 'ion-ios-clock-outline',
        description: '1 Infinite Loop, Cupertino, CA 95014, USA',
        subtitle: '',
        place_id: 'ChIJmQdYUK8L9ocRN63SN2-JktY'
      }]
    }];

    var googleAddressType = [''];

    $scope.search = function (addressType) {
      $scope.searching = true;
      $scope.addressType = addressType;

      if (addressType === 'residential') {
        $scope.searchText = 'Enter full address';
        googleAddressType = ['address'];
      } else if (addressType === 'hotel') {
        $scope.searchText = 'Enter hotel name and city';
        googleAddressType = ['establishment'];
      } else if (addressType === 'business') {
        $scope.searchText = 'Enter business name and city';
        googleAddressType = ['establishment'];
      }
    };

    var autocompleteService = new google.maps.places.AutocompleteService();

    function getResultsForQuery(query) {
      if (!autocompleteService) return console.error('autocompleteService not available.');
      $scope.loading = true;

      if ($scope.addressType === 'hotel') {
        query = query + ' hotel';
      }

      autocompleteService.getPlacePredictions({
          input: query,
          types: googleAddressType,
          componentRestrictions: {
            country: 'us'
          }
        },
        function listentoresult(list, status) {
          console.log(list);

          if (status === 'OK') {
            $scope.$apply(function () {
              $scope.results = list;
              $scope.loading = false;
            });
          }
        });
    }

    $scope.$watch('searchQ.query', function (query) {
      if (!query) return;
      getResultsForQuery(query);
    });
  });

