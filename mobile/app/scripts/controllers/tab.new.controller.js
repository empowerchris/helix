"use strict";

angular.module('starter.controllers')
  .controller('NewCtrl', function($scope, $ionicModal, $rootScope) {
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
