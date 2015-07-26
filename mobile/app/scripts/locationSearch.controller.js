angular.module('helix.controllers')
  .controller('LocationSearchCtrl', function ($scope) {
    $scope.placeholder = 'Enter pickup address';

    $scope.searchQuery = '';

    $scope.cancel = function () {
      $scope.modal.hide();
    };

    var geocoder = new google.maps.Geocoder();
    var service = new google.maps.places.PlacesService(null);

    $scope.$watch('searchQuery', function (query) {
      if (!query) return;
      if (query.length < 3);

      var req = {};
      req.address = query;

      geocoder.geocode(req, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $scope.$apply(function () {
            $scope.suggestions = results;

            /*for (var i = 0; i < results.length; i++) {
              console.log(results[i]);

              service.getDetails({
                placeId: results[i].place_id
              }, function (place, status) {
                if (status == google.maps.places.PlacesServiceStatus.OK) {
                  console.log(place);
                }
              });
            }*/

          });
        } else {
          // @TODO: Figure out what to do when the geocoding fails
        }
      });
    })
  });
