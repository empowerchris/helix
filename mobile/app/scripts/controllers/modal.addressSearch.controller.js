'use strict';

angular.module('helix.controllers')
  .controller('ModalAddressSearchCtrl', function ($scope, $timeout, $http, $ionicLoading, Api, utils, $cordovaDialogs) {
    $scope.loading = false;
    $scope.searchQ = {
      query: ''
    };

    $scope.selected = false;

    $http.get(Api.endpoint + '/api/addresses')
      .then(function (response) {
        var addresses = response.data;

        if (addresses.length) {
          var items = [];

          for (var i = 0; i < addresses.length; i++) {
            items.push({
              icon: 'ion-ios-clock-outline',
              description: addresses[i].easypost.address.company,
              subtitle: utils.formattedAddressFromEasypostObject(addresses[i].easypost.address),
              easypost: addresses[i].easypost
            });
          }

          $scope.suggestions = [{
            title: 'From your history',
            items: items,
          }];
        }
      }, function (err) {
        console.error(err);
      });

    var googleAddressType = [''];

    $scope.search = function (addressType) {
      $scope.searching = true;
      $scope.focus = true;
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
          if (status === 'OK') {
            $scope.$apply(function () {
              $scope.results = list;
              $scope.loading = false;
            });
          } else {
            $scope.$apply(function () {
              $scope.results = [];
              $scope.loading = false;
            });
          }
        });
    }

    $scope.$watch('searchQ.query', function (query) {
      if (!query) return;
      getResultsForQuery(query);
    });

    var placesService;

    $timeout(function () {
      var map = document.getElementById('map');
      placesService = new google.maps.places.PlacesService(map);
    }, 1);

    $scope.selectLocation = function (item) {
      $scope.searching = false;

      if (!item) {
        $scope.addressType = 'manual';
        return $scope.selected = {
          address_1: $scope.searchQ.query
        };
      }

      placesService.getDetails({
        placeId: item.place_id
      }, function callback(place, status) {
        if (status == google.maps.places.PlacesServiceStatus.OK) {
          $scope.$apply(function () {
            $scope.selected = {
              place: place
            };

            if ($scope.addressType !== 'residential') {
              $scope.selected.name = place.name;
            }

            var components = place.formatted_address.split(', ');
            $scope.selected.address_1 = components[0];
            $scope.selected.city = components[1];
            $scope.selected.postcode = components[2].split(' ')[1];
            $scope.selected.state = components[2].split(' ')[0];
          });
        }
      });
    };

    $scope.save = function () {
      $ionicLoading.show({
        template: "<ion-spinner class='spinner-energized'></ion-spinner><br>Verifying address..."
      });

      $http.post(Api.endpoint + '/api/addresses/verify', $scope.selected)
        .then(function (response) {
          console.log(response);
          $ionicLoading.hide();
          $scope.select({
            description: response.data.easypost.address.company,
            subtitle: utils.formattedAddressFromEasypostObject(response.data.easypost.address),
            easypost: response.data.easypost
          });
        }, function (err) {
          $ionicLoading.hide();
          console.error(err);
          return $cordovaDialogs.alert(err.data.message || 'Please verify the address provided.', 'Error validating address', 'OK');
        });
    }
  });

