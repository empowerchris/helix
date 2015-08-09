'use strict';

angular.module('helix', [
  'ionic',
  'helix.controllers',
  'helix.services',
  'helix.directives',
  'ngCordova',
  'ngStorage',
  'uiGmapgoogle-maps',
  'mp.datePicker',
  'angular-momentjs',
  'angular.filter'
])

  .run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
      if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
        cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        cordova.plugins.Keyboard.disableScroll(true);
      }

      if (window.StatusBar) {
        StatusBar.overlaysWebView(true);
      }
    });
  })

  .config(function ($stateProvider, $urlRouterProvider) {

    // Ionic uses AngularUI Router which uses the concept of states
    // Learn more here: https://github.com/angular-ui/ui-router
    // Set up the various states which the app can be in.
    // Each state's controller can be found in controllers.js
    $stateProvider

      // setup an abstract state for the tabs directive
      .state('tab', {
        url: '/tab',
        abstract: true,
        controller: 'TabsCtrl',
        templateUrl: 'templates/tabs.html'
      })

      // Each tab has its own nav history stack:
      .state('tab.new', {
        url: '/new',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new.html',
            controller: 'NewCtrl'
          }
        }
      })

      .state('tab.new-shipping', {
        url: '/new/shipping',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-shipping.html',
            controller: 'NewShippingCtrl'
          }
        }
      })

      .state('tab.new-estimate', {
        url: '/new/estimate',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-estimate.html',
            controller: 'NewEstimateCtrl'
          }
        }
      })


      .state('tab.new-done', {
        url: '/new/done',
        views: {
          'tab-new': {
            templateUrl: 'templates/tab-new-done.html',
            controller: 'NewDoneCtrl'
          }
        }
      })

      .state('tab.account', {
        url: '/account',
        views: {
          'tab-account': {
            templateUrl: 'templates/tab-account.html',
            controller: 'AccountCtrl'
          }
        }
      })

      .state('tab.trips', {
        url: '/trips',
        views: {
          'tab-trips': {
            templateUrl: 'templates/tab-trips.html',
            controller: 'TripsCtrl'
          }
        }
      })

      .state('tab.trips.details', {
        url: '/detail',
        views: {
          'tab-trips': {
            templateUrl: 'templates/tab-trips-detail.html',
            controller: 'TripsDetailCtrl'
          }
        }
      });
    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/tab/new');
  });
