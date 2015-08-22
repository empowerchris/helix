'use strict';

angular.module('helix.controllers')
  .controller('AccountConnectedCtrl', function ($scope, $ionicModal, $ionicLoading, $timeout, Api, $http, Auth) {
    $scope.endpoint = Api.endpoint;

    function loadConnectedAccounts() {
      $scope.loading = true;
      Auth.updateCurrentUser().$promise.then(function (user) {
        $scope.loading = false;
        $scope.userId = user._id;
        $scope.concur = user.concur;
      });
    }

    $scope.$on('$ionicView.enter', function () {
      loadConnectedAccounts();
    });

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
      loadConnectedAccounts();
      $scope.modal.hide();
    };
  });
