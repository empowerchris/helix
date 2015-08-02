"use strict";

angular.module('helix.controllers')
  .controller('NewPlacesCtrl', function($scope, $ionicModal) {
    $scope.openSearchCityModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };
  });
