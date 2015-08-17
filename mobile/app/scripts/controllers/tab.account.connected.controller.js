'use strict';

angular.module('helix.controllers')
  .controller('AccountConnectedCtrl', function ($scope, $ionicModal, $ionicLoading, $timeout) {
    $scope.concur = {
      connected: false
    };

    $scope.connectConcur = function() {
      $ionicModal.fromTemplateUrl('templates/modal-connect-concur.html', {
        scope: $scope,
        animation: 'slide-in-up',
        focusFirstInput: true
      }).then(function (modal) {
        $scope.modal = modal;
        $scope.modal.show();
      });
    };

    $scope.cancel = function() {
      $scope.modal.hide();
    };

    $scope.concurSignIn = function() {
      $ionicLoading.show({
        template: '<ion-spinner class=\'spinner-energized\'></ion-spinner><br>Signing in...'
      });
      $timeout(function() {
        $scope.modal.hide();
        $ionicLoading.hide();
        $scope.concur.connected = true;
      }, 1500);
    };
  });
