angular.module('helix.controllers')
  .controller('LocationSearchCtrl', function ($scope) {
    $scope.loading = false;

    $scope.placeholder = 'Enter pickup address';

    $scope.searchQuery = '';

    $scope.selectedPlace = null;

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    var geocoder = new google.maps.Geocoder();

    $scope.$watch('searchQuery', function (query) {
      if (!query) return;
      if (query.length < 3) return;

      $scope.loading = true;

      var req = {};
      req.address = query;

      geocoder.geocode(req, function (results, status) {
        $scope.loading = false;

        if (status == google.maps.GeocoderStatus.OK) {
          $scope.$apply(function () {
            $scope.suggestions = results;
            console.log(results);
          });
        } else {
          // TODO: Figure out what to do when the geocoding fails
          console.error(status);
        }
      });
    });

    $scope.selectLocation = function (location) {
      $scope.selectedPlace = location;
    }
  });
