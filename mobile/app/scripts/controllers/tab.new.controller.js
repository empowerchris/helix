'use strict';

angular.module('helix.controllers')
  .controller('NewCtrl', function ($scope, $ionicModal, $rootScope, $state, $localStorage, $location) {
    $rootScope.$broadcast('blueStatusBar');

    $scope.openSearchCityModal = function () {
      $ionicModal.fromTemplateUrl('templates/modal-city-search.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: false
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.selectCity = function (location) {
      console.log('Selected city', location);
      $localStorage.city = location;
      $rootScope.$broadcast('defaultStatusBar');
      //$location.path('tab/newplaces');

      $state.go('tab.new-places');
    };
  });
